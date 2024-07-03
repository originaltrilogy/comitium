// announcement controller

// use the head action from the topic controller
import { head } from './topic.js'


export const handler = async () => {
  return {
    view: false,
    next: {
      controller: 'topic',
      view: 'announcement'
    }
  }
}


export { head }
