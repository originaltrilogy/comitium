/* global app */
/* global CTZN */

'use strict';

var fs = require('fs'),
    pg = require('pg'),
    connectionString = "pg://originaltrilogy:orangedockdeskhue@localhost/originaltrilogy";

global.app = require('citizen');

CTZN.config.citizen.requestTimeout = 60000000;

app.listen('waterfall', {
  methodGroup: function (emitter) {
    var defaultAvatar,
        methodGroup = {};

    fs.readFile('../app/resources/default-avatar.jpg', function (err, file) {
      if ( err ) {
        emitter.emit('error', err);
      } else {
        defaultAvatar = file;

        pg.connect(connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select "id" from users order by id asc;',
              function (err, result) {
                done();
                if ( err ) {
                  emitter.emit('error', err);
                } else {
                  console.log(result.rows.length + ' avatars to assess');
                  methodGroup['row' + result.rows[0].id] = function (emitter) {
                    fs.readFile('../web/avatars/' + result.rows[0].id + '.jpg', function (err, file) {
                      if ( err ) {
                        fs.writeFile('../web/avatars/' + result.rows[0].id + '.jpg', defaultAvatar, function (err) {
                          if ( err ) {
                            emitter.emit('error', err);
                          } else {
                            emitter.emit('ready');
                          }
                        });
                      } else {
                        emitter.emit('ready');
                      }
                    });
                  };
                  result.rows.forEach( function (item, index, array) {
                    if ( index > 0 ) {
                      methodGroup['row' + item.id] = function (previous, emitter) {
                        fs.readFile('../web/avatars/' + item.id + '.jpg', function (err, file) {
                          if ( err ) {
                            fs.writeFile('../web/avatars/' + item.id + '.jpg', defaultAvatar, function (err) {
                              if ( err ) {
                                emitter.emit('error', err);
                              } else {
                                emitter.emit('ready');
                              }
                            });
                          } else {
                            emitter.emit('ready');
                          }
                        });
                      };
                    }
                  });
                  emitter.emit('ready', methodGroup);
                }
              }
            );
          }
        });
      }
    });
  },
  write: function (previous, emitter) {
    console.log('writing files...');
    app.listen('waterfall', previous.methodGroup, function (output) {
      emitter.emit('ready');
    });
  }
}, function (output) {
  if ( output.listen.success ) {
    console.log('default avatars created');
  } else {
    console.log(output.listen);
  }
});
