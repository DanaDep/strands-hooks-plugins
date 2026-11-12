import { BeforeToolCallEvent } from '@strands-agents/sdk'

const ALLOWED_ROLES = {
  delete_order: ['admin'],
}

const log = (message) => console.log(`[hook:role-check] ${message}`)

export function addRoleCheckHooks(agent, { user }) {
  agent.addHook(BeforeToolCallEvent, (event) => {
    const { name } = event.toolUse
    const allowed = ALLOWED_ROLES[name]
    if (!allowed || allowed.includes(user.role)) return

    event.cancel = `${name} is blocked: ${user.username} has role "${user.role}", ` +
      `but this tool needs one of: ${allowed.join(', ')}.`
    log(`blocked ${name} for ${user.username} (${user.role})`)
  })
}
