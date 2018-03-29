// announcements model

'use strict';

module.exports = {
  info: info,
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
        app.toolbox.dbPool.connect(function (err, client, done) {
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
        output.discussion[0]['topicsFormatted'] = app.toolbox.numeral(output.discussion[0].topics).format('0,0');
        
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



function topics(args, emitter) {
  // See if this discussion page is already cached
  var start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'group-' + args.groupID + '-' + start + '-' + end,
      scope = 'discussion-2',
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
              'select distinct t."id", t."titleHtml", t."url", t."sticky", t."replies", p."id" as "firstPostID", p2."id" as "lastPostID", t."titleHtml", t."url", p."created" as "postDate", p2."created" as "lastPostCreated", u."id" as "topicStarterID", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."id" as "lastPostAuthorID", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
              'from topics t ' +
              'join announcements a on t."id" = a."topicID" ' +
              'join "discussionPermissions" dp on dp."discussionID" = a."discussionID" ' +
              'join posts p on p."id" = ( select id from posts where "topicID" = t.id and draft = false order by created asc limit 1 ) ' +
              'join users u on u."id" = p."userID" ' +
              'join posts p2 on p2."id" = ( select id from posts where "topicID" = t.id and draft = false order by created desc limit 1 ) ' +
              'join users u2 on u2."id" = p2."userID" ' +
              'where dp."groupID" = $1 and dp."read" = true and t."draft" = false and t.private = false ' +
              'order by t."sticky" asc, p2.created desc ' +
              'limit $2 offset $3;',
              [ args.groupID, end - start, start ],
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



function breadcrumbs(discussionTitle) {
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



function metaData() {
  return {
    title: 'Original Trilogy - Discussion Forum: Announcements',
    description: 'Important news and updates for the Original Trilogy community.',
    keywords: 'news, announcements'
  };
}
