// announcement controller

'use strict';

module.exports = {
  handler: handler
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
