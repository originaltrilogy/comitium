// sign out controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {

  if ( params.session.userID ) {
    app.models.user.log({
      userID: params.session.userID,
      action: 'Sign out',
      ip: app.toolbox.helpers.ip(params.request)
    });
  }

  emitter.emit('ready', {
    view: params.url.reason || 'sign-out',
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
