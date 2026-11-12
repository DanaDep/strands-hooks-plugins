import { createAgent } from './agent.js'
import { pool } from './db.js'

const question = process.argv.slice(2).join(' ') || 'Which product sold the most units?'
const agent = createAgent()

try {
  await agent.invoke(question)
  console.log()
} finally {
  await pool.end()
}
