// SQL queries related to user groups

'use strict';

module.exports = {
  discussionPermissions: discussionPermissions
};


function discussionPermissions(discussion, groupID, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.groupDiscussionPermissions),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.rows);
          }
          done();
      });
    }
  });
}
