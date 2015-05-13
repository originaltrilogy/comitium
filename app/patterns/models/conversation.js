// conversation model

'use strict';

module.exports = {
  hasParticipant: hasParticipant,
  info: info,
  insert: insert,
  messages: messages,
  reply: reply,
  subscribersToNotify: subscribersToNotify,
  notificationSentUpdate: notificationSentUpdate,
  viewTimeUpdate: viewTimeUpdate
};



function hasParticipant(args, emitter) {
  app.listen({
    hasParticipant: function (emitter) {
      app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err);
        } else {
          client.query(
            'select "id" from "conversationParticipants" where "conversationID" = $1 and "userID" = $2;',
            [ args.conversationID, args.userID ],
            function (err, result) {
              done();
              if ( err ) {
                emitter.emit('error', err);
              } else {
                if ( result.rows.length ) {
                  emitter.emit('ready', true);
                } else {
                  emitter.emit('ready', false);
                }
              }
            }
          );
        }
      });
    }
  }, function (output) {

    if ( output.listen.success ) {
      emitter.emit('ready', output.hasParticipant);
    } else {
      emitter.emit('error', output.listen);
    }

  });
}



function info(conversationID, emitter) {
  // See if this conversation info is already cached
  var cacheKey = 'models-conversation-info',
      scope = conversationID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
    // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      conversationInfo: function (emitter) {
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select c."id", c."subjectMarkdown", c."subjectHtml", c."url", c."sortDate", c."replies", c."views", c."draft", m."userID" as "authorID", m."dateCreated" from "conversations" c join "messages" m on c."firstMessageID" where c."id" = $1;',
              [ conversationID ],
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
        // Cache the conversation info object for future requests
        app.cache.set({
          scope: scope,
          key: cacheKey,
          value: output.conversationInfo[0]
        });

        emitter.emit('ready', output.conversationInfo[0]);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}


function insert(args, emitter) {
  var subject = args.subjectMarkdown.trim() || '',
      message = args.markdown.trim() || '';

  if ( !subject.length || !message.length ) {
    emitter.emit('ready', {
      success: false,
      reason: 'requiredFieldsEmpty',
      message: 'All fields are required.'
    });
  } else {

    app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err);
      } else {
        app.listen('waterfall', {
          begin: function (emitter) {

            client.query('begin', function (err) {
              if ( err ) {
                done();
                emitter.emit('error', err);
              } else {
                emitter.emit('ready');
              }
            });

          },
          insertConversation: function (previous, emitter) {

            client.query(
              'insert into conversations ( "firstMessageID", "lastMessageID", "subjectMarkdown", "subjectHtml", "sortDate", "replies", "draft" ) ' +
              'values ( 0, 0, $1, $2, $3, 0, $4 ) returning id;',
              [ args.subjectMarkdown, args.subjectHtml, args.time, args.draft ],
              function (err, result) {
                if ( err ) {
                  client.query('rollback', function (err) {
                    done();
                  });
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', {
                    id: result.rows[0].id
                  });
                }
              }
            );

          },
          insertMessage: function (previous, emitter) {

            client.query(
              'insert into messages ( "conversationID", "userID", "html", "markdown", "dateCreated", "draft" ) ' +
              'values ( $1, $2, $3, $4, $5, $6 ) returning id;',
              [ previous.insertConversation.id, args.userID, args.html, args.markdown, args.time, args.draft ],
              function (err, result) {
                if ( err ) {
                  client.query('rollback', function (err) {
                    done();
                  });
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', {
                    id: result.rows[0].id
                  });
                }
              }
            );

          },
          updateConversation: function (previous, emitter) {

            client.query(
              'update conversations set "firstMessageID" = $1, "lastMessageID" = $1 where id = $2;',
              [ previous.insertMessage.id, previous.insertConversation.id ],
              function (err, result) {
                if ( err ) {
                  client.query('rollback', function (err) {
                    done();
                  });
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready');
                }
              }
            );

          },
          insertParticipantAuthor: function (previous, emitter) {

            client.query(
              'insert into "conversationParticipants" ( "userID", "conversationID", "lastViewed", "notificationSent" ) values ( $1, $2, $3, $3 ) returning id;',
              [ args.userID, previous.insertConversation.id, args.time ],
              function (err, result) {
                if ( err ) {
                  client.query('rollback', function (err) {
                    done();
                  });
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready');
                }
              }
            );

          },
          insertParticipantRecipient: function (previous, emitter) {

            client.query(
              'insert into "conversationParticipants" ( "userID", "conversationID", "lastViewed", "notificationSent" ) values ( $1, $2, $3, $3 ) returning id;',
              [ args.recipientID, previous.insertConversation.id, args.time ],
              function (err, result) {
                if ( err ) {
                  client.query('rollback', function (err) {
                    done();
                  });
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready');
                }
              }
            );

          },
          updateAuthorStats: function (previous, emitter) {

            client.query(
              'update "users" set "lastActivity" = $1 where "id" = $2;',
              [ args.time, args.userID ],
              function (err, result) {
                if ( err ) {
                  client.query('rollback', function (err) {
                    done();
                  });
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', {
                    affectedRows: result.rowCount
                  });
                }
              }
            );

          },
          commit: function (previous, emitter) {

            client.query('commit', function () {
              done();
              emitter.emit('ready');
            });

          }
        }, function (output) {

          if ( output.listen.success ) {

            emitter.emit('ready', {
              success: true,
              id: output.insertConversation.id
            });

          } else {

            emitter.emit('error', output.listen);

          }

        });
      }
    });

  }
}



