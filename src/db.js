import pg from 'pg'

// pg turns DATE into a JS Date at local midnight, which shifts the day in UTC. Keep it as text.
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value)
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => Number(value))

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
