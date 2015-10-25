// announcement controller

'use strict';

module.exports = {
  handler: handler,
  head: require('./topic').head
};



function handler(params, context, emitter) {
  emitter.emit('ready', {
    view: false,
    handoff: {
      controller: 'topic',
      view: 'announcement'
    }
  });
}
