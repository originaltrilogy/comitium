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
    app.toolbox.dbPool.connect(function (err, client, done) {
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
              if ( result.rows.length ) {
                result.rows[0]['topicsFormatted'] = app.toolbox.numeral(result.rows[0].topics).format('0,0');
      
                // Cache the discussion info object for future requests
                if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
                  app.cache.set({
                    key: cacheKey,
                    scope: scope,
                    value: result.rows[0]
                  });
                }

                emitter.emit('ready', result.rows[0]);
              } else {
                emitter.emit('ready', false);
              }
            }
          }
        );
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
        app.toolbox.dbPool.connect(function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select t.id, t."sticky", t."replies", t."lockedByID", p.id as "firstPostID", p2.id as "lastPostID", t."titleHtml", t."url", p."created" as "postDate", p2."created" as "lastPostCreated", u."username" as "topicStarter", u."groupID" as "topicStarterGroupID", u."url" as "topicStarterUrl", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
              'from topics t ' +
              'join announcements a on t.id = a."topicID" and a."discussionID" = $1 ' +
              'join posts p on p.id = ( select id from posts where "topicID" = t.id and draft = false order by created asc limit 1 ) ' +
              'join users u on u.id = p."userID" ' +
              'join posts p2 on p2.id = ( select id from posts where "topicID" = t.id and draft = false order by created desc limit 1 ) ' +
              'join users u2 on u2.id = p2."userID" ' +
              'where t.draft = false ' +
              'order by t."sticky" desc;',
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
        output.announcements.forEach( function (item) {
          item['repliesFormatted'] = app.toolbox.numeral(item['replies']).format('0,0');
          item['postDateFormatted'] = app.toolbox.moment.tz(item['postDate'], 'America/New_York').format('D-MMM-YYYY');
          item['lastPostCreatedFormatted'] = app.toolbox.moment.tz(item['lastPostCreated'], 'America/New_York').format('D-MMM-YYYY');
        })

        // Cache the announcements for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: output.announcements
          });
        }

        emitter.emit('ready', output.announcements);
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
        app.toolbox.dbPool.connect(function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query({
              name: 'topics_discussion',
              text: 'select t."id", t."sticky", t."replies", t."titleHtml", t."url", t."lockedByID", p."created" as "postDate", p2.id as "lastPostID", p2."created" as "lastPostCreated", u."id" as "topicStarterID", u."groupID" as "topicStarterGroupID", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."id" as "lastPostAuthorID", u2."groupID" as "lastPostAuthorGroupID", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
              'from topics t ' +
              'join posts p on p."id" = ( select id from posts where "topicID" = t.id and draft = false order by created asc limit 1 ) ' +
              'join users u on u.id = p."userID" ' +
              'join posts p2 on p2."id" = ( select id from posts where "topicID" = t.id and draft = false order by created desc limit 1 ) ' +
              'join users u2 on u2.id = p2."userID" ' +
              'where t."discussionID" = $1 ' +
              'and t.draft = false and t.private = false ' +
              'order by t."sticky" desc ' +
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
      if ( output.listen.success ) {
        output.topics.forEach( function (item) {
          item['repliesFormatted'] = app.toolbox.numeral(item['replies']).format('0,0');
          item['postDateFormatted'] = app.toolbox.moment.tz(item['postDate'], 'America/New_York').format('D-MMM-YYYY');
          item['lastPostCreatedFormatted'] = app.toolbox.moment.tz(item['lastPostCreated'], 'America/New_York').format('D-MMM-YYYY');
        })

        // Cache the topics for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: output.topics
          });
        }

        emitter.emit('ready', output.topics);
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
    },
    b: {
      name: 'Discussion Categories',
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
