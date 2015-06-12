// announcement model

// Since announcements are a variation of topics, some models point to the topic model

'use strict';

var topic = require('./topic');

module.exports = {
  exists: topic.exists,
  groupView: groupView,
  groupReply: groupReply,
  info: info,
  insert: insert,
  // posts: topic.posts,
  // lock: topic.lock,
  // unlock: topic.unlock,
  // reply: topic.reply,
  // subscriptionExists: topic.subscriptionExists,
  subscribersToNotify: topic.subscribersToNotify,
  subscriptionNotificationSentUpdate: topic.subscriptionNotificationSentUpdate,
  // subscribe: topic.subscribe,
  // unsubscribe: topic.unsubscribe,
  // viewTimeUpdate: topic.viewTimeUpdate,
  breadcrumbs: breadcrumbs,
  metaData: metaData
};



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



function info(topicID, emitter) {
  // See if this announcement info is already cached
  var cacheKey = 'info',
      scope = 'announcement-' + topicID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
    // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      announcement: function (emitter) {
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
        // Cache the announcement info object for future requests
        app.cache.set({
          scope: scope,
          key: cacheKey,
          value: output.announcement[0]
        });

        emitter.emit('ready', output.announcement[0]);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}



function insert(args, emitter) {
  var title = args.titleMarkdown.trim() || '',
      content = args.markdown.trim() || '';

  if ( !title.length || !content.length ) {
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
              'values ( 2, 0, 0, $1, $2, $3, $4, 0, $5, false, 0 ) returning id;',
              [ args.titleMarkdown, args.titleHtml, args.url, args.time, args.draft ],
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
              'update "topics" set "firstPostID" = $1, "lastPostID" = $1 where id = $2;',
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
          insertAnnouncement: function (previous, emitter) {
            var insertIDs = '( 2, ' + previous.insertTopic.id + ' )';
            
            if ( args.discussions.length ) {
              args.discussions.forEach( function (item, index, array) {
                insertIDs += ', ( ' + item + ', ' + previous.insertTopic.id + ' )';
              });
            }

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

          },
          updateDiscussionStats: function (previous, emitter) {

            client.query(
              'update discussions set posts = ( select count(p.id) from posts p join topics t on p."topicID" = t.id where t."discussionID" = 2 and p.draft = false ), topics = ( select count(t.id) from topics t where t."discussionID" = 2 and t.draft = false ) where "id" = 2;',
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
              id: output.insertTopic.id
            });

            if ( !args.draft ) {
              app.cache.clear({ scope: 'discussion-2' });
              args.discussions.forEach( function (item, index, array) {
                app.cache.clear({ scope: 'discussion-' + item, key: 'announcements' });
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
  // See if this announcement subset is already cached
  var start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'posts-' + start + '-' + end,
      scope = 'announcement-' + args.announcementID,
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
              [ args.announcementID, end - start, start ],
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
        'update "announcements" set "lockedByID" = $1, "lockReason" = $2 where "id" = $3',
        [ args.lockedByID, args.lockReason, args.announcementID ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            // Clear the cache for this announcement
            app.cache.clear({ scope: 'announcement-' + args.announcementID });

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
        'update "announcements" set "lockedByID" = 0, "lockReason" = null where "id" = $1',
        [ args.announcementID ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            // Clear the cache for this announcement
            app.cache.clear({ scope: 'announcement-' + args.announcementID });

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
            moveannouncement: function (previous, emitter) {

              client.query(
                'update "announcements" set "discussionID" = ( select "id" from "discussions" where "url" = $1 ) where "id" = $2;',
                [ args.newDiscussionUrl, args.announcementID ],
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
                'update "discussions" set "announcements" = ( select count("id") from "announcements" where "discussionID" = $1 and "draft" = false ), "posts" = ( select count(p."id") from "posts" p join "announcements" t on p."topicID" = t."id" where t."discussionID" = $1 and p."draft" = false ) where "id" = $1',
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
                'update "discussions" set "announcements" = ( select count("id") from "announcements" where "discussionID" = $1 and "draft" = false ), "posts" = ( select count(p."id") from "posts" p join "announcements" t on p."topicID" = t."id" where t."discussionID" = $1 and p."draft" = false ) where "id" = $1',
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

              // Clear the cache for this announcement
              app.cache.clear({ scope: 'announcement-' + args.announcementID });
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
              [ args.announcementID, args.userID, args.html, args.markdown, args.time, args.draft ],
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
          updateannouncementStats: function (previous, emitter) {

            client.query(
              'update announcements set "sortDate" = $3, replies = ( select count(id) from posts where "topicID" = $1 and draft = false ) - 1, "lastPostID" = $2 where "id" = $1;',
              [ args.announcementID, previous.insertPost.id, args.time ],
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
              'update "discussions" set "announcements" = ( select count("id") from "announcements" where "discussionID" = $1 and "draft" = false ), "posts" = ( select count(p."id") from "posts" p join "announcements" t on p."topicID" = t."id" where t."discussionID" = $1 and p."draft" = false ) where "id" = $1',
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
              // Clear the cache for this announcement and discussion
              app.cache.clear({ scope: 'announcement-' + args.announcementID });

              if ( args.private ) {
                app.listen({
                  invitees: function (emitter) {
                    invitees(args.announcementID, emitter);
                  }
                }, function (output) {
                  output.invitees.forEach( function (item, index, array) {
                    app.cache.clear({ scope: 'private-announcements-' + item });
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
            [ args.userID, args.announcementID ],
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
            [ args.replyAuthorID, args.announcementID ],
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
            [ args.time, args.announcementID ],
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
      app.models.announcement.subscriptionExists(args, emitter);
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
              [ args.userID, args.announcementID, args.time ],
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
            [ args.userID, args.announcementID ],
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
            [ args.userID, args.announcementID, args.time ],
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
                    [ args.userID, args.announcementID, args.time ],
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


function breadcrumbs() {
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
      name: 'Announcements',
      url: 'announcements'
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
