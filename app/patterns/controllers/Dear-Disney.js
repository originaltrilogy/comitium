// index controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  // emitter.emit('ready');
  emitter.emit('ready');
}
