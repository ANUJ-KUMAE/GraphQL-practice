import pool, { SCHEMA } from './index.js';

export async function initDb() {
  console.log(`⏳ Connecting to PostgreSQL...`);
  const client = await pool.connect();

  try {
    console.log(`⏳ Step 1: Creating schema "${SCHEMA}" if it does not exist...`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);

    console.log(`⏳ Step 2: Creating table "${SCHEMA}"."Department"...`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA}"."Department" (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log(`⏳ Step 3: Creating table "${SCHEMA}"."Employee"...`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA}"."Employee" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        salary DOUBLE PRECISION,
        "departmentId" INTEGER REFERENCES "${SCHEMA}"."Department"(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log(`⏳ Step 4: Creating table "${SCHEMA}"."Project"...`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA}"."Project" (
        id SERIAL PRIMARY KEY,
        "projectName" TEXT NOT NULL,
        resources TEXT NOT NULL,
        status TEXT NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endDate" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log(`⏳ Step 5: Creating table "${SCHEMA}"."EmployeeProject"...`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA}"."EmployeeProject" (
        id SERIAL PRIMARY KEY,
        "employeeId" INTEGER NOT NULL REFERENCES "${SCHEMA}"."Employee"(id) ON DELETE CASCADE,
        "projectId" INTEGER NOT NULL REFERENCES "${SCHEMA}"."Project"(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "unique_emp_proj_idx" 
      ON "${SCHEMA}"."EmployeeProject" ("employeeId", "projectId");
    `);

    console.log(`🎉 SUCCESS! Schema "${SCHEMA}" and all tables ("Department", "Employee", "Project", "EmployeeProject") are verified/created in PostgreSQL!`);
  } catch (error) {
    console.error(`❌ Error initializing database:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Allow running directly via "node src/db/initDb.js" or "npm run init-db"
if (process.argv[1]?.replace(/\\/g, '/').endsWith('src/db/initDb.js')) {
  initDb()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
