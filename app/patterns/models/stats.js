// statistics model

'use strict';

module.exports = {
  topics: topics,
  posts: posts,
  users: users
};



function topics(emitter) {
  var cacheKey = 'topics',
      scope = 'stats',
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve the topic count and cache it
  } else {
    app.toolbox.pg.connect(app.config.comitium.db.connectionString, function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err);
      } else {
        client.query(
          'select count("id") as "topicCount" from "topics" where "discussionID" <> 0 and "discussionID" <> 1 and "draft" = false;',
          function (err, result) {
            done();
            if ( err ) {
              emitter.emit('error', err);
            } else {
              // Cache the topic count for future requests
              if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
                app.cache.set({
                  scope: scope,
                  key: cacheKey,
                  value: result.rows[0].topicCount
                });
              }
              emitter.emit('ready', result.rows[0].topicCount);
            }
          }
        );
      }
    });
  }
}



function posts(emitter) {
  var cacheKey = 'posts',
      scope = 'stats',
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve the post count and cache it
  } else {
    app.toolbox.pg.connect(app.config.comitium.db.connectionString, function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err);
      } else {
        client.query(
          'select count(p."id") as "postCount" from "posts" p join "topics" t on p."topicID" = t."id" where t."discussionID" <> 0 and t."discussionID" <> 1 and t."draft" = false and p."draft" = false;',
          function (err, result) {
            done();
            if ( err ) {
              emitter.emit('error', err);
            } else {
              // Cache the post count for future requests
              if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
                app.cache.set({
                  scope: scope,
                  key: cacheKey,
                  value: result.rows[0].postCount
                });
              }
              emitter.emit('ready', result.rows[0].postCount);
            }
          }
        );
      }
    });
  }
}



function users(emitter) {
  var cacheKey = 'users',
      scope = 'stats',
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve the user count and cache it
  } else {
    app.toolbox.pg.connect(app.config.comitium.db.connectionString, function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err);
      } else {
        client.query(
          'select count("id") as "userCount" from "users" where "activated" = true;',
          function (err, result) {
            done();
            if ( err ) {
              emitter.emit('error', err);
            } else {
              // Cache the user count for future requests
              if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
                app.cache.set({
                  scope: scope,
                  key: cacheKey,
                  value: result.rows[0].userCount
                });
              }
              emitter.emit('ready', result.rows[0].userCount);
            }
          }
        );
      }
    });
  }
}
