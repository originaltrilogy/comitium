// topic model

'use strict';

module.exports = {
  announcementView: announcementView,
  announcementReply: announcementReply,
  exists: exists,
  firstUnreadPost: firstUnreadPost,
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
  subscribers: subscribers,
  subscribersToUpdate: subscribersToUpdate,
  subscriptionNotificationSentUpdate: subscriptionNotificationSentUpdate,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  viewTimeUpdate: viewTimeUpdate,
  breadcrumbs: breadcrumbs,
  metaData: metaData
};



function announcementView(args, emitter) {
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



function announcementReply(args, emitter) {
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


function firstUnreadPost(args, emitter) {
  app.listen('waterfall', {
    viewTime: function (emitter) {
      app.models.user.topicViewTimes({
        userID: args.userID,
        topicID: args.topicID
      }, emitter);
    },
    topic: function (previous, emitter) {
      if ( previous.viewTime ) {
        info(args.topicID, emitter);
      } else {
        emitter.emit('end', false);
      }
    },
    newPosts: function (previous, emitter) {
      app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err);
        } else {
          client.query(
            'select "id" from "posts" where "topicID" = $2 and "draft" = false and "dateCreated" > ( select "time" from "topicViews" where "userID" = $1 and "topicID" = $2 ) order by "dateCreated" asc;',
            [ args.userID, args.topicID ],
            function (err, result) {
              done();
              if ( err ) {
                emitter.emit('error', err);
              } else {
                if ( result.rows.length ) {
                  emitter.emit('ready', {
                    post: result.rows[0],
                    page: Math.ceil(( previous.topic.replies + 1 - result.rows.length ) / 25)
                  });
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
      emitter.emit('ready', output.newPosts || false );
    } else {
      emitter.emit('error', output.listen);
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
        'select ti."topicID", u."id", u."username", u."url" from "topicInvitations" ti join "users" u on ti."userID" = u."id" where "topicID" = $1 order by u."username" asc;',
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
              'select t."id", t."discussionID", t."titleMarkdown", t."titleHtml", t."url", t."sortDate" as "time", t."replies", t."draft", t."private", t."lockedByID", t."lockReason", d."title" as "discussionTitle", d."url" as "discussionUrl", p."userID" as "authorID", u."username" as "author", u."url" as "authorUrl" from "topics" t left join "discussions" d on t."discussionID" = d."id" join "posts" p on p."id" = t."firstPostID" join "users" u on u."id" = p."userID" where t."id" = $1;',
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
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            scope: scope,
            key: cacheKey,
            value: output.topic[0]
          });
        }

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
              'insert into posts ( "topicID", "userID", "html", "markdown", "dateCreated", "draft", "lastModified" ) ' +
              'values ( $1, $2, $3, $4, $5, $6, $5 ) returning id;',
              [ previous.insertTopic.id, args.userID, args.html, args.markdown, args.time, args.draft ],
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
                  emitter.emit('ready');
                }
              }
            );

          },
          insertInvitation: function (previous, emitter) {
            var userMethods = {};

            if ( args.private ) {
              args.invitees.forEach( function (item, index, array) {
                // Dedupes invitees by overwriting the method if it already exists
                userMethods[item] = function (emitter) {
                  client.query(
                    'select id from users where username ilike $1;',
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
                    insert = true,
                    message;

                if ( output.listen.success ) {
                  delete output.listen;
                  for ( var property in output ) {
                    // If the author mistakenly puts themselves in the invitee field,
                    // don't insert them.
                    if ( output[property] ) {
                      if ( output[property].id !== args.userID ) {
                        userIDs.push(output[property].id);
                        insertIDs += ', ( ' + previous.insertTopic.id + ', ' + output[property].id + ' )';
                      }
                    } else {
                      insert = false;
                      message = 'One of the users you specified (' + property + ') doesn\'t exist.';
                      break;
                    }
                  }

                  // The user has only invited themselves, don't insert.
                  if ( insert && userIDs.length === 1 ) {
                    insert = false;
                    message = 'You don\'t need to invite yourself, but you do need to invite at least one other person.';
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
                      emitter.emit('end', {
                        message: message
                      });
                    });
                  }

                } else {
                  emitter.emit('error', output.listen);
                }
              });
            } else {
              emitter.emit('ready');
            }

          },
          insertAnnouncement: function (previous, emitter) {
            var insertIDs = '';

            if ( args.announcement ) {
              args.discussions.forEach( function (item, index, array) {
                insertIDs += '( ' + item + ', ' + previous.insertTopic.id + ' )';
                
                if ( index + 1 !== array.length ) {
                  insertIDs += ', ';
                }
              });

              app.listen({
                insert: function (emitter) {
                  client.query(
                    'insert into "announcements" ( "discussionID", "topicID" ) values ' + insertIDs + ';',
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
                  emitter.emit('ready');
                } else {
                  emitter.emit('error', output.listen);
                }
              });
            } else {
              emitter.emit('ready');
            }

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
              emitter.emit('ready', true);
            });

          }
        }, function (output) {

          if ( output.listen.success ) {
            if ( output.commit ) {
              if ( !args.draft ) {
                if ( args.private ) {
                  output.insertInvitation.userIDs.forEach( function (item, index, array) {
                    app.cache.clear({ scope: 'private-topics-' + item });
                  });
                } else if ( args.announcement ) {
                  app.cache.clear({ scope: 'discussion-2' });
                  args.discussions.forEach( function (item, index, array) {
                    app.cache.clear({ scope: 'announcements', key: 'discussion-' + item });
                  });
                } else {
                  app.cache.clear({ scope: 'discussion-' + args.discussionID });
                  app.cache.clear({ scope: 'discussions-categories' });
                }
              }

              emitter.emit('ready', {
                success: true,
                id: output.insertTopic.id
              });
            } else {
              emitter.emit('ready', {
                success: false,
                message: output.insertInvitation.message
              });
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
              'select p."id", p."html", p."dateCreated", p."editorID", p."lockedByID", p."lockReason", u."id" as "authorID", u."username" as "author", u."url" as "authorUrl", u."signatureHtml" as "authorSignature" ' +
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
                  subset[i][property] = app.toolbox.moment.tz(output.posts[i][property], 'America/New_York').format('MMMM Do YYYY [at] h:mm A');
                }

              }
            }
          } else {
            break;
          }
        }

        // Cache the subset for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            scope: scope,
            key: cacheKey,
            value: subset
          });
        }

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
                'update "topics" set "discussionID" = $1 where "id" = $2;',
                [ args.newDiscussionID, args.topicID ],
                function (err, result) {
                  done();
                  if ( err ) {
                    client.query('rollback', function (err) {
                      done();
                    });
                    emitter.emit('error', err);
                  } else {
                    // If it's not an announcement, skip the next method
                    emitter.emit( args.discussionID === 2 ? 'ready' : 'skip', {
                      success: true,
                      affectedRows: result.rows
                    });
                  }
                }
              );

            },
            deleteAnnouncement: function (previous, emitter) {

              client.query(
                'delete from "announcements" where "topicID" = $1;',
                [ args.topicID ],
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
            updateOldDiscussionStats: function (previous, emitter) {

              client.query(
                'update "discussions" set "topics" = ( select count("id") from "topics" where "discussionID" = $1 and "draft" = false ), "posts" = ( select count(p."id") from "posts" p join "topics" t on p."topicID" = t."id" where t."discussionID" = $1 and t."draft" = false and p."draft" = false ) where "id" = $1',
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
                'update "discussions" set "topics" = ( select count("id") from "topics" where "discussionID" = $1 and "draft" = false ), "posts" = ( select count(p."id") from "posts" p join "topics" t on p."topicID" = t."id" where t."discussionID" = $1 and t."draft" = false and p."draft" = false ) where "id" = $1',
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
              if ( args.discussionID === 2 ) {
                app.cache.clear({ scope: 'announcements' });
              }

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
              'insert into posts ( "topicID", "userID", "html", "markdown", "dateCreated", "draft", "lastModified" ) ' +
              'values ( $1, $2, $3, $4, $5, $6, $5 ) returning id;',
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

            if ( !args.draft ) {
              // Clear the cache for this topic and discussion
              app.cache.clear({ scope: 'topic-' + args.topicID });

              if ( args.private ) {
                app.listen({
                  invitees: function (emitter) {
                    invitees({
                      topicID: args.topicID
                    }, emitter);
                  }
                }, function (output) {
                  output.invitees.forEach( function (item, index, array) {
                    app.cache.clear({ scope: 'private-topics-' + item.id });
                  });
                });
              } else {
                app.cache.clear({ scope: 'discussion-' + args.discussionID });
                app.cache.clear({ scope: 'discussions-categories' });
              }
            }

            emitter.emit('ready', {
              success: true,
              id: output.insertPost.id
            });

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



function subscribers(args, emitter) {
  app.listen({
    subscribers: function (emitter) {
      app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err);
        } else {
          client.query(
            'select u.email from users u join subscriptions s on u.id = s."userID" where s."topicID" = $1;',
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
  }, function (output) {

    if ( output.listen.success ) {
      emitter.emit('ready', output.subscribers);
    } else {
      emitter.emit('error', output.listen);
    }

  });
}



function subscribersToUpdate(args, emitter) {
  var skip = args.skip ? args.skip.join(',') : 0;

  app.listen({
    subscribersToUpdate: function (emitter) {
      app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err);
        } else {
          client.query(
            'select u.email from users u join subscriptions s on u.id = s."userID" and u.id not in ( ' + skip + ' ) where s."topicID" = $1 and s."notificationSent" <= ( select tv.time from "topicViews" tv where tv."userID" = s."userID" and tv."topicID" = s."topicID" );',
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
  }, function (output) {

    if ( output.listen.success ) {
      emitter.emit('ready', output.subscribersToUpdate);
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


function breadcrumbs(topic) {
  var title, url;

  switch ( topic.discussionID ) {
    case 0:
      return {
        a: {
          name: 'Forum Home',
          url: app.config.comitium.basePath
        },
        c: {
          name: 'Private Topics',
          url: 'private-topics'
        }
      };
    case 2:
      title = 'Announcements';
      url = 'announcements';
      return {
        a: {
          name: 'Forum Home',
          url: app.config.comitium.basePath
        },
        b: {
          name: 'Discussion Categories',
          url: 'discussions'
        },
        c: {
          name: 'Announcements',
          url: 'announcements'
        }
      };
    default:
      return {
        a: {
          name: 'Forum Home',
          url: app.config.comitium.basePath
        },
        b: {
          name: 'Discussion Categories',
          url: 'discussions'
        },
        c: {
          name: topic.discussionTitle,
          url: 'discussion/' + topic.discussionUrl + '/id/' + topic.discussionID
        }
      };
  }
}


function metaData() {
  return {
    title: 'Discussion View',
    description: 'This is the discussion view template.',
    keywords: 'discussion, view'
  };
}
