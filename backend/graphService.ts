import { executeCypher, verifyConnection } from './db.js';

export interface GraphStats {
  skillsCount: number;
  technologiesCount: number;
  jobRolesCount: number;
  companiesCount: number;
  relationshipsCount: number;
}

export interface GraphNodePayload {
  id: string;
  label: 'Skill' | 'Technology' | 'JobRole' | 'Company';
  name?: string;
  title?: string;
  category?: string;
  difficulty?: string;
  type?: string;
  experienceLevel?: string;
  salaryRange?: string;
  industry?: string;
  location?: string;
  description?: string;
  website?: string;
  [key: string]: any;
}

export interface GraphLinkPayload {
  id?: string | number;
  source: string;
  target: string;
  type: string;
  properties?: Record<string, any>;
}

export class GraphService {
  /**
   * Health and Database Overview Status from CognoDB
   */
  static async getStatus() {
    const conn = await verifyConnection();
    if (!conn.connected) {
      return {
        connected: false,
        message: 'Unable to connect to SkillGraph database.',
        driver: 'neo4j-driver (openCypher/Bolt)',
        database: 'CognoDB',
        stats: {
          skillsCount: 0,
          technologiesCount: 0,
          jobRolesCount: 0,
          companiesCount: 0,
          relationshipsCount: 0,
        },
      };
    }

    const countsQuery = `
      OPTIONAL MATCH (s:Skill) WITH count(s) AS sc
      OPTIONAL MATCH (t:Technology) WITH sc, count(t) AS tc
      OPTIONAL MATCH (j:JobRole) WITH sc, tc, count(j) AS jc
      OPTIONAL MATCH (c:Company) WITH sc, tc, jc, count(c) AS cc
      OPTIONAL MATCH ()-[r]->() WITH sc, tc, jc, cc, count(r) AS rc
      RETURN sc AS skillsCount, tc AS technologiesCount, jc AS jobRolesCount, cc AS companiesCount, rc AS relationshipsCount;
    `;
    const res = await executeCypher(countsQuery);
    const row = res.records[0] || {};

    return {
      connected: true,
      message: 'Successfully connected to CognoDB via Bolt protocol.',
      driver: 'neo4j-driver (openCypher/Bolt)',
      database: 'CognoDB',
      stats: {
        skillsCount: Number(row.skillsCount || 0),
        technologiesCount: Number(row.technologiesCount || 0),
        jobRolesCount: Number(row.jobRolesCount || 0),
        companiesCount: Number(row.companiesCount || 0),
        relationshipsCount: Number(row.relationshipsCount || 0),
      },
    };
  }

  /**
   * 1. Get all Skills with optional category/search filters from CognoDB
   */
  static async getSkills(category?: string, search?: string) {
    const conn = await verifyConnection();
    if (!conn.connected) {
      throw new Error('Unable to connect to SkillGraph database.');
    }

    const cypher = `
      MATCH (s:Skill)
      WHERE ($category IS NULL OR s.category = $category)
        AND ($search IS NULL OR toLower(s.name) CONTAINS toLower($search) OR toLower(s.description) CONTAINS toLower($search))
      OPTIONAL MATCH (s)-[:USED_WITH]->(t:Technology)
      OPTIONAL MATCH (s)-[:REQUIRED_FOR]->(j:JobRole)
      OPTIONAL MATCH (s)-[:RELATED_TO]-(rel:Skill)
      RETURN s.name AS name,
             s.category AS category,
             s.difficulty AS difficulty,
             s.description AS description,
             count(DISTINCT t) AS technologyCount,
             count(DISTINCT j) AS jobRoleCount,
             count(DISTINCT rel) AS relatedSkillCount
      ORDER BY s.name ASC;
    `;
    const params = {
      category: category && category !== 'All' ? category : null,
      search: search?.trim() ? search.trim() : null,
    };

    const res = await executeCypher(cypher, params);
    return {
      data: res.records,
      source: 'CognoDB (Live)',
      cypher: { query: cypher.trim(), params },
    };
  }

