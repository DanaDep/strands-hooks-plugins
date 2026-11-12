import { addReadOnlyHooks } from '../hooks/read-only.js'
import { addRoleCheckHooks } from '../hooks/role-check.js'
import { addApprovalHooks } from '../hooks/approval.js'

export class WriteAccessPlugin {
  name = 'write-access'

  constructor({ user, readOnly = true }) {
    this.user = user
    this.readOnly = readOnly
  }

  // Order matters: approval skips tools that read-only or the role check already blocked.
  initAgent(agent) {
    if (this.readOnly) addReadOnlyHooks(agent)
    addRoleCheckHooks(agent, { user: this.user })
    addApprovalHooks(agent)
  }
}
