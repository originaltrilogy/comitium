// post model

'use strict';

module.exports = {
  edit: edit,
  info: info,
  lock: lock,
  unlock: unlock,
  page: page,
  saveBookmark: saveBookmark,
  saveReport: saveReport,
  trash: trash
};


function edit(args, emitter) {
  if ( !args.text.length ) {
    emitter.emit('ready', {
      success: false,
      reason: 'requiredFieldsEmpty',
      message: 'Posts can\'t be empty.'
    });
  } else {
    app.toolbox.dbPool.connect(function (err, client, done) {
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
              'update "posts" set "text" = $1, "html" = $2, "editorID" = $3, "editReason" = $4, "modified" = $5 where "id" = $6',
              [ args.text, args.html, args.editorID, args.reason, args.time, args.id ],
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
              'insert into "postHistory" ( "postID", "editorID", "editReason", "text", "html", "time" ) values ( $1, $2, $3, $4, $5, $6 ) returning id',
              [ args.id, !args.currentPost.editorID ? args.currentPost.authorID : args.currentPost.editorID, args.currentPost.editReason, args.currentPost.text, args.currentPost.html, args.currentPost.modified || args.currentPost.created ],
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
  app.toolbox.dbPool.connect(function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'select p.id, p."userID", p."topicID", p.text, p.html, p."created", p."modified", p.draft, p."editorID", p."editReason", p."lockedByID", p."lockReason", t."discussionID", t."title" as "topicTitle", t."titleHtml" as "topicTitle", t.url as "topicUrl", t.replies as "topicReplies", d."url" as "discussionUrl", u.id as "authorID", u.username as author, u.url as "authorUrl", u2.username as editor, u2.url as "editorUrl" from posts p join users u on p."userID" = u.id left join users u2 on p."editorID" = u2.id join topics t on p."topicID" = t.id left join discussions d on t."discussionID" = d."id" where p.id = $1;',
        [ postID ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            if ( result.rows.length ) {
              result.rows[0].createdFormatted = app.toolbox.moment.tz(result.rows[0].created, 'America/New_York').format('D-MMM-YYYY, h:mm A');
              if ( result.rows[0].modified ) {
                result.rows[0].modifiedFormatted = app.toolbox.moment.tz(result.rows[0].modified, 'America/New_York').format('D-MMM-YYYY, h:mm A');
              }
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
  app.toolbox.dbPool.connect(function (err, client, done) {
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
  app.toolbox.dbPool.connect(function (err, client, done) {
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


function page(postID, emitter) {
  app.toolbox.dbPool.connect(function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'select ceiling(row_number::real/25::real) as page from ' +
        '( select id, row_number() over (order by created asc) ' +
        'from posts where "topicID" = ( select "topicID" from posts where id = $1 ) and draft = false ) posts ' +
        'where posts.id = $1;',
        [ postID ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            if ( result.rows.length ) {
              emitter.emit('ready', result.rows[0].page);
            } else {
              emitter.emit('ready', false);
            }
          }
        }
      );
    }
  });
}



function saveBookmark(args, emitter) {
  app.listen({
    bookmarkExists: function (emitter) {
      app.toolbox.dbPool.connect(function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err);
        } else {
          client.query(
            'select "userID" from "bookmarks" where "userID" = $1 and "postID" = $2;',
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
          app.toolbox.dbPool.connect(function (err, client, done) {
            if ( err ) {
              emitter.emit('error', err);
            } else {
              client.query(
                'insert into "bookmarks" ( "userID", "postID", "notes" ) values ( $1, $2, $3 );',
                [ args.userID, args.postID, args.notes ],
                function (err, result) {
                  done();
                  if ( err ) {
                    emitter.emit('error', err);
                  } else {
                    emitter.emit('ready', {
                      success: true
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
    app.toolbox.dbPool.connect(function (err, client, done) {
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
  app.toolbox.dbPool.connect(function (err, client, done) {
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
            'insert into "postTrash" ( "id", "topicID", "userID", "html", "text", "created", "modified", "draft", "editorID", "editReason", "lockedByID", "lockReason", "deletedByID", "deleteReason" ) select "id", "topicID", "userID", "html", "text", "created", "modified", "draft", "editorID", "editReason", "lockedByID", "lockReason", $2, $3 from "posts" where id = $1;',
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
        sticky: function (previous, emitter) {
          client.query(
            'select sticky from topics where id = $1;',
            [ args.topicID ],
            function (err, result) {
              if ( err ) {
                client.query('rollback', function (err) {
                  done();
                });
                emitter.emit('error', err);
              } else {
                emitter.emit('ready', result.rows[0].sticky);
              }
            }
          );
        },
        lastPostDate: function (previous, emitter) {
          client.query(
            'select max(created) as "lastPostDate" from posts where "topicID" = $1 and draft = false;',
            [ args.topicID ],
            function (err, result) {
              if ( err ) {
                client.query('rollback', function (err) {
                  done();
                });
                emitter.emit('error', err);
              } else {
                emitter.emit('ready', result.rows[0].lastPostDate);
              }
            }
          );
        },
        updateTopicStats: function (previous, emitter) {
          var sticky;

          if ( app.toolbox.moment(previous.sticky).isAfter(app.toolbox.moment().utc().valueOf()) ) {
            sticky = previous.sticky;
          } else {
            sticky = previous.lastPostDate;
          }
          client.query(
            'update "topics" set "replies" = ( select count("id") from "posts" where "topicID" = $1 and "draft" = false ) - 1, sticky = $2 where "id" = $1',
            [ args.topicID, sticky ],
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
            'update "discussions" set "topics" = ( select count("id") from "topics" where "discussionID" = $1 and "draft" = false ), "posts" = ( select count(p."id") from "posts" p join "topics" t on p."topicID" = t."id" where t."discussionID" = $1 and t.draft = false and p."draft" = false ), last_post_id = ( select posts.id from posts join topics on posts."topicID" = topics.id where topics."discussionID" = $1 and topics.draft = false and posts.draft = false order by posts.created desc limit 1 ) where "id" = $1',
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

          // Clear the topic and user caches
          app.cache.clear({ scope: 'topic-' + args.topicID });
          app.cache.clear({ scope: 'discussion-' + args.discussionID });
          app.cache.clear({ scope: 'categories_discussions' });
          app.cache.clear({ scope: 'user-' + args.authorID });

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
