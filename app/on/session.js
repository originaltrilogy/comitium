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
  if ( params.cookie.comitium_username && params.cookie.comitium_password ) {

    app.listen({
      authenticate: function (emitter) {
        app.models.user.authenticate({
          username: params.cookie.comitium_username,
          passwordHash: params.cookie.comitium_password
        }, emitter);
      }
    }, function (output) {

      if ( output.listen.success ) {

        if ( output.authenticate.success ) {
          emitter.emit('ready', {
            session: output.authenticate.user
          });
        } else {
          emitter.emit('ready', {
            cookie: {
              comitium_username: {
                expires: 'now'
              },
              comitium_password: {
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
