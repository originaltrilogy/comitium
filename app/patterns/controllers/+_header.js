// _header controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  if ( !params.session.username ) {
    emitter.emit('ready');
  } else {
    app.listen({
        updates: function (emitter) {
          app.models['private-topics'].unread({
            userID: params.session.userID
          }, emitter);
        }
      }, function (output) {
        if ( output.listen.success ) {
          emitter.emit('ready', {
            content: {
              updates: output.updates
            }
          });
        } else {
          emitter.emit('error', output.listen);
        }
    });
  }
}
