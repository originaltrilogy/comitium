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
              'select t.id, t."sortDate", t."replies", p.id as "firstPostID", p2.id as "lastPostID", t."titleHtml", t."url", p."dateCreated" as "postDate", p2."dateCreated" as "lastPostDate", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
              'from topics t ' +
              'join announcements a on t.id = a."topicID" and a."discussionID" = $1 ' +
              'join posts p on p.id = t."firstPostID" ' +
              'join users u on u.id = p."userID" ' +
              'join posts p2 on p2.id = t."lastPostID" ' +
              'join users u2 on u2.id = p2."userID" ' +
              'where t.draft = false ' +
              'order by t."sortDate" desc;',
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
        output.announcements.forEach( function (announcement, index, array) {
          for ( var property in announcement ) {
            if ( announcement.hasOwnProperty(property) ) {
              if ( property === 'replies' || property === 'views' ) {
                output.announcements[index][property + 'Formatted'] = app.toolbox.numeral(announcement[property]).format('0,0');
              } else if ( property === 'postDate' || property === 'lastPostDate' ) {
                output.announcements[index][property + 'Formatted'] = app.toolbox.moment(announcement[property]).format('MMMM Do YYYY');
              }
            }
          }
        });

        // Cache the announcements for future requests
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: output.announcements
        });

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
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select t.id, t."sortDate", t."replies", t."titleHtml", t."url", p."dateCreated" as "postDate", p2.id as "lastPostID", p2."dateCreated" as "lastPostDate", u."id" as "topicStarterID", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
              'from topics t ' +
              'join posts p on p."id" = t."firstPostID" ' +
              'join users u on u.id = p."userID" ' +
              'join posts p2 on p2."id" = t."lastPostID" ' +
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

      if ( output.listen.success ) {
        output.topics.forEach( function (topic, index, array) {
          for ( var property in topic ) {
            if ( topic.hasOwnProperty(property) ) {
              if ( property === 'replies' || property === 'views' ) {
                output.topics[index][property + 'Formatted'] = app.toolbox.numeral(topic[property]).format('0,0');
              } else if ( property === 'postDate' || property === 'lastPostDate' ) {
                output.topics[index][property + 'Formatted'] = app.toolbox.moment(topic[property]).format('MMMM Do YYYY');
              }
            }
          }
        });

        // Cache the topics for future requests
        app.cache.set({
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
