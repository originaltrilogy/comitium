// announcement model

// Since announcements are a variation of topics, the models point to the topic model

'use strict';

module.exports = {
  exists: exists,
  groupView: groupView,
  groupReply: groupReply,
  hasInvitee: hasInvitee,
  invitees: invitees,
  info: info,
  insert: insert,
  posts: posts,
  lock: lock,
  unlock: unlock,
  move: move,
  reply: reply,
  subscriptionExists: subscriptionExists,
  subscribersToNotify: subscribersToNotify,
  subscriptionNotificationSentUpdate: subscriptionNotificationSentUpdate,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  viewTimeUpdate: viewTimeUpdate,
  breadcrumbs: breadcrumbs,
  metaData: metaData
};


function exists(topicID, emitter) {
  app.listen({
    exists: function (emitter) {
      app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err);
        } else {
          client.query(
            'select id from topics where id = $1;',
            [ topicID ],
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
      emitter.emit('ready', output.exists);
    } else {
      emitter.emit('error', output.listen);
    }

  });
}



function groupView(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'select dp."discussionID" from "discussionPermissions" dp join "announcements" a on dp."discussionID" = a."discussionID" where dp."groupID" = $1 and a."topicID" = $2 and dp."read" = true;',
        [ args.groupID, args.topicID ],
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



function groupReply(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'select dp."discussionID" from "discussionPermissions" dp join "announcements" a on dp."discussionID" = a."discussionID" where dp."groupID" = $1 and a."topicID" = $2 and dp."reply" = true;',
        [ args.groupID, args.topicID ],
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



function hasInvitee(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'select "topicID" from "topicInvitations" where "topicID" = $1 and "userID" = $2;',
        [ args.topicID, args.userID ],
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


function invitees(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'select "userID" from "topicInvitations" where "topicID" = $1;',
        [ args.topicID ],
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


function info(topicID, emitter) {
  // See if this topic info is already cached
  var cacheKey = 'info',
      scope = 'topic-' + topicID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
    // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      topic: function (emitter) {
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select d."id" as "discussionID", d."title" as "discussionTitle", d."url" as "discussionUrl", t."sortDate" as "time", t."id", t."url", t."replies", t."titleHtml", t."titleMarkdown", t."draft", t."private", t."lockedByID", t."lockReason", p."userID" as "authorID", u."username" as "author", u."url" as "authorUrl" from "topics" t left join "discussions" d on t."discussionID" = d."id" join "posts" p on p."id" = t."firstPostID" join "users" u on u."id" = p."userID" where t."id" = $1;',
              [ topicID ],
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
        // Cache the topic info object for future requests
        app.cache.set({
          scope: scope,
          key: cacheKey,
          value: output.topic[0]
        });

        emitter.emit('ready', output.topic[0]);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}



function insert(args, emitter) {
  var title = args.titleMarkdown.trim() || '',
      content = args.markdown.trim() || '';

  if ( !title.length || !content.length || ( args.private && !args.invitees.length ) ) {
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
          insertTopic: function (previous, emitter) {

            client.query(
              'insert into topics ( "discussionID", "firstPostID", "lastPostID", "titleMarkdown", "titleHtml", "url", "sortDate", "replies", "draft", "private", "lockedByID" ) ' +
              'values ( $1, 0, 0, $2, $3, $4, $5, 0, $6, $7, 0 ) returning id;',
              [ args.discussionID, args.titleMarkdown, args.titleHtml, args.url, args.time, args.draft, args.private ],
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
          insertPost: function (previous, emitter) {

            client.query(
              'insert into posts ( "topicID", "userID", "html", "markdown", "dateCreated", "draft", "editorID", "lastModified" ) ' +
              'values ( $1, $2, $3, $4, $5, $6, $7, $8 ) returning id;',
              [ previous.insertTopic.id, args.userID, args.html, args.markdown, args.time, args.draft, args.userID, args.time ],
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
          updateTopic: function (previous, emitter) {

            client.query(
              'update topics set "firstPostID" = $1, "lastPostID" = $1 where id = $2;',
              [ previous.insertPost.id, previous.insertTopic.id ],
              function (err, result) {
                if ( err ) {
                  client.query('rollback', function (err) {
                    done();
                  });
                  emitter.emit('error', err);
                } else {
                  if ( args.private ) {
                    emitter.emit('ready');
                  } else {
                    emitter.emit('skip');
                  }
                }
              }
            );

          },
          insertInvitation: function (previous, emitter) {
            var userMethods = {};

            args.invitees.forEach( function (item, indext, array) {
              userMethods[item] = function (emitter) {
                client.query(
                  'select id from users where username = $1;',
                  [ item ],
                  function (err, result) {
                    if ( err ) {
                      client.query('rollback', function (err) {
                        done();
                      });
                      emitter.emit('error', err);
                    } else {
                      emitter.emit('ready', result.rows[0]);
                    }
                  }
                );
              };
            });

            app.listen(userMethods, function (output) {
              var userIDs = [ args.userID ],
                  insertIDs = '( ' + previous.insertTopic.id + ', ' + args.userID + ' )',
                  insert = true;

              if ( output.listen.success ) {
                delete output.listen;
                for ( var property in output ) {
                  if ( output[property] ) {
                    userIDs.push(output[property].id);
                    insertIDs += ', ( ' + previous.insertTopic.id + ', ' + output[property].id + ' )';
                  } else {
                    insert = false;
                    break;
                  }
                }

                if ( insert ) {
                  app.listen({
                    insert: function (emitter) {
                      client.query(
                        'insert into "topicInvitations" ( "topicID", "userID" ) values ' + insertIDs + ';',
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
                    }
                  }, function (output) {
                    if ( output.listen.success ) {
                      emitter.emit('skip', {
                        userIDs: userIDs
                      });
                    } else {
                      emitter.emit('error', output.listen);
                    }
                  });
                } else {
                  client.query('rollback', function (err) {
                    done();
                    emitter.emit('error', {
                      message: 'The user you specified (' + property + ') doesn\'t exist.'
                    });
                  });
                }

              } else {
                emitter.emit('error', output.listen);
              }
            });

          },
          updateDiscussionStats: function (previous, emitter) {

            client.query(
              'update discussions set posts = ( select count(p.id) from posts p join topics t on p."topicID" = t.id where t."discussionID" = $1 and p.draft = false ), topics = ( select count(t.id) from topics t where t."discussionID" = $1 and t.draft = false ) where "id" = $1;',
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
console.log(output);
            emitter.emit('ready', {
              success: true,
              id: output.insertTopic.id
            });

            if ( !args.draft ) {
              if ( args.private ) {
                output.insertInvitation.userIDs.forEach( function (item, index, array) {
                  app.cache.clear({ scope: 'private-topics-' + item });
                });
              } else {
                app.cache.clear({ scope: 'discussion-' + args.discussionID });
                app.cache.clear({ scope: 'discussions-categories' });
              }
            }

          } else {

            emitter.emit('error', output.listen);

          }

        });
      }
    });

  }
}



function posts(args, emitter) {
  // See if this topic subset is already cached
  var start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'posts-' + start + '-' + end,
      scope = 'topic-' + args.topicID,
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
              'where p."topicID" = $1 and p.draft = false ' +
              'order by p."dateCreated" asc ' +
              'limit $2 offset $3;',
              [ args.topicID, end - start, start ],
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
                if ( property !== 'dateCreated' ) {
                  subset[i][property] = output.posts[i][property];
                } else {
                  subset[i][property] = app.toolbox.moment(output.posts[i][property]).format('MMMM Do YYYY [at] h:mm [GMT]');
                }

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



function lock(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'update "topics" set "lockedByID" = $1, "lockReason" = $2 where "id" = $3',
        [ args.lockedByID, args.lockReason, args.topicID ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            // Clear the cache for this topic
            app.cache.clear({ scope: 'topic-' + args.topicID });

            emitter.emit('ready', {
              success: true,
              affectedRows: result.rows
            });
          }
        }
      );
    }
  });
}



function unlock(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'update "topics" set "lockedByID" = 0, "lockReason" = null where "id" = $1',
        [ args.topicID ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            // Clear the cache for this topic
            app.cache.clear({ scope: 'topic-' + args.topicID });

            emitter.emit('ready', {
              success: true,
              affectedRows: result.rows
            });
          }
        }
      );
    }
  });
}



