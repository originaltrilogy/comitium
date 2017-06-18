// subscriptions model

'use strict';

module.exports = {
  stats: stats,
  topics: topics,
  unread: unread,
  breadcrumbs: breadcrumbs,
  metaData: metaData
};


function stats(userID, emitter) {
  // See if this user's private topic stats are already cached
  var cacheKey = 'models-subscriptions-stats',
      scope = 'subscriptions-' + userID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
    // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      stats: function (emitter) {
        app.toolbox.dbPool.connect(function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select count("topicID") as "topics" from "topicSubscriptions" where "userID" = $1;',
              [ userID ],
              function (err, result) {
                done();
                if ( err ) {
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', result.rows);
                }
              }
            );
          }
        });
      }
    }, function (output) {

      if ( output.listen.success ) {
        // Cache the discussion info object for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: output.stats[0]
          });
        }

        emitter.emit('ready', output.stats[0]);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}



function unread(args, emitter) {
  // See if this user's unread private topics are already cached
  var cacheKey = 'models-subscriptions-unread',
      scope = 'subscriptions-' + args.userID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      unread: function (emitter) {
        app.toolbox.dbPool.connect(function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query({
                name: 'subscriptions_unread',
                text: 'select p."topicID" from posts p join "topicSubscriptions" ts on ts."userID" = $1 and p."topicID" = ts."topicID" and p.id = ( select id from posts where "topicID" = ts."topicID" and "userID" <> $1 order by created desc limit 1 ) left join "topicViews" tv on ts."topicID" = tv."topicID" and tv."userID" = $1 where tv.time < p.created or tv.time is null;',
                values: [ args.userID ]
              }, function (err, result) {
                done();
                if ( err ) {
                  emitter.emit('error', err);
                } else {
                  if ( result.rows.length ) {
                    emitter.emit('ready', result.rows);
                  } else {
                    emitter.emit('ready', false);
                  }
                }
            });
          }
        });
      }
    }, function (output) {

      if ( output.listen.success ) {
        // Cache the data for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: output.unread
          });
        }

        emitter.emit('ready', output.unread);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}



function topics(args, emitter) {
  // See if this topic subset is already cached
  var start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'topics-' + start + '-' + end,
      scope = 'subscriptions-' + args.userID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve the subset and cache it
  } else {
    app.listen({
      topics: function (emitter) {
        app.toolbox.dbPool.connect(function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select t.id, t."discussionID", t."sticky", t."replies", t."titleHtml", t.url, p."created" as "postDate", p2.id as "lastPostID", p2."created" as "lastPostCreated", u."id" as "topicStarterID", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."id" as "lastPostAuthorID", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
              'from topics t ' +
              'join "topicSubscriptions" ts on ts."userID" = $1 ' +
              'join posts p on p."topicID" = ts."topicID" ' +
              'and p."id" = ( select id from posts where "topicID" = t.id and draft = false order by created asc limit 1 ) ' +
              'join users u on u.id = p."userID" ' +
              'join posts p2 on p2."topicID" = ts."topicID" ' +
              'and p2."id" = ( select id from posts where "topicID" = t.id and draft = false order by created desc limit 1 ) ' +
              'join users u2 on u2.id = p2."userID" ' +
              'and t.draft = false ' +
              'order by p2.created desc ' +
              'limit $2 offset $3;',
              [ args.userID, end - start, start ],
              function (err, result) {
                done();
                if ( err ) {
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', result.rows);
                }
              }
            );
          }
        });
      }
    }, function (output) {
      var subset = {};

      if ( output.listen.success ) {
        // Build a view-ready object containing only the posts in the requested subset
        for ( var i = 0; i < end - start; i += 1 ) {
          if ( output.topics[i] ) {
            subset[i] = {};
            for ( var property in output.topics[i] ) {
              if ( output.topics[i].hasOwnProperty(property) ) {
                subset[i][property] = output.topics[i][property];
                if ( property === 'replies' ) {
                  subset[i][property + 'Formatted'] = app.toolbox.numeral(output.topics[i][property]).format('0,0');
                } else if ( property === 'postDate' || property === 'lastPostCreated' ) {
                  subset[i][property + 'Formatted'] = app.toolbox.moment.tz(output.topics[i][property], 'America/New_York').format('D-MMM-YYYY');
                }
              }
            }
          } else {
            break;
          }
        }

        // Cache the subset for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: subset
          });
        }

        emitter.emit('ready', subset);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}


function breadcrumbs() {
  return {
    a: {
      name: 'Home',
      url: app.config.comitium.basePath
    }
  };
}


function metaData() {
  return {
    title: 'Discussion View',
    description: 'This is the discussion view template.',
    keywords: 'discussion, view'
  };
}
