import { Agent } from '@strands-agents/sdk'
import { dbTools } from './tools.js'
import { addLoggingHooks } from './hooks/logging.js'
import { addPrivacyHooks } from './hooks/privacy.js'

export function createAgent() {
  const agent = new Agent({
    tools: dbTools,
    systemPrompt:
      'You are a data assistant for a small shop. Answer questions using the tools. ' +
      'If no tool can answer the question, say so. Keep answers short.',
  })

  addLoggingHooks(agent)
  addPrivacyHooks(agent)

  return agent
}
