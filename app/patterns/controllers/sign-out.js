// sign out controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  emitter.emit('ready', {
    cache: {
      scope: 'controller',
      directives: ['cookie', 'session', 'handoff']
    },
    cookie: {
      comitium_username: {
        expires: 'now'
      },
      comitium_password: {
        expires: 'now'
      }
    },
    session: {
      expires: 'now'
    }
  });
}
