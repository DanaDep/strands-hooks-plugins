import { pool } from './db.js'

export async function loadCustomerNames() {
  const { rows } = await pool.query(
    'SELECT id, first_name AS "firstName", last_name AS "lastName" FROM customers ORDER BY id',
  )
  return rows
}
