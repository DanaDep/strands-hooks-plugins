import { configureLogging } from '@strands-agents/sdk'
import { createAgent } from './agent.js'
import { pool } from './db.js'
import { findUser } from './users.js'

configureLogging({
  debug: () => {},
  info: () => {},
  warn: (...args) => {
    if (!String(args[0]).includes('using default')) console.warn(...args)
  },
  error: (...args) => console.error(...args),
})

const question = process.argv.slice(2).join(' ') || 'Which product sold the most units?'
const user = await findUser(process.env.CURRENT_USER)
if (!user) {
  console.error(`Unknown user "${process.env.CURRENT_USER}". Set CURRENT_USER in .env to a username from the users table.`)
  await pool.end()
  process.exit(1)
}

const agent = createAgent({
  user,
  readOnly: process.env.READ_ONLY !== 'false',
  maxRows: Number(process.env.MAX_ROWS ?? 10),
})

try {
  console.log(`You (${user.firstName} ${user.lastName}, ${user.role}): ${question}\n`)
  await agent.invoke(question)
} finally {
  await pool.end()
}
