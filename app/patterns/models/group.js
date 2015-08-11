// group model

'use strict';

module.exports = {
  discussionPermissions: discussionPermissions
};


function discussionPermissions(discussionID, groupID, emitter) {
  // See if this discussion's permissions are already cached
  var cacheKey = 'models-group-discussionPermissions-' + discussionID,
      scope = 'group-' + groupID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      discussionPermissions: function (emitter) {
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select id, "groupID", "discussionID", read, post, reply from "discussionPermissions" where "groupID" = $1 and "discussionID" = $2;',
              [ groupID, discussionID ],
              function (err, result) {
                done();
                if ( err ) {
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', result.rows);
                }
            });
          }
        });
      }
    }, function (output) {

      if ( output.listen.success ) {

        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            scope: scope,
            key: cacheKey,
            value: output.discussionPermissions[0]
          });
        }

        emitter.emit('ready', output.discussionPermissions[0]);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}
