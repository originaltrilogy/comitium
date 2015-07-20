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
          'select "id", "html" from "posts" where "markdown" = \' \' order by "id" desc limit 15000;',
          function (err, result) {
            done();
            if ( err ) {
              emitter.emit('error', err);
            } else {
              console.log(result.rows.length + ' posts to process');
              result.rows.forEach( function (item, index, array) {

                methodGroup['row' + item.id] = function (emitter) {
                  var postMarkdown;

                  try {
                    postMarkdown = toMarkdown(item.html !== null ? item.html.replace(/ data-ft="{&quot;tn&quot;:&quot;K&quot;}"/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&') : ' ');
                  } catch ( err ) {
                    console.log(item.id + ':');
                    console.log(item.html);
                    emitter.emit('error', err);
                  }

                  pg.connect(connectionString, function (err, client, done) {
                    if ( err ) {
                      console.log('error');
                      emitter.emit('error', err);
                    } else {
                      client.query(
                        'update "posts" set "markdown" = $1 where "id" = $2;',
                        [ postMarkdown, item.id ],
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
              emitter.emit('ready', methodGroup);
            }
          }
        );
      }
    });
  },
  update: function (previous, emitter) {
    app.listen(previous.methodGroup, function (output) {
      emitter.emit('ready');
    });
  }
}, function (output) {
  if ( output.listen.success ) {
    console.log('post markdown update done');
  } else {
    console.log('not done yet');
  }
});
