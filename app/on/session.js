// session events

'use strict';

module.exports = {
  start: start
};


function start(params, context, emitter) {
  var cookie = {},
      session = {},
      active,
      ip = app.toolbox.helpers.ip(params.request),
      bannedIP = false;

  // Check banned IP addresses
  app.listen({
    bannedIPs: function (emitter) {
      app.models.user.bannedIPs({
        structure: 'array'
      }, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {

      // Check remote IP against banned IPs
      if ( output.bannedIPs.indexOf(ip) >= 0 ) {
        bannedIP = ip;
      }

      // Proceed if IP isn't banned
      if ( !bannedIP ) {
        // If the user has cookies from a previous session, authenticate and start a new session.
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
                user.ip = ip;
                delete user.id;

                app.models.user.log({
                  userID: user.userID,
                  action: 'Session start (cookied)',
                  ip: ip
                });

                emitter.emit('ready', {
                  cookie: {
                    comitium_active: {
                      expires: 'now'
                    }
                  },
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
          session.ip = ip;
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
      // Throw an exception if the remote IP is banned
      // TODO: Create a banned
      } else {
        emitter.emit('error', {
          statusCode: 403,
          message: 'Your IP address (' + bannedIP + ') has been banned.'
        });
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });
}
