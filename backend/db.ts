import neo4j, { Driver, Session, Integer, Config, Neo4jError } from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

/**
 * CognoDB Environment Variables
 */
const COGNODB_URI = process.env.COGNODB_URI || process.env.NEO4J_URI || 'bolt://localhost:7687';
const COGNODB_USERNAME = process.env.COGNODB_USERNAME || process.env.NEO4J_USERNAME || 'cogno';
const COGNODB_PASSWORD = process.env.COGNODB_PASSWORD || process.env.NEO4J_PASSWORD || '';

/**
 * Custom safe Database Error class to ensure no low-level details or credentials leak to the API layer.
 */
export class DatabaseError extends Error {
  public readonly isDatabaseError: boolean = true;
  public readonly code: string;

  constructor(message: string = 'A database error occurred while processing the request.', code: string = 'DATABASE_ERROR') {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Helper function to sanitize connection URIs, queries, and error strings to prevent leaking credentials.
 */
function sanitizeString(str: string): string {
  if (!str) return '';
  // Mask passwords in bolt/neo4j connection URLs (e.g., bolt://user:password@host:port)
  let sanitized = str.replace(/\/\/(.*?):(.*?)@/g, '//$1:***@');
  // Strip plain password occurrences if any
  if (COGNODB_PASSWORD && COGNODB_PASSWORD.length > 2) {
    sanitized = sanitized.split(COGNODB_PASSWORD).join('***');
  }
  return sanitized;
}

/**
 * Singleton Driver Instance
 */
let driverInstance: Driver | null = null;
let isConnected = false;

/**
 * Retrieves or initializes the singleton neo4j-driver instance for CognoDB.
 * Follows the Singleton pattern to maintain a single reusable connection pool.
 *
 * @returns Driver singleton instance or null if URI is missing.
 */
export function getDriver(): Driver | null {
  if (!COGNODB_URI) {
    console.error('[CognoDB Internal Error]: COGNODB_URI environment variable is missing.');
    return null;
  }

  // Return existing singleton driver instance if already created
  if (driverInstance) {
    return driverInstance;
  }

  try {
    const auth = COGNODB_PASSWORD
      ? neo4j.auth.basic(COGNODB_USERNAME, COGNODB_PASSWORD)
      : undefined;

    const config: Config = {
      disableLosslessIntegers: true,
      connectionTimeout: 8000,
      maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
      maxConnectionPoolSize: 50,
      logging: {
        level: 'warn',
        logger: (level, message) => {
          if (level === 'warn' || level === 'error') {
            console.warn(`[CognoDB Internal ${level.toUpperCase()}]:`, sanitizeString(message));
          }
        },
      },
    };

    driverInstance = neo4j.driver(COGNODB_URI, auth, config);
    return driverInstance;
  } catch (err: unknown) {
    const rawError = err instanceof Error ? err.message : String(err);
    console.error('[CognoDB Internal Driver Init Error]:', sanitizeString(rawError));
    return null;
  }
}

/**
 * Creates and returns a new session from the driver singleton.
 */
export function getSession(): Session {
  const driver = getDriver();
  if (!driver) {
    console.error('[CognoDB Internal Error]: Attempted to open session but driver is not available.');
    throw new DatabaseError('Database connection is currently unavailable.', 'CONNECTION_UNAVAILABLE');
  }
  return driver.session();
}

/**
 * Tests the database connection for the /api/health endpoint.
 * Ensures all error handling follows security best practices without leaking credentials or internals.
 *
 * @returns Object with connectivity status and safe message
 */
export async function checkConnectivity(): Promise<{
  connected: boolean;
  message: string;
  database: string;
  error?: string | null;
}> {
  const driver = getDriver();

  if (!driver) {
    isConnected = false;
    console.error('[CognoDB Internal Health Check]: Driver instance could not be initialized.');
    return {
      connected: false,
      database: 'CognoDB',
      message: 'Database connection is not configured or unavailable.',
      error: 'Connection configuration error.',
    };
  }

  let session: Session | null = null;
  try {
    session = driver.session();
    const result = await session.run('RETURN 1 AS alive');
    if (result.records.length > 0) {
      isConnected = true;
      return {
        connected: true,
        database: 'CognoDB',
        message: 'Successfully connected to CognoDB via Bolt protocol.',
      };
    }
    throw new Error('No records returned from probe query.');
  } catch (err: unknown) {
    isConnected = false;
    const rawError = err instanceof Error ? err.message : String(err);
    const errorCode = err instanceof Neo4jError ? err.code : 'UNKNOWN';
    // Log detailed internal diagnostics on the server
    console.error(`[CognoDB Internal Health Probe Error] [Code: ${errorCode}]:`, sanitizeString(rawError));
    
    // Return safe, generic error message to caller
    return {
      connected: false,
      database: 'CognoDB',
      message: 'Unable to establish database connection.',
      error: 'Database service unreachable.',
    };
  } finally {
    if (session) {
      try {
        await session.close();
      } catch (closeErr) {
        console.warn('[CognoDB Internal Session Close Warning]:', sanitizeString(String(closeErr)));
      }
    }
  }
}

/**
 * Backward-compatible alias for checkConnectivity
 */
export const verifyConnection = checkConnectivity;

/**
 * Recursively normalizes Neo4j record results (handles Integers, Nodes, Relationships, and Maps).
 */
export function normalizeValue(val: any): any {
  if (val === null || val === undefined) return val;

  if (typeof val === 'object') {
    // Check for Neo4j Integer
    if (neo4j.isInt(val)) {
      return (val as Integer).toNumber();
    }

    // Check if it is a Neo4j Node
    if (val.labels && val.properties) {
      return {
        id: val.identity ? normalizeValue(val.identity) : undefined,
        labels: val.labels,
        ...normalizeValue(val.properties),
      };
    }

    // Check if it is a Neo4j Relationship
    if (val.type && val.properties) {
      return {
        id: val.identity ? normalizeValue(val.identity) : undefined,
        type: val.type,
        startNodeId: val.start ? normalizeValue(val.start) : undefined,
        endNodeId: val.end ? normalizeValue(val.end) : undefined,
        ...normalizeValue(val.properties),
      };
    }

    // Array
    if (Array.isArray(val)) {
      return val.map(normalizeValue);
    }

    // Standard object
    const normalized: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      normalized[k] = normalizeValue(v);
    }
    return normalized;
  }

  return val;
}

/**
 * Executes a parameterized Cypher query against CognoDB with automatic session management,
 * comprehensive internal error logging, and generic safe errors returned to the API layer.
 *
 * @param query Cypher query string with $parameter placeholders
 * @param params Object containing parameter keys and values
 */
export async function executeCypher(
  query: string,
  params: Record<string, any> = {}
): Promise<{ records: any[]; summary?: any }> {
  const driver = getDriver();
  if (!driver) {
    console.error('[CognoDB Internal Error]: executeCypher called but driver is not initialized.');
    throw new DatabaseError('Database service is currently unavailable. Please try again later.', 'DRIVER_UNAVAILABLE');
  }

  let session: Session | null = null;
  try {
    session = driver.session();
    const result = await session.run(query, params);
    
    const records = result.records.map((rec) => {
      const row: Record<string, any> = {};
      (rec.keys as Array<string | number>).forEach((k) => {
        const keyStr = String(k);
        row[keyStr] = normalizeValue(rec.get(keyStr as any));
      });
      return row;
    });

    return {
      records,
      summary: {
        query: result.summary?.query?.text || query,
        parameters: params,
        resultAvailableAfter: result.summary?.resultAvailableAfter?.toNumber?.() || 0,
      },
    };
  } catch (err: unknown) {
    // 1. Internal detailed logging for debugging
    const rawError = err instanceof Error ? err.message : String(err);
    const errorCode = err instanceof Neo4jError ? err.code : 'QUERY_EXECUTION_ERROR';
    const errorStack = err instanceof Error ? err.stack : undefined;

    console.error(`[CognoDB Internal Query Error] [Code: ${errorCode}]`);
    console.error(`Query: ${sanitizeString(query)}`);
    console.error(`Params:`, params);
    console.error(`Details: ${sanitizeString(rawError)}`);
    if (errorStack) {
      console.error(`Stack: ${sanitizeString(errorStack)}`);
    }

    // 2. Return generic, safe message to API layer to prevent sensitive information leakage
    throw new DatabaseError(
      'An error occurred while executing the database query. Please verify your query syntax or try again later.',
      errorCode
    );
  } finally {
    if (session) {
      try {
        await session.close();
      } catch (closeErr) {
        console.warn('[CognoDB Internal Session Close Warning]:', sanitizeString(String(closeErr)));
      }
    }
  }
}

/**
 * Alias for executeCypher for standardized naming.
 */
export const runQuery = executeCypher;

/**
 * Safely closes the singleton driver instance on server shutdown or reload.
 */
export async function closeDriver(): Promise<void> {
  if (driverInstance) {
    try {
      await driverInstance.close();
      console.log('[CognoDB]: Driver connection closed successfully.');
    } catch (err) {
      console.warn('[CognoDB Internal Close Driver Warning]:', sanitizeString(String(err)));
    } finally {
      driverInstance = null;
      isConnected = false;
    }
  }
}


