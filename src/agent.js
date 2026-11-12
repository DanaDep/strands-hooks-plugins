import { Agent } from '@strands-agents/sdk'
import { dbTools } from './tools.js'
import { addLoggingHooks } from './hooks/logging.js'
import { addPrivacyHooks } from './hooks/privacy.js'
import { addReadOnlyHooks } from './hooks/read-only.js'
import { addRowLimitHooks } from './hooks/row-limit.js'
import { addRoleCheckHooks } from './hooks/role-check.js'

export function createAgent({ user, readOnly = true, maxRows = 10 }) {
  const agent = new Agent({
    tools: dbTools,
    systemPrompt:
      'You are a data assistant for the employees of a small shop. Answer questions using the tools. ' +
      'If no tool can answer the question, say so. Keep answers short.',
  })

  addLoggingHooks(agent)
  addPrivacyHooks(agent)
  if (readOnly) addReadOnlyHooks(agent)
  addRoleCheckHooks(agent, { user })
  addRowLimitHooks(agent, { maxRows })

  return agent
}
