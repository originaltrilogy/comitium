// index controller

'use strict'

module.exports = {
  handler : handler,
  head    : head
}


function handler() {
  return {
    handoff: {
      controller: 'discussions'
    },
    view: false
  }
}


function head() {
  return app.models.index.metaData()
}
