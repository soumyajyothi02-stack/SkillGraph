// Get all Companies with hiring role counts and locations
MATCH (c:Company)
OPTIONAL MATCH (j:JobRole)-[:HIRED_BY]->(c)
RETURN c.name AS name,
       c.industry AS industry,
       c.location AS location,
       c.website AS website,
       count(DISTINCT j) AS roleCount
ORDER BY c.name ASC;

// Get Company by name with hiring roles, tech stacks, and required skills
MATCH (c:Company {name: $name})
OPTIONAL MATCH (j:JobRole)-[:HIRED_BY]->(c)
OPTIONAL MATCH (s:Skill)-[:REQUIRED_FOR]->(j)
OPTIONAL MATCH (t:Technology)-[:USED_IN]->(j)
RETURN c.name AS name,
       c.industry AS industry,
       c.location AS location,
       c.website AS website,
       collect(DISTINCT {title: j.title, experienceLevel: j.experienceLevel, salaryRange: j.salaryRange}) AS jobRoles,
       collect(DISTINCT {name: s.name, category: s.category, difficulty: s.difficulty}) AS connectedSkills,
       collect(DISTINCT {name: t.name, type: t.type}) AS connectedTechnologies;
