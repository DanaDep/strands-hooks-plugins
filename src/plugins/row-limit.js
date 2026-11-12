import { addRowLimitHooks } from '../hooks/row-limit.js'

export class RowLimitPlugin {
  name = 'row-limit'

  constructor({ maxRows = 10 } = {}) {
    this.maxRows = maxRows
  }

  initAgent(agent) {
    addRowLimitHooks(agent, { maxRows: this.maxRows })
  }
}
