// sign out controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  emitter.emit('ready', {
    cache: {
      controller: true,
      directives: ['cookie', 'session']
    },
    cookie: {
      comitium_id: {
        expires: 'now'
      }
    },
    session: {
      expires: 'now'
    }
  });
}
