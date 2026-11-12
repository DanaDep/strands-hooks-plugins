import { Agent } from '@strands-agents/sdk'
import { ShopToolsPlugin } from './plugins/shop-tools.js'
import { LoggingPlugin } from './plugins/logging.js'
import { CustomerDataProtectionPlugin } from './plugins/customer-data-protection.js'
import { RowLimitPlugin } from './plugins/row-limit.js'
import { WriteAccessPlugin } from './plugins/write-access.js'

export function createAgent({ user, readOnly = true, maxRows = 10 }) {
  return new Agent({
    systemPrompt:
      'You are a data assistant for the employees of a small shop. Answer questions using the tools. ' +
      'If no tool can answer the question, say so. Keep answers short.',
    plugins: [
      new ShopToolsPlugin(),
      new LoggingPlugin(),
      new CustomerDataProtectionPlugin(),
      new RowLimitPlugin({ maxRows }),
      new WriteAccessPlugin({ user, readOnly }),
    ],
  })
}
