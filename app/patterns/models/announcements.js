// discussion model

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



function topics(args, emitter) {
  // See if this discussion page is already cached
  var cacheKey = 'group-' + args.groupID,
      scope = 'discussion-2',
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
              'select distinct t."id", t."titleHtml", t."url", t."sortDate" from "topics" t join "announcements" a on a."topicID" = t."id" join "discussionPermissions" dp on dp."discussionID" = a."discussionID" where dp."groupID" = $1 and dp."read" = true order by t."sortDate" desc;',
              [ args.groupID ],
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
              announcements[announcement.titleHtml][property] = announcement[property];
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
