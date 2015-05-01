// group model

'use strict';

module.exports = {
  discussionPermissions: discussionPermissions
};


function discussionPermissions(discussion, groupID, emitter) {
  // See if this discussion's permissions are already cached
  var cacheKey = 'models-group-discussionPermissions-' + discussion,
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
              'select id, "groupID", "discussionID", read, post, reply from "discussionPermissions" where "groupID" = $1 and "discussionID" = ( select d.id from discussions d where d.url = $2 );',
              [ groupID, discussion ],
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
        app.cache.set({
          scope: scope,
          key: cacheKey,
          value: output.discussionPermissions[0]
        });

        emitter.emit('ready', output.discussionPermissions[0]);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}
