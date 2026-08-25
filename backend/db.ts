import neo4j, { Driver, Session, Integer } from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

// Standard CognoDB / Neo4j environment variables
const COGNODB_URI = process.env.COGNODB_URI || process.env.NEO4J_URI || 'bolt://localhost:7687';
const COGNODB_USERNAME = process.env.COGNODB_USERNAME || process.env.NEO4J_USERNAME || 'cogno';
const COGNODB_PASSWORD = process.env.COGNODB_PASSWORD || process.env.NEO4J_PASSWORD || '';

let driverInstance: Driver | null = null;
let isConnected = false;
let lastConnectionError: string | null = null;

/**
 * Initializes or retrieves the singleton Neo4j / CognoDB driver instance.
 */
export function getDriver(): Driver | null {
  if (!COGNODB_PASSWORD && !process.env.COGNODB_URI) {
    // If no credentials configured yet
    return null;
  }

  if (!driverInstance) {
    try {
      driverInstance = neo4j.driver(
        COGNODB_URI,
        neo4j.auth.basic(COGNODB_USERNAME, COGNODB_PASSWORD),
        {
          disableLosslessIntegers: true,
          connectionTimeout: 5000,
          maxConnectionLifetime: 3 * 60 * 60 * 1000,
        }
      );
    } catch (err: any) {
      console.error('[CognoDB Driver Init Error]:', err.message);
      lastConnectionError = err.message;
      return null;
    }
  }

  return driverInstance;
}

/**
 * Verifies connectivity to the CognoDB instance.
 */
export async function verifyConnection(): Promise<{ connected: boolean; message: string; uri: string }> {
  const driver = getDriver();
  const maskedUri = COGNODB_URI.replace(/\/\/.*@/, '//***@');

  if (!driver) {
    isConnected = false;
    return {
      connected: false,
      message: 'CognoDB credentials not configured in environment variables (COGNODB_URI, COGNODB_USERNAME, COGNODB_PASSWORD).',
      uri: maskedUri,
    };
  }

  let session: Session | null = null;
  try {
    session = driver.session();
    const result = await session.run('RETURN 1 AS alive');
    if (result.records.length > 0) {
      isConnected = true;
      lastConnectionError = null;
      return {
        connected: true,
        message: 'Successfully connected to CognoDB via Bolt protocol.',
        uri: maskedUri,
      };
    }
    throw new Error('No record returned from ping query.');
  } catch (err: any) {
    isConnected = false;
    lastConnectionError = err.message;
    console.warn('[CognoDB Verify Failed]:', err.message);
    return {
      connected: false,
      message: `Unable to connect to CognoDB at ${maskedUri}. Error: ${err.message}`,
      uri: maskedUri,
    };
  } finally {
    if (session) {
      await session.close();
    }
  }
}

/**
 * Recursively normalizes Neo4j record results (handles Integer, Node, Relationship objects)
 */
export function normalizeValue(val: any): any {
  if (val === null || val === undefined) return val;

  if (typeof val === 'object') {
    // Check for Neo4j Integer
    if (neo4j.isInt(val)) {
      return (val as Integer).toNumber();
    }

    // Check if it's a Neo4j Node
    if (val.labels && val.properties) {
      return {
        id: val.identity ? normalizeValue(val.identity) : undefined,
        labels: val.labels,
        ...normalizeValue(val.properties),
      };
    }

    // Check if it's a Neo4j Relationship
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
 * Runs a parameterized Cypher query against CognoDB.
 * ALWAYS uses parameterized queries ($paramName).
 */
export async function executeCypher(
  query: string,
  params: Record<string, any> = {}
): Promise<{ records: any[]; summary?: any }> {
  const driver = getDriver();
  if (!driver) {
    throw new Error('CognoDB driver is not configured. Please set COGNODB_URI, COGNODB_USERNAME, and COGNODB_PASSWORD.');
  }

  const session = driver.session();
  try {
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
  } finally {
    await session.close();
  }
}

/**
 * Closes driver on server shutdown.
 */
export async function closeDriver() {
  if (driverInstance) {
    await driverInstance.close();
    driverInstance = null;
    isConnected = false;
  }
}
