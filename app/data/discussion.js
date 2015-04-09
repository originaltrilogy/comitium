// SQL queries related to discussions

'use strict';

module.exports = {
  announcementsByDiscussion: announcementsByDiscussion,
  topicsByDiscussion: topicsByDiscussion,
  info: info,
  groupAccess: groupAccess
};


function announcementsByDiscussion(discussion, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.announcementsByDiscussion),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.rows);
          }
          done();
        }
      );
    }
  });
}


function topicsByDiscussion(discussion, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.topicsByDiscussion),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.rows);
          }
          done();
        }
      );
    }
  });
}


function info(discussion, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.discussionInfo),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.rows);
          }
          done();
        }
      );
    }
  });
}


function groupAccess(discussion, groupID, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.discussionGroupAccess),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.rows);
          }
          done();
        }
      );
    }
  });
}
