import { executeCypher, verifyConnection, closeDriver } from '../db.js';
import {
  SKILLS_DATA,
  TECHNOLOGIES_DATA,
  JOB_ROLES_DATA,
  COMPANIES_DATA,
  RELATIONSHIPS_DATA,
} from './seedData.js';

/**
 * Seeds CognoDB with Skills, Technologies, Job Roles, Companies, and Relationships.
 * Uses MERGE to ensure idempotency.
 */
export async function seedDatabase(): Promise<{
  success: boolean;
  message: string;
  stats: {
    skillsCount: number;
    technologiesCount: number;
    jobRolesCount: number;
    companiesCount: number;
    relationshipsCount: number;
  };
}> {
  console.log('--- [CognoDB Seeding Starting] ---');

  // Verify connection first
  const conn = await verifyConnection();
  if (!conn.connected) {
    console.warn('[Seed Warning]: CognoDB not currently connected. Live seed requires active CognoDB credentials.');
    return {
      success: false,
      message: conn.message,
      stats: {
        skillsCount: SKILLS_DATA.length,
        technologiesCount: TECHNOLOGIES_DATA.length,
        jobRolesCount: JOB_ROLES_DATA.length,
        companiesCount: COMPANIES_DATA.length,
        relationshipsCount: RELATIONSHIPS_DATA.length,
      },
    };
  }

  try {
    // 1. Clean existing demo nodes safely if needed or ensure constraints
    console.log('Applying uniqueness constraints & indexes...');
    try {
      await executeCypher('CREATE CONSTRAINT IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE');
      await executeCypher('CREATE CONSTRAINT IF NOT EXISTS FOR (t:Technology) REQUIRE t.name IS UNIQUE');
      await executeCypher('CREATE CONSTRAINT IF NOT EXISTS FOR (j:JobRole) REQUIRE j.title IS UNIQUE');
      await executeCypher('CREATE CONSTRAINT IF NOT EXISTS FOR (c:Company) REQUIRE c.name IS UNIQUE');
    } catch (constraintErr: any) {
      console.log('Constraint notice (may vary by openCypher version):', constraintErr.message);
    }

    // 2. Seed Skills in batch
    console.log(`Seeding ${SKILLS_DATA.length} Skills...`);
    await executeCypher(
      `UNWIND $skills AS item
       MERGE (s:Skill {name: item.name})
       SET s.category = item.category,
           s.difficulty = item.difficulty,
           s.description = item.description
       RETURN count(s) AS count`,
      { skills: SKILLS_DATA }
    );

    // 3. Seed Technologies in batch
    console.log(`Seeding ${TECHNOLOGIES_DATA.length} Technologies...`);
    await executeCypher(
      `UNWIND $technologies AS item
       MERGE (t:Technology {name: item.name})
       SET t.type = item.type,
           t.description = item.description
       RETURN count(t) AS count`,
      { technologies: TECHNOLOGIES_DATA }
    );

    // 4. Seed Job Roles in batch
    console.log(`Seeding ${JOB_ROLES_DATA.length} Job Roles...`);
    await executeCypher(
      `UNWIND $roles AS item
       MERGE (j:JobRole {title: item.title})
       SET j.experienceLevel = item.experienceLevel,
           j.salaryRange = item.salaryRange,
           j.description = item.description
       RETURN count(j) AS count`,
      { roles: JOB_ROLES_DATA }
    );

    // 5. Seed Companies in batch
    console.log(`Seeding ${COMPANIES_DATA.length} Companies...`);
    await executeCypher(
      `UNWIND $companies AS item
       MERGE (c:Company {name: item.name})
       SET c.industry = item.industry,
           c.location = item.location,
           c.website = item.website
       RETURN count(c) AS count`,
      { companies: COMPANIES_DATA }
    );

    // 6. Seed Relationships in grouped batches
    console.log(`Seeding ${RELATIONSHIPS_DATA.length} Relationships...`);
    
    const usedWithRels = RELATIONSHIPS_DATA.filter((r) => r.type === 'USED_WITH');
    if (usedWithRels.length > 0) {
      await executeCypher(
        `UNWIND $rels AS r
         MATCH (from:Skill {name: r.fromKey}), (to:Technology {name: r.toKey})
         MERGE (from)-[:USED_WITH]->(to)`,
        { rels: usedWithRels }
      );
    }

    const requiredForRels = RELATIONSHIPS_DATA.filter((r) => r.type === 'REQUIRED_FOR');
    if (requiredForRels.length > 0) {
      await executeCypher(
        `UNWIND $rels AS r
         MATCH (from:Skill {name: r.fromKey}), (to:JobRole {title: r.toKey})
         MERGE (from)-[:REQUIRED_FOR]->(to)`,
        { rels: requiredForRels }
      );
    }

    const usedInRels = RELATIONSHIPS_DATA.filter((r) => r.type === 'USED_IN');
    if (usedInRels.length > 0) {
      await executeCypher(
        `UNWIND $rels AS r
         MATCH (from:Technology {name: r.fromKey}), (to:JobRole {title: r.toKey})
         MERGE (from)-[:USED_IN]->(to)`,
        { rels: usedInRels }
      );
    }

    const hiredByRels = RELATIONSHIPS_DATA.filter((r) => r.type === 'HIRED_BY');
    if (hiredByRels.length > 0) {
      await executeCypher(
        `UNWIND $rels AS r
         MATCH (from:JobRole {title: r.fromKey}), (to:Company {name: r.toKey})
         MERGE (from)-[:HIRED_BY]->(to)`,
        { rels: hiredByRels }
      );
    }

    const relatedToRels = RELATIONSHIPS_DATA.filter((r) => r.type === 'RELATED_TO');
    if (relatedToRels.length > 0) {
      await executeCypher(
        `UNWIND $rels AS r
         MATCH (from:Skill {name: r.fromKey}), (to:Skill {name: r.toKey})
         MERGE (from)-[:RELATED_TO]->(to)`,
        { rels: relatedToRels }
      );
    }

    console.log('✓ [CognoDB Seed Successfully Completed]');
    return {
      success: true,
      message: 'Successfully seeded CognoDB graph data model with nodes and relationships.',
      stats: {
        skillsCount: SKILLS_DATA.length,
        technologiesCount: TECHNOLOGIES_DATA.length,
        jobRolesCount: JOB_ROLES_DATA.length,
        companiesCount: COMPANIES_DATA.length,
        relationshipsCount: RELATIONSHIPS_DATA.length,
      },
    };
  } catch (err: any) {
    console.error('[CognoDB Seeding Error]:', err);
    return {
      success: false,
      message: `Seed failed: ${err.message}`,
      stats: {
        skillsCount: 0,
        technologiesCount: 0,
        jobRolesCount: 0,
        companiesCount: 0,
        relationshipsCount: 0,
      },
    };
  }
}

// If run directly from CLI (e.g. `npm run seed`)
if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  seedDatabase()
    .then((res) => {
      console.log('Seed summary:', res);
      closeDriver().finally(() => process.exit(res.success ? 0 : 1));
    })
    .catch((err) => {
      console.error(err);
      closeDriver().finally(() => process.exit(1));
    });
}
