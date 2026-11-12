import { addLoggingHooks } from '../hooks/logging.js'

export class LoggingPlugin {
  name = 'logging'

  initAgent(agent) {
    addLoggingHooks(agent)
  }
}