  /**
   * 2. Get Skill Details by Name with multi-hop neighbors from CognoDB
   */
  static async getSkillByName(name: string) {
    const conn = await verifyConnection();
    if (!conn.connected) {
      throw new Error('Unable to connect to SkillGraph database.');
    }

    const cypher = `
      MATCH (s:Skill)
      WHERE toLower(s.name) = toLower($name)
      OPTIONAL MATCH (s)-[:USED_WITH]->(t:Technology)
      OPTIONAL MATCH (s)-[:REQUIRED_FOR]->(j:JobRole)
      OPTIONAL MATCH (s)-[:RELATED_TO]-(relSkill:Skill)
      OPTIONAL MATCH (j)-[:HIRED_BY]->(c:Company)
      RETURN s.name AS name,
             s.category AS category,
             s.difficulty AS difficulty,
             s.description AS description,
             [item IN collect(DISTINCT t) WHERE item IS NOT NULL | {name: item.name, type: item.type, description: item.description}] AS technologies,
             [item IN collect(DISTINCT j) WHERE item IS NOT NULL | {title: item.title, experienceLevel: item.experienceLevel, salaryRange: item.salaryRange, description: item.description}] AS jobRoles,
             [item IN collect(DISTINCT relSkill) WHERE item IS NOT NULL | {name: item.name, category: item.category, difficulty: item.difficulty}] AS relatedSkills,
             [item IN collect(DISTINCT c) WHERE item IS NOT NULL | {name: item.name, industry: item.industry, location: item.location}] AS companies;
    `;
    const params = { name };

    const res = await executeCypher(cypher, params);
    if (res.records.length > 0 && res.records[0].name) {
      return {
        data: res.records[0],
        source: 'CognoDB (Live)',
        cypher: { query: cypher.trim(), params },
      };
    }
    return { data: null, source: 'CognoDB (Live)', cypher: { query: cypher.trim(), params } };
  }

  /**
   * 3. Get all Job Roles from CognoDB
   */
  static async getJobRoles(experienceLevel?: string, search?: string) {
    const conn = await verifyConnection();
    if (!conn.connected) {
      throw new Error('Unable to connect to SkillGraph database.');
    }

    const cypher = `
      MATCH (j:JobRole)
      WHERE ($experienceLevel IS NULL OR j.experienceLevel = $experienceLevel)
        AND ($search IS NULL OR toLower(j.title) CONTAINS toLower($search) OR toLower(j.description) CONTAINS toLower($search))
      OPTIONAL MATCH (s:Skill)-[:REQUIRED_FOR]->(j)
      OPTIONAL MATCH (t:Technology)-[:USED_IN]->(j)
      OPTIONAL MATCH (j)-[:HIRED_BY]->(c:Company)
      RETURN j.title AS title,
             j.experienceLevel AS experienceLevel,
             j.salaryRange AS salaryRange,
             j.description AS description,
             count(DISTINCT s) AS skillCount,
             count(DISTINCT t) AS technologyCount,
             count(DISTINCT c) AS companyCount
      ORDER BY j.title ASC;
    `;
    const params = {
      experienceLevel: experienceLevel && experienceLevel !== 'All' ? experienceLevel : null,
      search: search?.trim() ? search.trim() : null,
    };

    const res = await executeCypher(cypher, params);
    return {
      data: res.records,
      source: 'CognoDB (Live)',
      cypher: { query: cypher.trim(), params },
    };
  }

  /**
   * 4. Get Job Role Details by Title from CognoDB
   */
  static async getJobRoleByTitle(title: string) {
    const conn = await verifyConnection();
    if (!conn.connected) {
      throw new Error('Unable to connect to SkillGraph database.');
    }

    const cypher = `
      MATCH (j:JobRole)
      WHERE toLower(j.title) = toLower($title)
      OPTIONAL MATCH (s:Skill)-[:REQUIRED_FOR]->(j)
      OPTIONAL MATCH (t:Technology)-[:USED_IN]->(j)
      OPTIONAL MATCH (j)-[:HIRED_BY]->(c:Company)
      OPTIONAL MATCH (s)-[:REQUIRED_FOR]->(otherRole:JobRole)
      WHERE otherRole.title <> j.title
      RETURN j.title AS title,
             j.experienceLevel AS experienceLevel,
             j.salaryRange AS salaryRange,
             j.description AS description,
             [item IN collect(DISTINCT s) WHERE item IS NOT NULL | {name: item.name, category: item.category, difficulty: item.difficulty, description: item.description}] AS requiredSkills,
             [item IN collect(DISTINCT t) WHERE item IS NOT NULL | {name: item.name, type: item.type, description: item.description}] AS technologies,
             [item IN collect(DISTINCT c) WHERE item IS NOT NULL | {name: item.name, industry: item.industry, location: item.location, website: item.website}] AS companies,
             [item IN collect(DISTINCT otherRole) WHERE item IS NOT NULL | {title: item.title, experienceLevel: item.experienceLevel}] AS relatedJobRoles;
    `;
    const params = { title };

    const res = await executeCypher(cypher, params);
    if (res.records.length > 0 && res.records[0].title) {
      return {
        data: res.records[0],
        source: 'CognoDB (Live)',
        cypher: { query: cypher.trim(), params },
      };
    }
    return { data: null, source: 'CognoDB (Live)', cypher: { query: cypher.trim(), params } };
  }