function move(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
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
            moveTopic: function (previous, emitter) {

              client.query(
                'update "topics" set "discussionID" = ( select "id" from "discussions" where "url" = $1 ) where "id" = $2;',
                [ args.newDiscussionUrl, args.topicID ],
                function (err, result) {
                  done();
                  if ( err ) {
                    client.query('rollback', function (err) {
                      done();
                    });
                    emitter.emit('error', err);
                  } else {
                    emitter.emit('ready', {
                      success: true,
                      affectedRows: result.rows
                    });
                  }
                }
              );

            },
            updateOldDiscussionStats: function (previous, emitter) {

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
            updateNewDiscussionStats: function (previous, emitter) {

              client.query(
                'update "discussions" set "topics" = ( select count("id") from "topics" where "discussionID" = $1 and "draft" = false ), "posts" = ( select count(p."id") from "posts" p join "topics" t on p."topicID" = t."id" where t."discussionID" = $1 and p."draft" = false ) where "id" = $1',
                [ args.newDiscussionID ],
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

              // Clear the cache for this topic
              app.cache.clear({ scope: 'topic-' + args.topicID });
              app.cache.clear({ scope: 'discussion-' + args.discussionID });
              app.cache.clear({ scope: 'discussion-' + args.newDiscussionID });
              app.cache.clear({ scope: 'discussions-categories' });

              emitter.emit('ready', {
                success: true
              });

            } else {

              emitter.emit('error', output.listen);

            }

          });
        }
      });
    }
  });
}



