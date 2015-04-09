// discussion model

'use strict';

module.exports = {
  info: info,
  announcements: announcements,
  topics: topics,
  topicSubset: topicSubset,
  breadcrumbs: breadcrumbs,
  metaData: metaData
};


function info(discussion, emitter) {
  // See if this discussion info is already cached
  var cacheKey = 'models-discussion-info',
      scope = discussion,
      cached = app.retrieve({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
    // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      discussionInfo: function (emitter) {
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              eval(app.db.sql.discussionInfo),
              [ discussion ],
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
        app.cache({
          key: cacheKey,
          scope: scope,
          value: output.discussionInfo[0]
        });

        emitter.emit('ready', output.discussionInfo[0]);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}


function announcements(discussion, emitter) {
  // See if this discussion page is already cached
  var cacheKey = 'models-discussion-announcements',
      scope = discussion,
      cached = app.retrieve({ scope: scope, key: cacheKey });

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
              [ discussion ],
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
                announcements[announcement.titleHtml][property] = app.toolbox.moment(app.toolbox.helpers.isoDate(announcement[property])).format('MMMM Do YYYY');
              } else {
                announcements[announcement.titleHtml][property] = announcement[property];
              }
            }
          }
        });

        // Cache the topics object for future requests
        app.cache({
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


function topics(discussion, emitter) {
  // See if this discussion page is already cached
  var cacheKey = 'models-discussion-topics',
      scope = discussion,
      cached = app.retrieve({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      topics: function (emitter) {
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              eval(app.db.sql.topicsByDiscussion),
              [ discussion ],
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
        app.cache({
          key: cacheKey,
          scope: scope,
          value: output.topics
        });

        emitter.emit('ready', output.topics);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}


function topicSubset(discussion, start, end, emitter) {
  // See if this discussion subset is already cached
  var cacheKey = 'models-discussion-topics-subset-' + start + '-' + end,
      scope = discussion,
      cached = app.retrieve({ scope: scope, key: cacheKey });

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
              'select t.id, t."sortDate", t."replies", t."views", t."titleHtml", t."url", p."dateCreated" as "postDate", p2.id as "lastPostID", p2."dateCreated" as "lastPostDate", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
              'from topics t ' +
              'join posts p on p."topicID" = t.id ' +
              'and p."id" = t."firstPostID" ' +
              'join users u on u.id = p."userID" ' +
              'join posts p2 on p2."topicID" = t.id ' +
              'and p2."id" = t."lastPostID" ' +
              'join users u2 on u2.id = p2."userID" ' +
              'where t."discussionID" = ( select id from discussions where url = $1 ) ' +
              'and t.draft = false ' +
              'order by t."sortDate" desc ' +
              'limit $2 offset $3;',
              [ discussion, end - start, start ],
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
        app.cache({
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
