import { configureLogging } from '@strands-agents/sdk'
import { createAgent } from './agent.js'
import { pool } from './db.js'

configureLogging({
  debug: () => {},
  info: () => {},
  warn: (...args) => {
    if (!String(args[0]).includes('using default')) console.warn(...args)
  },
  error: (...args) => console.error(...args),
})

const question = process.argv.slice(2).join(' ') || 'Which product sold the most units?'
const agent = createAgent({
  readOnly: process.env.READ_ONLY !== 'false',
  maxRows: Number(process.env.MAX_ROWS ?? 10),
})

try {
  console.log(`You: ${question}\n`)
  await agent.invoke(question)
} finally {
  await pool.end()
}
