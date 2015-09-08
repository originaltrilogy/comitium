/* global app */
/* global CTZN */

'use strict';

var pg = require('pg'),
    connectionString = "pg://originaltrilogy:orangedockdeskhue@localhost/originaltrilogy";

global.app = require('citizen');

CTZN.config.citizen.requestTimeout = 60000000;

app.listen('waterfall', {
  methodGroup: function (emitter) {
    var methodGroup = {},
        toMarkdown = require('to-markdown');

    pg.connect(connectionString, function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err);
      } else {
        client.query(
          'select "id", "signatureHtml" from users where "signatureHtml" is not null order by id asc;',
          function (err, result) {
            done();
            if ( err ) {
              emitter.emit('error', err);
            } else {
              console.log(result.rows.length + ' signatures to process');
              result.rows.forEach( function (item, index, array) {
                methodGroup['row' + item.id] = function (emitter) {
                  pg.connect(connectionString, function (err, client, done) {
                    var signature;

                    try {
                      signature = toMarkdown(item.signatureHtml.replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
                    } catch ( err ) {
                      signature = item.signatureHtml;
                    }

                    if ( err ) {
                      emitter.emit('error', err);
                    } else {
                      client.query(
                        'update "users" set "signature" = $1 where "id" = $2;',
                        [ signature, item.id ],
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
    console.log('running updates...');
    app.listen(previous.methodGroup, function (output) {
      emitter.emit('ready');
    });
  }
}, function (output) {
  if ( output.listen.success ) {
    console.log('user signature markdown done');
  } else {
    console.log(output.listen);
  }
});
