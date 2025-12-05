import postgres from "postgres"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn("DATABASE_URL is not set. Add it to your .env.local.")
}

// Use a singleton to avoid creating multiple pools in dev hot-reload.
const globalForDb = global as unknown as { sql?: ReturnType<typeof postgres> }

export const sql =
  globalForDb.sql ??
  postgres(connectionString || "", {
    max: 5, // small pool for local dev
    idle_timeout: 20,
    ssl: { rejectUnauthorized: false },
  })

if (!globalForDb.sql) {
  globalForDb.sql = sql
}

export default sql


