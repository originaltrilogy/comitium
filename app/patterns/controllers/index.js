// index controller

'use strict';

module.exports = {
  handler: handler,
  head: head
};


function handler(params, context, emitter) {
  emitter.emit('ready', {
    handoff: {
      controller: 'discussions'
    },
    view: false
  });
}


function head(params, context, emitter) {
  emitter.emit('ready', app.models.index.metaData());
}
