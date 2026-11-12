import {
  BeforeInvocationEvent,
  AfterInvocationEvent,
  BeforeToolCallEvent,
  AfterToolCallEvent,
} from '@strands-agents/sdk'

const log = (message) => console.log(`[hook:logging] ${message}`)

export function addLoggingHooks(agent) {
  let invocationStart
  const toolStarts = new Map()

  agent.addHook(BeforeInvocationEvent, () => {
    invocationStart = Date.now()
    log('agent started')
  })

  agent.addHook(BeforeToolCallEvent, (event) => {
    const { name, toolUseId, input } = event.toolUse
    toolStarts.set(toolUseId, Date.now())
    log(`tool ${name} called with ${JSON.stringify(input)}`)
  })

  agent.addHook(AfterToolCallEvent, (event) => {
    const { name, toolUseId } = event.toolUse
    const ms = Date.now() - toolStarts.get(toolUseId)
    toolStarts.delete(toolUseId)
    log(`tool ${name} finished: ${event.result.status} in ${ms} ms`)
  })

  agent.addHook(AfterInvocationEvent, () => {
    console.log()
    log(`agent finished in ${Date.now() - invocationStart} ms`)
  })
}
