/* global app */
/* global CTZN */

'use strict';

var bcrypt = require('bcrypt'),
    pg = require('pg'),
    connectionString = "pg://originaltrilogy:orangedockdeskhue@localhost/originaltrilogy";

global.app = require('citizen');

CTZN.config.citizen.requestTimeout = 60000000;

app.listen('waterfall', {
  methodGroup: function (emitter) {
    var methodGroup = {};

    pg.connect(connectionString, function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err);
      } else {
        client.query(
          'select "id", "username" from users order by "username" asc;',
          function (err, result) {
            done();
            if ( err ) {
              emitter.emit('error', err);
            } else {
              console.log(result.rows.length + ' users to process');
              result.rows.forEach( function (item, index, array) {
                methodGroup['row' + item.id] = function (emitter) {

                  bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(item.username, salt, function(err, hash) {
                      pg.connect(connectionString, function (err, client, done) {
                        if ( err ) {
                          emitter.emit('error', err);
                        } else {
    
                          client.query(
                            'update users set "usernameHash" = $1 where "id" = $2;',
                            [ hash, item.id ],
                            function (err, result) {
                              done();
                              if ( err ) {
                                emitter.emit('error', err);
                              } else {
                                emitter.emit('ready');
                              }
                            }
                          );
    
                        }
                      });
                    });
                  });

                };
              });
              emitter.emit('ready', methodGroup);
            }
          }
        );
      }
    });
  },
  update: function (previous, emitter) {
    console.log('running update...');
    app.listen(previous.methodGroup, function (output) {
      emitter.emit('ready');
    });
  }
}, function (output) {
  if ( output.listen.success ) {
    console.log('username hash done');
  } else {
    console.log('not done yet');
  }
});