function messages(args, emitter) {
  // See if this topic subset is already cached
  var topic = args.topic,
      start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'models-topic-posts-subset-' + start + '-' + end,
      scope = topic,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve the subset and cache it
  } else {
    app.listen({
      posts: function (emitter) {
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select p."id", p."html", p."dateCreated", p."lockedByID", p."lockReason", u."username" as "author", u."url" as "authorUrl" ' +
              'from posts p ' +
              'inner join users u on p."userID" = u.id ' +
              'where p."topicID" = ( select id from topics where url = $1 ) and p.draft = false ' +
              'order by p."dateCreated" asc ' +
              'limit $2 offset $3;',
              [ topic, end - start, start ],
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
          if ( output.posts[i] ) {
            subset[i] = {};
            for ( var property in output.posts[i] ) {
              if ( output.posts[i].hasOwnProperty(property) ) {
                subset[i][property] = output.posts[i][property];
              }
            }
          } else {
            break;
          }
        }

        // Cache the subset for future requests
        app.cache.set({
          scope: scope,
          key: cacheKey,
          value: subset
        });

        emitter.emit('ready', subset);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}



function reply(args, emitter) {
  var message = args.markdown.trim() || '';

  if ( !message.length ) {
    emitter.emit('ready', {
      success: false,
      reason: 'requiredFieldsEmpty',
      message: 'All fields are required.'
    });
  } else {

    app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err);
      } else {
        app.listen('waterfall', {
          begin: function (emitter) {

            client.query('begin', function (err) {
              if ( err ) {
                done();
                emitter.emit('error', err);
              } else {
                emitter.emit('ready');
              }
            });

          },
          insertPost: function (previous, emitter) {

            client.query(
              'insert into posts ( "topicID", "userID", "html", "markdown", "dateCreated", "draft", "editorID", "lastModified" ) ' +
              'values ( $1, $2, $3, $4, $5, $6, $2, $5 ) returning id;',
              [ args.topicID, args.userID, args.html, args.markdown, args.time, args.draft ],
              function (err, result) {
                if ( err ) {
                  client.query('rollback', function (err) {
                    done();
                  });
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', {
                    id: result.rows[0].id
                  });
                }
              }
            );

          },
          updateTopicStats: function (previous, emitter) {

            client.query(
              'update topics set "sortDate" = $3, replies = ( select count(id) from posts where "topicID" = $1 and draft = false ) - 1, "lastPostID" = $2 where "id" = $1;',
              [ args.topicID, previous.insertPost.id, args.time ],
              function (err, result) {
                if ( err ) {
                  client.query('rollback', function (err) {
                    done();
                  });
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', {
                    affectedRows: result.rowCount
                  });
                }
              }
            );

          },
          updateDiscussionStats: function (previous, emitter) {

            client.query(
              'update "discussions" set "topics" = ( select count("id") from "topics" where "discussionID" = $1 and "draft" = false ), "posts" = ( select count(p."id") from "posts" p join "topics" t on p."topicID" = t."id" where t."discussionID" = $1 and p."draft" = false ) where "id" = $1',
              [ args.discussionID ],
              function (err, result) {
                if ( err ) {
                  client.query('rollback', function (err) {
                    done();
                  });
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', {
                    affectedRows: result.rowCount
                  });
                }
              }
            );

          },
          updateAuthorStats: function (previous, emitter) {

            client.query(
              'update "users" set "lastActivity" = $1 where "id" = $2;',
              [ args.time, args.userID ],
              function (err, result) {
                if ( err ) {
                  client.query('rollback', function (err) {
                    done();
                  });
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', {
                    affectedRows: result.rowCount
                  });
                }
              }
            );

          },
          commit: function (previous, emitter) {
            client.query('commit', function () {
              done();
              emitter.emit('ready');
            });
          }
        }, function (output) {

          if ( output.listen.success ) {

            emitter.emit('ready', {
              success: true,
              id: output.insertPost.id
            });

            if ( !args.draft ) {
              // Clear the cache for this topic and discussion
              app.cache.clear({ scope: args.topicUrl });
              app.cache.clear({ scope: args.discussionUrl });
              app.cache.clear({ scope: 'models-discussions-categories' });
            }

          } else {
            emitter.emit('error', output.listen);
          }

        });
      }
    });

  }
}



