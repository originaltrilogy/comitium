// conversations model

'use strict';

module.exports = {
  info: info,
  conversations: conversations,
  breadcrumbs: breadcrumbs,
  metaData: metaData
};


function info(userID, emitter) {
  // See if this user's conversations info is already cached
  var cacheKey = 'models-conversations-info',
      scope = 'user-' + userID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
    // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      conversationsInfo: function (emitter) {
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select count("conversationID") as "conversations" from "conversationParticipants" where "userID" = $1;',
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
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: output.conversationsInfo[0]
        });

        emitter.emit('ready', output.conversationsInfo[0]);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}



function conversations(args, emitter) {
  // See if this discussion subset is already cached
  var start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'models-conversations-subset-' + start + '-' + end,
      scope = 'user-' + args.userID,
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
              'select distinct c."id", c."sortDate", c."replies", c."subjectHtml", m."dateCreated" as "messageDate", m2."id" as "lastMessageID", m2."dateCreated" as "lastMessageDate", u."username" as "conversationStarter", u."url" as "conversationStarterUrl", u2."username" as "lastMessageAuthor", u2."url" as "lastMessageAuthorUrl" ' +
              'from "conversations" c ' +
              'join "conversationParticipants" cp on cp."userID" = $1 ' +
              'join "messages" m on m."conversationID" = c."id" ' +
              'and m."id" = c."firstMessageID" ' +
              'join "users" u on u."id" = m."userID" ' +
              'join "messages" m2 on m2."conversationID" = c."id" ' +
              'and m2."id" = c."lastMessageID" ' +
              'join "users" u2 on u2.id = m2."userID" ' +
              'and c."draft" = false ' +
              'order by c."sortDate" desc ' +
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
                  subset[i][property] = app.toolbox.numeral(output.topics[i][property]).format('0,0');
                } else if ( property === 'messageDate' || property === 'lastMessageDate' ) {
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
      url: 'discussions'
    },
    c: {
      name: 'Private Conversations',
      url: 'conversations'
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
