/* global app */

'use strict';

var mysql = require('mysql');

global.app = require('citizen');

app.db = {
  connectionPool: mysql.createPool(app.config.db)
};

app.listen('waterfall', {
  users: function (emitter) {
    app.db.connectionPool.getConnection( function (err, connection) {
      if ( err ) {
        throw err;
      }
      connection.query(
        'select intUserID, vchUsername from tblForumUsers',
        function (err, rows, fields) {
          if ( err ) {
            throw err;
          }
          emitter.emit('ready', rows);
          connection.release();
      });
    });
  },
  update: function (users, emitter) {
    var updateFunctions = {};
    users.users.forEach( function (item, index, array) {
      updateFunctions[item.intUserID] = function (emitter) {
        app.db.connectionPool.getConnection( function (err, connection) {
          if ( err ) {
            throw err;
          }
          connection.query(
            'update tblForumUsers ' +
            'set vchUrlUsername = ' + connection.escape(app.dashes(item.vchUsername)) +
            ' where intUserID = ' + connection.escape(item.intUserID),
            function (err, rows, fields) {
              if ( err ) {
                throw err;
              }
              emitter.emit('ready', true);
              connection.release();
          });
        });
      };
    });
    app.listen(updateFunctions, function (output) {
      emitter.emit('ready');
    });
  }
}, function (output) {
  console.log('user urlTitle done');
});
