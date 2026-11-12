import { pool } from './db.js'

export async function findUser(username) {
  const { rows } = await pool.query(
    `SELECT username, first_name AS "firstName", last_name AS "lastName", email, role
     FROM users WHERE username = $1`,
    [username],
  )
  return rows[0]
}
