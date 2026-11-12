import { BeforeToolCallEvent } from '@strands-agents/sdk'

const NEEDS_APPROVAL = ['delete_order']

const log = (message) => console.log(`[hook:approval] ${message}`)

export function addApprovalHooks(agent) {
  agent.addHook(BeforeToolCallEvent, (event) => {
    const { name, input } = event.toolUse
    // Another hook (read-only, role check) already blocked it, so don't ask.
    if (!NEEDS_APPROVAL.includes(name) || event.cancel) return

    const answer = event.interrupt({
      name: `approve_${name}`,
      reason: `The agent wants to run ${name} with ${JSON.stringify(input)}.`,
    })

    if (answer === 'yes') {
      log(`${name} approved`)
      return
    }
    event.cancel = `${name} was not approved by a human. Do not try again.`
    log(`${name} rejected`)
  })
}
