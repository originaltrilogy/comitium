// index controller

'use strict';

module.exports = {
  handler: handler,
  head: head
};


function handler(params, context, emitter) {
  emitter.emit('ready');
}


function head(params, context, emitter) {
  emitter.emit('ready', app.models.index.metaData());
}
