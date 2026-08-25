// Get all skills with category and relationship counts
MATCH (s:Skill)
OPTIONAL MATCH (s)-[:USED_WITH]->(t:Technology)
OPTIONAL MATCH (s)-[:REQUIRED_FOR]->(j:JobRole)
RETURN s.name AS name,
       s.category AS category,
       s.difficulty AS difficulty,
       s.description AS description,
       count(DISTINCT t) AS technologyCount,
       count(DISTINCT j) AS jobRoleCount
ORDER BY s.name ASC;

// Get skill by name with 1-hop and 2-hop connected entities
MATCH (s:Skill {name: $name})
OPTIONAL MATCH (s)-[:USED_WITH]->(t:Technology)
OPTIONAL MATCH (s)-[:REQUIRED_FOR]->(j:JobRole)
OPTIONAL MATCH (s)-[:RELATED_TO]-(relSkill:Skill)
OPTIONAL MATCH (j)-[:HIRED_BY]->(c:Company)
RETURN s.name AS name,
       s.category AS category,
       s.difficulty AS difficulty,
       s.description AS description,
       collect(DISTINCT {name: t.name, type: t.type, description: t.description}) AS technologies,
       collect(DISTINCT {title: j.title, experienceLevel: j.experienceLevel, salaryRange: j.salaryRange}) AS jobRoles,
       collect(DISTINCT {name: relSkill.name, category: relSkill.category, difficulty: relSkill.difficulty}) AS relatedSkills,
       collect(DISTINCT {name: c.name, industry: c.industry, location: c.location}) AS companies;
