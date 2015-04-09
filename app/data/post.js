// SQL queries related to posts

'use strict';

module.exports = {
  info: info,
  bookmarkExists: bookmarkExists,
  bookmarkInsert: bookmarkInsert,
  bookmarkDelete: bookmarkDelete
};


function info(post, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.postInfo),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            if ( rows.length ) {
              emitter.emit('ready', rows[0]);
            } else {
              emitter.emit('ready', false);
            }
          }
          done();
        }
      );
    }
  });
}


function bookmarkExists(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.postBookmarkExists),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            if ( rows.length ) {
              emitter.emit('ready', true);
            } else {
              emitter.emit('ready', false);
            }
          }
          done();
        }
      );
    }
  });
}


function bookmarkInsert(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.postBookmarkInsert),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.id);
          }
          done();
        }
      );
    }
  });
}


function bookmarkDelete(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.postBookmarkDelete),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready');
          }
          done();
        }
      );
    }
  });
}
