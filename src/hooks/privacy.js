import { AfterToolCallEvent, ToolResultBlock, JsonBlock, TextBlock } from '@strands-agents/sdk'

const PRIVATE_FIELDS = ['email', 'phone', 'dateOfBirth', 'street', 'postalCode']
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g

const log = (message) => console.log(`[hook:privacy] ${message}`)

function mask(value, counter) {
  if (Array.isArray(value)) return value.map((item) => mask(item, counter))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => {
        if (PRIVATE_FIELDS.includes(key) && inner !== null) {
          counter.count += 1
          return [key, `[hidden ${key}]`]
        }
        return [key, mask(inner, counter)]
      }),
    )
  }
  if (typeof value === 'string') return maskText(value, counter)
  return value
}

function maskText(text, counter) {
  return text.replace(EMAIL, () => {
    counter.count += 1
    return '[hidden email]'
  })
}

export function addPrivacyHooks(agent) {
  agent.addHook(AfterToolCallEvent, (event) => {
    const counter = { count: 0 }

    const content = event.result.content.map((block) => {
      if (block instanceof JsonBlock) return new JsonBlock({ json: mask(block.json, counter) })
      if (block instanceof TextBlock) return new TextBlock(maskText(block.text, counter))
      return block
    })

    if (counter.count === 0) return

    event.result = new ToolResultBlock({
      toolUseId: event.result.toolUseId,
      status: event.result.status,
      content,
    })
    log(`hid ${counter.count} private value(s) from ${event.toolUse.name}`)
  })
}
