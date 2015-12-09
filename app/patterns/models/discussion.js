// discussion model

'use strict';

module.exports = {
  info: info,
  announcements: announcements,
  topics: topics,
  breadcrumbs: breadcrumbs,
  metaData: metaData
};


function info(discussionID, emitter) {
  // See if this discussion info is already cached
  var cacheKey = 'info',
      scope = 'discussion-' + discussionID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
    // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      discussion: function (emitter) {
        app.toolbox.pg.connect(app.config.comitium.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select c.id as "categoryID", c."title" as "categoryTitle", c."description" as "categoryDescription", d.id, d."title", d."url", d."description", d."metaDescription", d."keywords", d."topics", d."posts" from discussions d left join categories c on d."categoryID" = c.id where d."id" = $1;',
              [ discussionID ],
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
            value: output.discussion[0]
          });
        }

        emitter.emit('ready', output.discussion[0]);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}


function announcements(discussionID, emitter) {
  // See if this discussion page is already cached
  var cacheKey = 'discussion-' + discussionID,
      scope = 'announcements',
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      announcements: function (emitter) {
        app.toolbox.pg.connect(app.config.comitium.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select t.id, t."sticky", t."replies", t."lockedByID", p.id as "firstPostID", p2.id as "lastPostID", t."titleHtml", t."url", p."created" as "postDate", p2."created" as "lastPostCreated", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
              'from topics t ' +
              'join announcements a on t.id = a."topicID" and a."discussionID" = $1 ' +
              'join posts p on p.id = ( select id from posts where "topicID" = t.id and draft = false order by created asc limit 1 ) ' +
              'join users u on u.id = p."userID" ' +
              'join posts p2 on p2.id = ( select id from posts where "topicID" = t.id and draft = false order by created desc limit 1 ) ' +
              'join users u2 on u2.id = p2."userID" ' +
              'where t.draft = false ' +
              'order by t."sticky" asc, p2.created desc;',
              [ discussionID ],
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
      var announcements = {};

      if ( output.listen.success ) {

        for ( var i = 0; i < output.announcements.length; i += 1 ) {
          if ( output.announcements[i] ) {
            announcements[i] = {};
            for ( var property in output.announcements[i] ) {
              if ( output.announcements[i].hasOwnProperty(property) ) {
                announcements[i][property] = output.announcements[i][property];
                if ( property === 'replies' ) {
                  announcements[i][property + 'Formatted'] = app.toolbox.numeral(output.announcements[i][property]).format('0,0');
                } else if ( property === 'postDate' || property === 'lastPostCreated' ) {
                  announcements[i][property + 'Formatted'] = app.toolbox.moment.tz(output.announcements[i][property], 'America/New_York').format('D-MMM-YYYY');
                }
              }
            }
          } else {
            break;
          }
        }

        // Cache the announcements for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: announcements
          });
        }

        emitter.emit('ready', announcements);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}



function topics(args, emitter) {
  // See if this discussion subset is already cached
  var start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'topics-' + start + '-' + end,
      scope = 'discussion-' + args.discussionID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve the subset and cache it
  } else {
    app.listen({
      topics: function (emitter) {
        app.toolbox.pg.connect(app.config.comitium.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query({
              name: 'topics_discussion',
              text: 'select t."id", t."sticky", t."replies", t."titleHtml", t."url", t."lockedByID", p."created" as "postDate", p2.id as "lastPostID", p2."created" as "lastPostCreated", u."id" as "topicStarterID", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."id" as "lastPostAuthorID", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
              'from topics t ' +
              'join posts p on p."id" = ( select id from posts where "topicID" = t.id and draft = false order by created asc limit 1 ) ' +
              'join users u on u.id = p."userID" ' +
              'join posts p2 on p2."id" = ( select id from posts where "topicID" = t.id and draft = false order by created desc limit 1 ) ' +
              'join users u2 on u2.id = p2."userID" ' +
              'where t."discussionID" = $1 ' +
              'and t.draft = false and t.private = false ' +
              'order by t."sticky" asc, p2.created desc ' +
              'limit $2 offset $3;',
              values: [ args.discussionID, end - start, start ]
            },
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
      var topics = {};

      if ( output.listen.success ) {

        for ( var i = 0; i < end - start; i += 1 ) {
          if ( output.topics[i] ) {
            topics[i] = {};
            for ( var property in output.topics[i] ) {
              if ( output.topics[i].hasOwnProperty(property) ) {
                topics[i][property] = output.topics[i][property];
                if ( property === 'replies' ) {
                  topics[i][property + 'Formatted'] = app.toolbox.numeral(output.topics[i][property]).format('0,0');
                } else if ( property === 'postDate' || property === 'lastPostCreated' ) {
                  topics[i][property + 'Formatted'] = app.toolbox.moment.tz(output.topics[i][property], 'America/New_York').format('D-MMM-YYYY');
                }
              }
            }
          } else {
            break;
          }
        }

        // Cache the topics for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: topics
          });
        }

        emitter.emit('ready', topics);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}


function breadcrumbs(discussionTitle) {
  return {
    a: {
      name: 'Home',
      url: app.config.comitium.basePath
    },
    b: {
      name: 'Discussions',
      url: app.config.comitium.basePath + 'discussions'
    }
  };
}



function metaData(args, emitter) {
  app.listen({
    info: function (emitter) {
      info(args.discussionID, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      emitter.emit('ready', {
        title: output.info.title + ' - ' + output.info.categoryTitle + ' - Original Trilogy',
        description: output.info.metaDescription,
        keywords: output.info.keywords
      });
    } else {
      emitter.emit('error', output.listen);
    }
  });
}
