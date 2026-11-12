import { BeforeToolCallEvent } from '@strands-agents/sdk'

const WRITE_TOOLS = ['delete_order']

const log = (message) => console.log(`[hook:read-only] ${message}`)

export function addReadOnlyHooks(agent) {
  agent.addHook(BeforeToolCallEvent, (event) => {
    const { name } = event.toolUse
    if (!WRITE_TOOLS.includes(name)) return

    event.cancel = `${name} is blocked: the agent runs in read-only mode and cannot change data.`
    log(`blocked ${name}`)
  })
}