  /**
   * 5. Get all Technologies from CognoDB
   */
  static async getTechnologies(type?: string, search?: string) {
    const conn = await verifyConnection();
    if (!conn.connected) {
      throw new Error('Unable to connect to SkillGraph database.');
    }

    const cypher = `
      MATCH (t:Technology)
      WHERE ($type IS NULL OR t.type = $type)
        AND ($search IS NULL OR toLower(t.name) CONTAINS toLower($search) OR toLower(t.description) CONTAINS toLower($search))
      OPTIONAL MATCH (s:Skill)-[:USED_WITH]->(t)
      OPTIONAL MATCH (t)-[:USED_IN]->(j:JobRole)
      OPTIONAL MATCH (j)-[:HIRED_BY]->(c:Company)
      RETURN t.name AS name,
             t.type AS type,
             t.description AS description,
             count(DISTINCT s) AS skillCount,
             count(DISTINCT j) AS jobRoleCount,
             count(DISTINCT c) AS companyCount
      ORDER BY t.name ASC;
    `;
    const params = {
      type: type && type !== 'All' ? type : null,
      search: search?.trim() ? search.trim() : null,
    };

    const res = await executeCypher(cypher, params);
    return {
      data: res.records,
      source: 'CognoDB (Live)',
      cypher: { query: cypher.trim(), params },
    };
  }

  /**
   * 6. Get Technology Details by Name from CognoDB
   */
  static async getTechnologyByName(name: string) {
    const conn = await verifyConnection();
    if (!conn.connected) {
      throw new Error('Unable to connect to SkillGraph database.');
    }

    const cypher = `
      MATCH (t:Technology)
      WHERE toLower(t.name) = toLower($name)
      OPTIONAL MATCH (s:Skill)-[:USED_WITH]->(t)
      OPTIONAL MATCH (t)-[:USED_IN]->(j:JobRole)
      OPTIONAL MATCH (j)-[:HIRED_BY]->(c:Company)
      RETURN t.name AS name,
             t.type AS type,
             t.description AS description,
             [item IN collect(DISTINCT s) WHERE item IS NOT NULL | {name: item.name, category: item.category, difficulty: item.difficulty, description: item.description}] AS relatedSkills,
             [item IN collect(DISTINCT j) WHERE item IS NOT NULL | {title: item.title, experienceLevel: item.experienceLevel, salaryRange: item.salaryRange, description: item.description}] AS relatedJobRoles,
             [item IN collect(DISTINCT c) WHERE item IS NOT NULL | {name: item.name, industry: item.industry, location: item.location}] AS connectedCompanies;
    `;
    const params = { name };

    const res = await executeCypher(cypher, params);
    if (res.records.length > 0 && res.records[0].name) {
      return {
        data: res.records[0],
        source: 'CognoDB (Live)',
        cypher: { query: cypher.trim(), params },
      };
    }
    return { data: null, source: 'CognoDB (Live)', cypher: { query: cypher.trim(), params } };
  }

  /**
   * 7. Get all Companies from CognoDB
   */
  static async getCompanies(industry?: string, search?: string) {
    const conn = await verifyConnection();
    if (!conn.connected) {
      throw new Error('Unable to connect to SkillGraph database.');
    }

    const cypher = `
      MATCH (c:Company)
      WHERE ($industry IS NULL OR c.industry = $industry)
        AND ($search IS NULL OR toLower(c.name) CONTAINS toLower($search) OR toLower(c.location) CONTAINS toLower($search) OR toLower(c.industry) CONTAINS toLower($search))
      OPTIONAL MATCH (j:JobRole)-[:HIRED_BY]->(c)
      RETURN c.name AS name,
             c.industry AS industry,
             c.location AS location,
             c.website AS website,
             count(DISTINCT j) AS roleCount
      ORDER BY c.name ASC;
    `;
    const params = {
      industry: industry && industry !== 'All' ? industry : null,
      search: search?.trim() ? search.trim() : null,
    };

    const res = await executeCypher(cypher, params);
    return {
      data: res.records,
      source: 'CognoDB (Live)',
      cypher: { query: cypher.trim(), params },
    };
  }

