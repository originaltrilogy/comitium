/* global app */
/* global CTZN */

'use strict';

var pg = require('pg'),
    connectionString = "pg://originaltrilogy:orangedockdeskhue@localhost/originaltrilogy",
    count = 0;

global.app = require('citizen');

CTZN.config.citizen.requestTimeout = 60000000;

function buildMethodGroup(emitter) {
    var methodGroup = {},
        toMarkdown = require('to-markdown');

    pg.connect(connectionString, function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err);
      } else {
        client.query(
          'select "id", "html" from "posts" where "text" = \'\' order by "id" desc limit 5000;',
          function (err, result) {
            done();
            if ( err ) {
              emitter.emit('error', err);
            } else {
              if ( result.rows.length ) {
                console.log('processing ' + result.rows.length + ' posts');
                result.rows.forEach( function (item, index, array) {

                  methodGroup['row' + item.id] = function (emitter) {
                    var text;

                    try {
                      text = toMarkdown(item.html !== null ? item.html.replace(/&quot;/g, '"').replace(/&amp;/g, '&') : ' ');
                    } catch ( err ) {
                      text = item.html;
                    }

                    pg.connect(connectionString, function (err, client, done) {
                      if ( err ) {
                        console.log('error');
                        emitter.emit('error', err);
                      } else {
                        client.query(
                          'update "posts" set "text" = $1 where "id" = $2;',
                          [ text, item.id ],
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
                  };
                });
                emitter.emit('ready', {
                  results: result.rows.length,
                  methodGroup: methodGroup
                });
              } else {
                emitter.emit('ready', false);
              }
            }
          }
        );
      }
    });
}

function runMethods() {
  app.listen('waterfall', {
    buildMethodGroup: function (emitter) {
      buildMethodGroup(emitter);
    },
    update: function (previous, emitter) {
      if ( previous.buildMethodGroup && previous.buildMethodGroup.methodGroup ) {
        count += previous.buildMethodGroup.results;
        app.listen(previous.buildMethodGroup.methodGroup, function (output) {
          if ( output.listen.success ) {
            emitter.emit('ready', {
              continue: true
            });
          } else {
            emitter.emit('error', output.listen);
          }
        });
      } else {
        emitter.emit('ready', {
          continue: false
        });
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.update.continue ) {
        runMethods();
        console.log(count + ' posts processed, continuing...');
      } else {
        console.log('post markdown update done');
      }
    } else {
      console.log(output.listen);
    }
  });
}

runMethods();
