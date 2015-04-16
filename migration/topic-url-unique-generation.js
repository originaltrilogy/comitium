/* global app */
/* global CTZN */

'use strict';

var pg = require('pg'),
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
          'select "id", "url" from topics order by "url" asc;',
          function (err, result) {
            done();
            if ( err ) {
              emitter.emit('error', err);
            } else {
              console.log(result.rows.length + ' topics to process');
              result.rows.forEach( function (item, index, array) {
                methodGroup['row' + item.id] = function (emitter) {
                  pg.connect(connectionString, function (err, client, done) {
                    if ( err ) {
                      emitter.emit('error', err);
                    } else {
                      client.query(
                        'select "id", "url" from topics where "url" = $1 order by "sortDate" asc;',
                        [ item.url ],
                        function (err, result) {
                          if ( err ) {
                            done();
                            emitter.emit('error', {
                              message: 'Error: ' + item.id
                            });
                          } else {
                            if ( result.rows.length > 1 && result.rows[0].id !== item.id ) {

                                client.query(
                                  'update topics set "url" = "url" || \'-\' || "id" where "id" = $1;',
                                  [ item.id ],
                                  function (err, result) {
                                    done();
                                    if ( err ) {
                                      emitter.emit('error', {
                                        message: 'Error: ' + item.id
                                      });
                                    } else {
                                      emitter.emit('ready');
                                    }
                                  }
                                );

                            } else {
                              done();
                              emitter.emit('ready');
                            }
                          }
                        }
                      );
                    }
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
    console.log('topic url dedupe done');
  } else {
    console.log('not done yet');
  }
});
