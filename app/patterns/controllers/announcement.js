// announcement controller

'use strict'

module.exports = {
  handler : handler,
  head    : require('./topic').head
}



function handler() {
  return {
    view: false,
    handoff: {
      controller: 'topic',
      view: 'announcement'
    }
  }
}
