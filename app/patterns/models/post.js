// post model

'use strict';

module.exports = {
  edit: edit,
  info: info,
  lock: lock,
  unlock: unlock,
  saveBookmark: saveBookmark,
  saveReport: saveReport,
  trash: trash
};


function edit(args, emitter) {
  if ( !args.markdown.length ) {
    emitter.emit('ready', {
      success: false,
      reason: 'requiredFieldsEmpty',
      message: 'Posts can\'t be empty.'
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
          updatePost: function (previous, emitter) {

            client.query(
              'update "posts" set "markdown" = $1, "html" = $2, "editorID" = $3, "editReason" = $4, "lastModified" = $5 where "id" = $6',
              [ args.markdown, args.html, args.editorID, args.reason, args.time, args.id ],
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
          insertPostHistory: function (previous, emitter) {

            client.query(
              'insert into "postHistory" ( "postID", "editorID", "editReason", "markdown", "html", "time" ) values ( $1, $2, $3, $4, $5, $6 ) returning id',
              [ args.id, args.currentPost.editorID, args.currentPost.editReason, args.currentPost.markdown, args.currentPost.html, args.currentPost.lastModified ],
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
          commit: function (previous, emitter) {
            client.query('commit', function () {
              done();
              emitter.emit('ready');
            });
          }
        }, function (output) {

          if ( output.listen.success ) {

            // Clear the topic cache
            app.cache.clear({ scope: 'topic-' + args.currentPost.topicID });

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
}


function info(postID, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'select p.id, p."topicID", p.html, p.markdown, p."dateCreated", p.draft, p."editReason", p."editorID", p."lastModified", p."lockedByID", p."lockReason", t."discussionID", t."titleHtml" as "topicTitle", t.url as "topicUrl", d."url" as "discussionUrl", u.id as "authorID", u.username as author, u.url as "authorUrl" from posts p join users u on p."userID" = u.id join topics t on p."topicID" = t.id left join discussions d on t."discussionID" = d."id" where p.id = $1;',
        [ postID ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            if ( result.rows.length ) {
              emitter.emit('ready', result.rows[0]);
            } else {
              emitter.emit('ready', false);
            }
          }
        }
      );
    }
  });
}


function lock(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'update "posts" set "lockedByID" = $1, "lockReason" = $2 where "id" = $3',
        [ args.lockedByID, args.lockReason, args.postID ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            // Clear the cache for this topic
            app.cache.clear({ scope: args.topicUrl });

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
        'update "posts" set "lockedByID" = 0, "lockReason" = null where "id" = $1',
        [ args.postID ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            // Clear the cache for this topic
            app.cache.clear({ scope: args.topicUrl });

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



function saveBookmark(args, emitter) {
  app.listen({
    bookmarkExists: function (emitter) {
      app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err);
        } else {
          client.query(
            'select "id" from "bookmarks" where "userID" = $1 and "postID" = $2;',
            [ args.userID, args.postID ],
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
    if ( output.bookmarkExists ) {
      emitter.emit('ready', {
        success: true
      });
    } else {
      app.listen({
        bookmarkInsert: function (emitter) {
          app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
            if ( err ) {
              emitter.emit('error', err);
            } else {
              client.query(
                'insert into "bookmarks" ( "userID", "postID", "notes" ) values ( $1, $2, $3 ) returning id;',
                [ args.userID, args.postID, args.notes ],
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
        }
      }, function (output) {
        emitter.emit('ready', {
          success: output.listen.success
        });
      });
    }
  });
}


function saveReport(args, emitter) {

  if ( !args.reason.length ) {
    emitter.emit('ready', {
      success: false,
      message: 'You have to provide a reason for the report.'
    });
  } else {
    app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err);
      } else {
        client.query(
          'insert into "postReports" ( "postID", "reportedByID", "reason" ) values ( $1, $2, $3 ) returning id;',
          [ args.postID, args.userID, args.reason ],
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
        insertTrashPost: function (previous, emitter) {

          client.query(
            'insert into "postTrash" ( "id", "topicID", "userID", "html", "markdown", "dateCreated", "draft", "editorID", "editReason", "lastModified", "lockedByID", "lockReason", "deletedByID", "deleteReason" ) select "id", "topicID", "userID", "html", "markdown", "dateCreated", "draft", "editorID", "editReason", "lastModified", "lockedByID", "lockReason", $2, $3 from "posts" where id = $1;',
            [ args.postID, args.deletedByID, args.deleteReason ],
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
        deletePost: function (previous, emitter) {

          client.query(
            'delete from "posts" where "id" = $1;',
            [ args.postID ],
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
        updateTopicStats: function (previous, emitter) {

          client.query(
            'update "topics" set "sortDate" = ( select min("dateCreated") from "posts" where "topicID" = $1 and "draft" = false ), "firstPostID" = ( select min("id") from "posts" where "topicID" = $1 and "draft" = false ), "lastPostID" = ( select max("id") from "posts" where "topicID" = $1 and "draft" = false ), "replies" = ( select count("id") from "posts" where "topicID" = $1 and "draft" = false ) - 1 where "id" = $1',
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
        commit: function (previous, emitter) {
          client.query('commit', function () {
            done();
            emitter.emit('ready');
          });
        }
      }, function (output) {

        if ( output.listen.success ) {

          // Clear the topic cache
          app.cache.clear({ scope: args.topicUrl });
          app.cache.clear({ scope: args.discussionUrl });
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
