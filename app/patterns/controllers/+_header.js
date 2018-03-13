// _header controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  if ( !params.session.username ) {
    emitter.emit('ready', {
      content: {
        logo: app.resources.images.logoHorizontal
      }
    });
  } else {
    app.listen({
      unreadTopics: function (emitter) {
        app.models.subscriptions.unread({
          userID: params.session.userID
        }, emitter);
      },
      unreadPrivateTopics: function (emitter) {
        app.models['private-topics'].unread({
          userID: params.session.userID
        }, emitter);
      }
    }, function (output) {
      if ( output.listen.success ) {
        emitter.emit('ready', {
          content: {
            unread: {
              topics: output.unreadTopics,
              privateTopics: output.unreadPrivateTopics
            },
            logo: app.resources.images.logoHorizontal
          }
        });
      } else {
        emitter.emit('error', output.listen);
      }
    });
  }
}
