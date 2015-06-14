// session events

// This module optionally exports the following methods:
// start(params, context, emitter) - Called at the beginning of every user session
// end(params, context, emitter) - Called at the end of every user session

// If you have no use for this file, you can delete it.

'use strict';

module.exports = {
  start: start
};


function start(params, context, emitter) {
  // If the user has cookies from a previous session, authenticate and start a new
  // session.
  if ( params.cookie.comitium_id ) {

    app.listen({
      authenticate: function (emitter) {
        app.models.user.authenticate({
          usernameHash: params.cookie.comitium_id
        }, emitter);
      }
    }, function (output) {
      var user = output.authenticate.user;

      if ( output.listen.success ) {

        if ( output.authenticate.success ) {
          user.userID = output.authenticate.user.id;
          delete user.id;
          
          emitter.emit('ready', {
            session: user
          });
        } else {
          emitter.emit('ready', {
            cookie: {
              comitium_id: {
                expires: 'now'
              }
            },
            session: {
              groupID: 1
            }
          });
        }

      } else {

        emitter.emit('error', output.listen);

      }

    });

  } else {

    emitter.emit('ready', {
      session: {
        groupID: 1
      }
    });

  }
}