function subscribersToNotify(args, emitter) {
  app.listen({
    subscribersToNotify: function (emitter) {
      app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err);
        } else {
          client.query(
            'select u.email from users u join subscriptions s on u.id = s."userID" and u.id <> $1 where s."topicID" = $2 and s."notificationSent" <= ( select tv.time from "topicViews" tv where tv."userID" = s."userID" and tv."topicID" = s."topicID" );',
            [ args.replyAuthorID, args.topicID ],
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
      emitter.emit('ready', output.subscribersToNotify);
    } else {
      emitter.emit('error', output.listen);
    }

  });
}



function notificationSentUpdate(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'update "conversationParticipants" set "notificationSent" = $1 where "userID" = $2 and "conversationID" = $3;',
        [ args.time, args.userID, args.conversationID ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            emitter.emit('ready', result.affectedRows);
          }
        }
      );
    }
  });
}



function viewTimeUpdate(args, emitter) {
  app.listen({
    viewTimeUpdate: function (emitter) {
      app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err);
        } else {
          client.query(
            'update "conversationParticipants" set lastViewed = $3 where "userID" = $1 and "conversationID" = $2;',
            [ args.userID, args.conversationID, args.time ],
            function (err, result) {
              if ( err ) {
                done();
                emitter.emit('error', err);
              } else {
                if ( result.rowCount ) {
                  done();
                  emitter.emit('ready', result.rowCount);
                } else {
                  client.query(
                    'insert into "topicViews" ( "userID", "topicID", "time" ) values ( $1, $2, $3 ) returning id;',
                    [ args.userID, args.topicID, args.time ],
                    function (err, result) {
                      done();
                      if ( err ) {
                        emitter.emit('error', err);
                      } else {
                        emitter.emit('ready', result.rows[0].id);
                      }
                    }
                  );
                }
              }
            }
          );
        }
      });
    }
  }, function (output) {

    if ( output.listen.success && emitter ) {
      emitter.emit('ready', {
        success: true
      });
    } else if ( emitter ) {
      emitter.emit('error', output.listen);
    }

  });
}
