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
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select c.id as "categoryID", c."title" as "categoryTitle", c."description" as "categoryDescription", d.id, d."title", d."url", d."description", d."topics", d."posts" from discussions d left join categories c on d."categoryID" = c.id where d."id" = $1;',
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
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: output.discussion[0]
        });

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
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              eval(app.db.sql.announcementsByDiscussion),
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
        // Transform the data array into an object usable by the view
        output.announcements.forEach( function (announcement, index, array) {
          announcements[announcement.titleHtml] = {};
          for ( var property in announcement ) {
            if ( announcement.hasOwnProperty(property) ) {
              if ( property === 'replies' || property === 'views' ) {
                announcements[announcement.titleHtml][property] = app.toolbox.numeral(announcement[property]).format('0,0');
              } else if ( property === 'postDate' || property === 'lastPostDate' ) {
                announcements[announcement.titleHtml][property] = app.toolbox.moment(announcement[property]).format('MMMM Do YYYY');
              } else {
                announcements[announcement.titleHtml][property] = announcement[property];
              }
            }
          }
        });

        // Cache the topics object for future requests
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: announcements
        });

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
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select t.id, t."sortDate", t."replies", t."titleHtml", t."url", p."dateCreated" as "postDate", p2.id as "lastPostID", p2."dateCreated" as "lastPostDate", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
              'from topics t ' +
              'join posts p on p."topicID" = t.id ' +
              'and p."id" = t."firstPostID" ' +
              'join users u on u.id = p."userID" ' +
              'join posts p2 on p2."topicID" = t.id ' +
              'and p2."id" = t."lastPostID" ' +
              'join users u2 on u2.id = p2."userID" ' +
              'where t."discussionID" = $1 ' +
              'and t.draft = false and t.private = false ' +
              'order by t."sortDate" desc ' +
              'limit $2 offset $3;',
              [ args.discussionID, end - start, start ],
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
                if ( property === 'replies' || property === 'views' ) {
                  subset[i][property] = app.toolbox.numeral(output.topics[i][property]).format('0,0');
                } else if ( property === 'postDate' || property === 'lastPostDate' ) {
                  subset[i][property] = app.toolbox.moment(output.topics[i][property]).format('MMMM Do YYYY');
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
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: subset
        });

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
      url: app.config.main.basePath
    },
    b: {
      name: 'Discussion Categories',
      url: app.config.main.basePath + 'discussions'
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
