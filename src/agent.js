import { Agent } from '@strands-agents/sdk'
import { dbTools } from './tools.js'

export function createAgent() {
  return new Agent({
    tools: dbTools,
    systemPrompt:
      'You are a data assistant for a small shop. Answer questions using the tools. ' +
      'If no tool can answer the question, say so. Keep answers short.',
  })
}
