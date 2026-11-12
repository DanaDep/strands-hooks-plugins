import { addPrivacyHooks } from '../hooks/privacy.js'
import { addPlaceholderHooks } from '../hooks/placeholder.js'
import { loadCustomerNames } from '../customers.js'

export class CustomerDataProtectionPlugin {
  name = 'customer-data-protection'

  async initAgent(agent) {
    addPrivacyHooks(agent)
    addPlaceholderHooks(agent, { customers: await loadCustomerNames() })
  }
}
