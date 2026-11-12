import { dbTools } from '../tools.js'

export class ShopToolsPlugin {
  name = 'shop-tools'

  initAgent() {}

  getTools() {
    return dbTools
  }
}
