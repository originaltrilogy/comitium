// private topics model

'use strict';

module.exports = {
  stats: stats,
  topics: topics,
  breadcrumbs: breadcrumbs,
  metaData: metaData
};


function stats(userID, emitter) {
  // See if this user's private topic stats are already cached
  var cacheKey = 'models-private-topics-stats',
      scope = 'user-' + userID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
    // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      stats: function (emitter) {
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select count("topicID") as "topics" from "topicInvitations" where "userID" = $1;',
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



function topics(args, emitter) {
  // See if this topic subset is already cached
  var start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'topics-' + start + '-' + end,
      scope = 'private-topics-' + args.userID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve the subset and cache it
  } else {
    app.listen({
      topics: function (emitter) {
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select t.id, t."sortDate", t."replies", t."titleHtml", p."dateCreated" as "postDate", p2.id as "lastPostID", p2."dateCreated" as "lastPostDate", u."id" as "topicStarterID", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
              'from topics t ' +
              'join "topicInvitations" ti on ti."userID" = $1 ' +
              'join posts p on p."topicID" = ti."topicID" ' +
              'and p."id" = t."firstPostID" ' +
              'join users u on u.id = p."userID" ' +
              'join posts p2 on p2."topicID" = ti."topicID" ' +
              'and p2."id" = t."lastPostID" ' +
              'join users u2 on u2.id = p2."userID" ' +
              'and t.draft = false and t.private = true ' +
              'order by t."sortDate" desc ' +
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
                if ( property === 'replies' ) {
                  subset[i][property + 'Formatted'] = app.toolbox.numeral(output.topics[i][property]).format('0,0');
                } else if ( property === 'postDate' || property === 'lastPostDate' ) {
                  subset[i][property + 'Formatted'] = app.toolbox.moment.tz(output.topics[i][property], 'America/New_York').format('D-MMM-YYYY');
                } else {
                  subset[i][property] = output.topics[i][property];
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


function breadcrumbs(discussionTitle) {
  return {
    a: {
      name: 'Forum Home',
      url: app.config.comitium.basePath
    },
    b: {
      name: 'Discussion Categories',
      url: app.config.comitium.basePath + 'discussions'
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
