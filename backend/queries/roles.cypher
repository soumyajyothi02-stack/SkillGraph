// Get all Job Roles with counts of required skills and hiring companies
MATCH (j:JobRole)
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

// Get detailed Job Role by title with complete graph neighborhood
MATCH (j:JobRole {title: $title})
OPTIONAL MATCH (s:Skill)-[:REQUIRED_FOR]->(j)
OPTIONAL MATCH (t:Technology)-[:USED_IN]->(j)
OPTIONAL MATCH (j)-[:HIRED_BY]->(c:Company)
OPTIONAL MATCH (s)-[:REQUIRED_FOR]->(otherRole:JobRole)
WHERE otherRole.title <> j.title
RETURN j.title AS title,
       j.experienceLevel AS experienceLevel,
       j.salaryRange AS salaryRange,
       j.description AS description,
       collect(DISTINCT {name: s.name, category: s.category, difficulty: s.difficulty}) AS requiredSkills,
       collect(DISTINCT {name: t.name, type: t.type}) AS technologies,
       collect(DISTINCT {name: c.name, industry: c.industry, location: c.location, website: c.website}) AS companies,
       collect(DISTINCT {title: otherRole.title, experienceLevel: otherRole.experienceLevel}) AS relatedJobRoles;