function reply(args, emitter) {
  var content = args.markdown.trim() || '';

  if ( !content.length ) {
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
                  if ( !args.private ) {
                    emitter.emit('ready', {
                      affectedRows: result.rowCount
                    });
                  } else {
                    emitter.emit('skip', {
                      affectedRows: result.rowCount
                    });
                  }
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
              app.cache.clear({ scope: 'topic-' + args.topicID });

              if ( args.private ) {
                app.listen({
                  invitees: function (emitter) {
                    invitees(args.topicID, emitter);
                  }
                }, function (output) {
                  output.invitees.forEach( function (item, index, array) {
                    app.cache.clear({ scope: 'private-topics-' + item });
                  });
                });
              } else {
                app.cache.clear({ scope: 'discussion-' + args.discussionID });
                app.cache.clear({ scope: 'discussions-categories' });
              }
            }

          } else {
            emitter.emit('error', output.listen);
          }

        });
      }
    });

  }
}



function subscriptionExists(args, emitter) {
  app.listen({
    subscriptionExists: function (emitter) {
      app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err);
        } else {
          client.query(
            'select "id" from subscriptions where "userID" = $1 and "topicID" = $2;',
            [ args.userID, args.topicID ],
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
      emitter.emit('ready', output.subscriptionExists);
    } else {
      emitter.emit('error', output.listen);
    }

  });
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



function subscriptionNotificationSentUpdate(args, emitter) {
  app.listen({
    subscriptionNotificationSentUpdate: function (emitter) {
      app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err);
        } else {
          client.query(
            'update "subscriptions" set "notificationSent" = $1 where "topicID" = $2;',
            [ args.time, args.topicID ],
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



function subscribe(args, emitter) {
  app.listen({
    subscriptionExists: function (emitter) {
      app.models.topic.subscriptionExists(args, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {
      if ( !output.subscriptionExists ) {
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'insert into subscriptions ( "userID", "topicID", "notificationSent" ) values ( $1, $2, $3 ) returning id;',
              [ args.userID, args.topicID, args.time ],
              function (err, result) {
                done();
                if ( err ) {
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', {
                    success: true,
                    id: result.rows[0].id
                  });
                }
              }
            );
          }
        });
      } else {
        emitter.emit('ready', {
          success: true
        });
      }
    } else {
      emitter.emit('error', output.listen);
    }

  });
}


function unsubscribe(args, emitter) {
  app.listen({
    subscriptionDelete: function (emitter) {
      app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err);
        } else {
          client.query(
            'delete from subscriptions where "userID" = $1 and "topicID" = $2;',
            [ args.userID, args.topicID ],
            function (err, result) {
              done();
              if ( err ) {
                emitter.emit('error', err);
              } else {
                emitter.emit('ready');
              }
            }
          );
        }
      });
    }
  }, function (output) {

    if ( output.listen.success ) {
      emitter.emit('ready', {
        success: true
      });
    } else {
      emitter.emit('error', output.listen);
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
            'update "topicViews" set time = $3 where "userID" = $1 and "topicID" = $2;',
            [ args.userID, args.topicID, args.time ],
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


function breadcrumbs(discussionTitle, discussionUrl, discussionID) {
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
      name: discussionTitle,
      url: discussionID ? 'discussion/' + discussionUrl + '/id/' + discussionID : discussionUrl
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