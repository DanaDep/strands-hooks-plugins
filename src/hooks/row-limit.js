import { AfterToolCallEvent, ToolResultBlock, JsonBlock } from '@strands-agents/sdk'

const log = (message) => console.log(`[hook:row-limit] ${message}`)

function cut(value, maxRows, cuts) {
  if (Array.isArray(value)) {
    if (value.length > maxRows) cuts.push(`${maxRows} of ${value.length}`)
    return value.slice(0, maxRows).map((item) => cut(item, maxRows, cuts))
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [key, cut(inner, maxRows, cuts)]),
    )
  }
  return value
}

export function addRowLimitHooks(agent, { maxRows }) {
  agent.addHook(AfterToolCallEvent, (event) => {
    const cuts = []

    const content = event.result.content.map((block) => {
      if (!(block instanceof JsonBlock)) return block
      const json = cut(block.json, maxRows, cuts)
      if (cuts.length === 0) return block
      return new JsonBlock({
        json: { ...json, note: `List shortened to ${maxRows} rows by the row limit. Totals are still complete.` },
      })
    })

    if (cuts.length === 0) return

    event.result = new ToolResultBlock({
      toolUseId: event.result.toolUseId,
      status: event.result.status,
      content,
    })
    log(`shortened ${event.toolUse.name}: showing ${cuts.join(', ')} rows`)
  })
}