  /**
   * 8. Get Company Details by Name from CognoDB
   */
  static async getCompanyByName(name: string) {
    const conn = await verifyConnection();
    if (!conn.connected) {
      throw new Error('Unable to connect to SkillGraph database.');
    }

    const cypher = `
      MATCH (c:Company)
      WHERE toLower(c.name) = toLower($name)
      OPTIONAL MATCH (j:JobRole)-[:HIRED_BY]->(c)
      OPTIONAL MATCH (s:Skill)-[:REQUIRED_FOR]->(j)
      OPTIONAL MATCH (t:Technology)-[:USED_IN]->(j)
      RETURN c.name AS name,
             c.industry AS industry,
             c.location AS location,
             c.website AS website,
             [item IN collect(DISTINCT j) WHERE item IS NOT NULL | {title: item.title, experienceLevel: item.experienceLevel, salaryRange: item.salaryRange, description: item.description}] AS jobRoles,
             [item IN collect(DISTINCT s) WHERE item IS NOT NULL | {name: item.name, category: item.category, difficulty: item.difficulty}] AS connectedSkills,
             [item IN collect(DISTINCT t) WHERE item IS NOT NULL | {name: item.name, type: item.type}] AS connectedTechnologies;
    `;
    const params = { name };

    const res = await executeCypher(cypher, params);
    if (res.records.length > 0 && res.records[0].name) {
      return {
        data: res.records[0],
        source: 'CognoDB (Live)',
        cypher: { query: cypher.trim(), params },
      };
    }
    return { data: null, source: 'CognoDB (Live)', cypher: { query: cypher.trim(), params } };
  }

  /**
   * 9. Get Interactive Graph View (Nodes & Links) from CognoDB
   */
  static async getGraph(nodeTypes?: string[], search?: string) {
    const conn = await verifyConnection();
    if (!conn.connected) {
      throw new Error('Unable to connect to SkillGraph database.');
    }

    const cypher = `
      MATCH (n)
      OPTIONAL MATCH (n)-[r]->(m)
      RETURN collect(DISTINCT {
        id: coalesce(n.name, n.title),
        label: head(labels(n)),
        name: n.name,
        title: n.title,
        category: n.category,
        difficulty: n.difficulty,
        type: n.type,
        experienceLevel: n.experienceLevel,
        salaryRange: n.salaryRange,
        industry: n.industry,
        location: n.location,
        description: n.description,
        website: n.website
      }) AS nodes,
      collect(DISTINCT {
        id: toString(id(r)),
        source: coalesce(startNode(r).name, startNode(r).title),
        target: coalesce(endNode(r).name, endNode(r).title),
        type: type(r)
      }) AS relationships;
    `;

    const res = await executeCypher(cypher);
    if (res.records.length > 0) {
      let nodes: GraphNodePayload[] = (res.records[0].nodes || []).filter((n: any) => n.id && n.label);
      let links: GraphLinkPayload[] = (res.records[0].relationships || []).filter((r: any) => r.source && r.target);

      if (nodeTypes && nodeTypes.length > 0 && !nodeTypes.includes('All')) {
        nodes = nodes.filter((n) => nodeTypes.includes(n.label));
        const validIds = new Set(nodes.map((n) => n.id));
        links = links.filter((l) => validIds.has(l.source) && validIds.has(l.target));
      }

      if (search?.trim()) {
        const q = search.trim().toLowerCase();
        const matchingIds = new Set(
          nodes.filter((n) => (n.name || n.title || n.description || '').toLowerCase().includes(q)).map((n) => n.id)
        );
        const expandedIds = new Set(matchingIds);
        links.forEach((l) => {
          if (matchingIds.has(l.source)) expandedIds.add(l.target);
          if (matchingIds.has(l.target)) expandedIds.add(l.source);
        });
        nodes = nodes.filter((n) => expandedIds.has(n.id));
        links = links.filter((l) => expandedIds.has(l.source) && expandedIds.has(l.target));
      }

      return {
        nodes,
        links,
        source: 'CognoDB (Live)',
        cypher: { query: cypher.trim(), params: {} },
      };
    }

    return {
      nodes: [],
      links: [],
      source: 'CognoDB (Live)',
      cypher: { query: cypher.trim(), params: {} },
    };
  }

