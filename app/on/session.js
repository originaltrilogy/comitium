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
  var cookie = {},
      session = {},
      active;
  
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

          app.models.user.log({
            userID: user.userID,
            action: 'Session start (cookied)',
            ip: app.toolbox.helpers.ip(params.request)
          });
          
          emitter.emit('ready', {
            session: user
          });
        } else {
          emitter.emit('ready', {
            cookie: {
              comitium_id: {
                expires: 'now'
              },
              comitium_active: {
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
    
    session.groupID = 1;
    active = app.toolbox.helpers.isoDate();
    
    cookie.comitium_active = {
      value: active,
      expires: 'never'
    };
    
    if ( params.cookie.comitium_active ) {
      session.lastActivity = params.cookie.comitium_active;
    } else {
      session.lastActivity = active;
    }

    emitter.emit('ready', {
      cookie: cookie,
      session: session
    });

  }
}
