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
        toMarkdown = require('to-markdown').toMarkdown;

    pg.connect(connectionString, function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err);
      } else {
        client.query(
          'select "id", "html" from "posts" where "id" > 750000 and "markdown" = \' \' order by "id" asc;',
          function (err, result) {
            done();
            if ( err ) {
              emitter.emit('error', err);
            } else {
              console.log(result.rows.length + ' posts to process');
              result.rows.forEach( function (item, index, array) {

                methodGroup['row' + item.id] = function (emitter) {
                  var postMarkdown = toMarkdown(item.html !== null ? item.html.replace(/&quot;/g, '"').replace(/&amp;/g, '&') : ' ');

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



// app.listen('waterfall', {
//   methodGroup: function (emitter) {
//     var methodGroup = {},
//         toMarkdown = require('to-markdown').toMarkdown,
//         count = 0;
//
//     pg.connect(connectionString, function (err, client, done) {
//       if ( err ) {
//         emitter.emit('error', err);
//       } else {
//         client.query(
//           'select id, html from posts where markdown is null;',
//           function (err, result) {
//             var postCount = result.rows.length;
//
//             done();
//             if ( err ) {
//               emitter.emit('error', err);
//             } else {
//               console.log(postCount + ' posts to process');
//               result.rows.forEach( function (item, index, array) {
//                 var postMarkdown = toMarkdown(item.html || '');
//
//                 methodGroup['row' + item.id] = function (emitter) {
//
//                   pg.connect(connectionString, function (err, client, done) {
//
//                     if ( err ) {
//                       emitter.emit('error', err);
//                     } else {
//                       client.query(
//                         'update posts set markdown = $1 where id = $2;',
//                         [ postMarkdown, item.id ],
//                         function (err, result) {
//                           count += 1;
//                           if ( count % 1000 === 0 ) {
//                             console.log((postCount - count ) + ' remaining...');
//                           }
//                           done();
//                           if ( err ) {
//                             console.log(err);
//                             emitter.emit('error', {
//                               message: 'Error: ' + item.id
//                             });
//                           } else {
//                             emitter.emit('ready');
//                           }
//                         }
//                       );
//                     }
//                   });
//                 };
//               });
//               emitter.emit('ready', methodGroup);
//             }
//           }
//         );
//       }
//     });
//   },
//   update: function (previous, emitter) {
//     console.log('running updates...');
//     app.listen(previous.methodGroup, function (output) {
//       emitter.emit('ready');
//     });
//   }
// }, function (output) {
//   console.log('post content markdown done');
// });