  /**
   * 10. Multi-Hop Graph Traversal: Find Connections from CognoDB
   */
  static async findConnections(startName: string, targetName: string) {
    const conn = await verifyConnection();
    if (!conn.connected) {
      throw new Error('Unable to connect to SkillGraph database.');
    }

    const cypher = `
      MATCH (source) WHERE toLower(coalesce(source.name, source.title)) = toLower($startName)
      MATCH (target) WHERE toLower(coalesce(target.name, target.title)) = toLower($targetName)
      MATCH path = (source)-[*1..4]-(target)
      RETURN [n IN nodes(path) | {id: coalesce(n.name, n.title), label: head(labels(n)), properties: properties(n)}] AS pathNodes,
             [r IN relationships(path) | {type: type(r), source: coalesce(startNode(r).name, startNode(r).title), target: coalesce(endNode(r).name, endNode(r).title)}] AS pathRelationships,
             length(path) AS hopCount
      ORDER BY length(path) ASC
      LIMIT 10;
    `;
    const params = { startName, targetName };

    const res = await executeCypher(cypher, params);
    const paths = (res.records || []).map((r, i) => ({
      pathId: `path-${i + 1}`,
      hopCount: r.hopCount,
      nodes: r.pathNodes,
      relationships: r.pathRelationships,
      formattedPath: (r.pathNodes || []).map((n: any) => n.id).join(' ➔ '),
    }));

    return {
      paths,
      source: 'CognoDB (Live)',
      cypher: { query: cypher.trim(), params },
    };
  }

  /**
   * 11. Global Search Across All Entities in CognoDB
   */
  static async globalSearch(query: string) {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      return {
        skills: [],
        technologies: [],
        jobRoles: [],
        companies: [],
        totalCount: 0,
      };
    }

    const conn = await verifyConnection();
    if (!conn.connected) {
      throw new Error('Unable to connect to SkillGraph database.');
    }

    const cypher = `
      OPTIONAL MATCH (s:Skill) WHERE toLower(s.name) CONTAINS toLower($search) OR toLower(s.category) CONTAINS toLower($search)
      WITH collect(DISTINCT s) AS sList
      OPTIONAL MATCH (t:Technology) WHERE toLower(t.name) CONTAINS toLower($search) OR toLower(t.type) CONTAINS toLower($search)
      WITH sList, collect(DISTINCT t) AS tList
      OPTIONAL MATCH (j:JobRole) WHERE toLower(j.title) CONTAINS toLower($search) OR toLower(j.experienceLevel) CONTAINS toLower($search)
      WITH sList, tList, collect(DISTINCT j) AS jList
      OPTIONAL MATCH (c:Company) WHERE toLower(c.name) CONTAINS toLower($search) OR toLower(c.industry) CONTAINS toLower($search) OR toLower(c.location) CONTAINS toLower($search)
      WITH sList, tList, jList, collect(DISTINCT c) AS cList
      RETURN [item IN sList WHERE item IS NOT NULL] AS skills,
             [item IN tList WHERE item IS NOT NULL] AS technologies,
             [item IN jList WHERE item IS NOT NULL] AS jobRoles,
             [item IN cList WHERE item IS NOT NULL] AS companies;
    `;
    const res = await executeCypher(cypher, { search: q });
    if (res.records.length > 0) {
      const row = res.records[0];
      const skills = row.skills || [];
      const technologies = row.technologies || [];
      const jobRoles = row.jobRoles || [];
      const companies = row.companies || [];
      return {
        skills,
        technologies,
        jobRoles,
        companies,
        totalCount: skills.length + technologies.length + jobRoles.length + companies.length,
      };
    }

    return {
      skills: [],
      technologies: [],
      jobRoles: [],
      companies: [],
      totalCount: 0,
    };
  }

  /**
   * 12. Direct Custom openCypher Execution for the Playground
   */
  static async executeCustomCypher(query: string, params: Record<string, any> = {}) {
    const conn = await verifyConnection();
    if (conn.connected) {
      return executeCypher(query, params);
    }
    throw new Error('Unable to connect to SkillGraph database.');
  }
}
