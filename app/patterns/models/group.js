// group model

'use strict';

module.exports = {
  discussionPermissions: discussionPermissions,
  info: info,
  memberCount: memberCount
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
        app.toolbox.dbPool.connect(function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select "groupID", "discussionID", "read", "post", "reply" from "discussionPermissions" where "groupID" = $1 and "discussionID" = $2;',
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


function info(groupID, emitter) {
  var cacheKey = 'info-' + groupID,
      scope = 'group',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached)
  // If it's not cached, retrieve the user count and cache it
  } else {
    app.toolbox.dbPool.connect(function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err)
      } else {
        client.query({
          name: 'group_info',
          text: 'select id, name, url, description, login, post, reply, "talkPrivately", "moderateDiscussions", "administrateDiscussions", "moderateUsers", "administrateUsers", "administrateApp", "bypassLockdown", system, locked from groups where id = $1;',
          values: [ groupID ]
        }, function (err, result) {
          done()
          if ( err ) {
            emitter.emit('error', err)
          } else {
            if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
              app.cache.set({
                scope: scope,
                key: cacheKey,
                value: result.rows[0]
              })
            }
            emitter.emit('ready', result.rows[0])
          }
        })
      }
    })
  }
}


function memberCount(groupID, emitter) {
  var cacheKey = 'memberCount-' + groupID,
      scope = 'group',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached)
  // If it's not cached, retrieve the user count and cache it
  } else {
    app.toolbox.dbPool.connect(function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err)
      } else {
        client.query({
          name: 'group_memberCount',
          text: 'select count(id) as count from users where "groupID" = $1 and activated = true;',
          values: [ groupID ]
        }, function (err, result) {
          done()
          if ( err ) {
            emitter.emit('error', err)
          } else {
            if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
              app.cache.set({
                scope: scope,
                key: cacheKey,
                value: result.rows[0].count
              })
            }
            emitter.emit('ready', result.rows[0].count)
          }
        })
      }
    })
  }
}
