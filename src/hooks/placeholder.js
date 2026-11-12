import {
  BeforeInvocationEvent,
  BeforeToolCallEvent,
  AfterToolCallEvent,
  AfterInvocationEvent,
  Message,
  TextBlock,
  JsonBlock,
  ToolResultBlock,
} from '@strands-agents/sdk'

const log = (message) => console.log(`[hook:placeholder] ${message}`)

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function buildSwapper(customers) {
  const toPlaceholder = []
  const toReal = new Map()

  for (const { id, firstName, lastName } of customers) {
    const placeholder = `CUSTOMER_${id}`
    toReal.set(placeholder, `${firstName} ${lastName}`)
    // Full name first, so "Kari Hansen" becomes one placeholder, not two.
    for (const name of [`${firstName} ${lastName}`, firstName, lastName]) {
      toPlaceholder.push([new RegExp(`\\b${escape(name)}\\b`, 'gi'), placeholder])
    }
  }

  return {
    hide: (text) => toPlaceholder.reduce((out, [pattern, placeholder]) => out.replace(pattern, placeholder), text),
    reveal: (text) => text.replace(/CUSTOMER_\d+/g, (placeholder) => toReal.get(placeholder) ?? placeholder),
  }
}

function mapStrings(value, fn) {
  if (typeof value === 'string') return fn(value)
  if (Array.isArray(value)) return value.map((item) => mapStrings(item, fn))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, mapStrings(inner, fn)]))
  }
  return value
}

export function addPlaceholderHooks(agent, { customers }) {
  const { hide, reveal } = buildSwapper(customers)

  agent.addHook(BeforeInvocationEvent, (event) => {
    event.messages = event.messages.map((message) => {
      if (message.role !== 'user') return message
      const content = message.content.map((block) =>
        block instanceof TextBlock ? new TextBlock(hide(block.text)) : block,
      )
      return new Message({ role: message.role, content })
    })
  })

  agent.addHook(BeforeToolCallEvent, (event) => {
    const input = mapStrings(event.toolUse.input, reveal)
    if (JSON.stringify(input) === JSON.stringify(event.toolUse.input)) return
    log(`tool input for ${event.toolUse.name}: ${JSON.stringify(event.toolUse.input)} -> ${JSON.stringify(input)}`)
    event.toolUse = { ...event.toolUse, input }
  })

  agent.addHook(AfterToolCallEvent, (event) => {
    const content = event.result.content.map((block) => {
      if (block instanceof JsonBlock) return new JsonBlock({ json: mapStrings(block.json, hide) })
      if (block instanceof TextBlock) return new TextBlock(hide(block.text))
      return block
    })
    event.result = new ToolResultBlock({
      toolUseId: event.result.toolUseId,
      status: event.result.status,
      content,
    })
  })

  agent.addHook(AfterInvocationEvent, (event) => {
    const last = event.agent.messages.at(-1)
    if (last?.role !== 'assistant') return
    const text = last.content.filter((block) => block instanceof TextBlock).map((block) => block.text).join('')
    if (!/CUSTOMER_\d+/.test(text)) return
    console.log()
    log(`answer with real names:\n${reveal(text).trim()}`)
  })
}
