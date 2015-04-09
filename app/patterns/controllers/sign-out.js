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
      tehUsername: {
        expires: 'now'
      },
      tehPassword: {
        expires: 'now'
      }
    },
    session: {
      expires: 'now'
    },
    handoff: {
      controller: '+_layout'
    }
  });
}
