// announcement model

// Since announcements are a variation of topics, some models point to the topic model

'use strict';

var topic = require('./topic');

module.exports = {
  groupView: groupView,
  groupReply: groupReply,
  info: info,
  insert: insert,
  trash: trash,
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
                app.cache.clear({ scope: 'announcements', key: 'discussion-' + item });
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



function trash(args, emitter) {

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
            'update "topics" set "discussionID" = 1 where "id" = $1;',
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
        commit: function (previous, emitter) {

          client.query('commit', function () {
            done();
            emitter.emit('ready');
          });

        }
      }, function (output) {

        if ( output.listen.success ) {

          emitter.emit('ready', {
            success: true
          });

          app.cache.clear({ scope: 'discussion-1' });
          app.cache.clear({ scope: 'discussion-2' });
          app.cache.clear({ scope: 'announcements' });

        } else {

          emitter.emit('error', output.listen);

        }

      });
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
