// post model

'use strict';

module.exports = {
  edit: edit,
  info: info,
  lock: lock,
  unlock: unlock,
  saveBookmark: saveBookmark,
  saveReport: saveReport
};


function edit(args, emitter) {
  if ( !args.content.markdown.length ) {
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
        connection.beginTransaction( function (err) {
          if ( err ) {
            done();
            emitter.emit('error', err);
          } else {
            client.query(
              'update posts ' +
              'set markdown = ' + connection.escape(args.content.markdown) + ', vchPostText = ' + connection.escape(args.content.html) + ', editorID = ' + connection.escape(args.editorID) + ', editReason = ' + connection.escape(args.reason) + ', lastModified = ' + connection.escape(args.time) + ' ' +
              'where id = ' + connection.escape(args.postID),
              function (err, result) {
                if ( err ) {
                  connection.rollback( function () {
                    done();
                    emitter.emit('error', err);
                  });
                } else {
                  // timestamp is not being set
                  client.query(
                    'insert into postHistory ( postID, editorID, editReason, markdown, html, time ) ' +
                    'values ( ' + connection.escape(args.currentPost.id) + ', ' + connection.escape(args.currentPost.editorID) + ', ' + connection.escape(args.currentPost.editReason) + ', ' + connection.escape(args.currentPost.markdown) + ', ' + connection.escape(args.currentPost.html) + ', ' + connection.escape(args.currentPost.lastModified) + ' )',
                    function (err, result) {
                      if ( err ) {
                        connection.rollback( function () {
                          done();
                          emitter.emit('error', err);
                        });
                      } else {
                        connection.commit( function (err) {
                          if ( err ) {
                            connection.rollback( function () {
                              done();
                              emitter.emit('error', err);
                            });
                          } else {
                            done();

                            // Clear the topic cache
                            app.clear({ scope: args.currentPost.topicUrlTitle });

                            emitter.emit('ready', {
                              success: true
                            });
                          }
                        });
                      }
                    }
                  );
                }
              }
            );
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
        'select p.id, p."topicID", p.html, p.markdown, p."dateCreated", p.draft, p."editReason", p."editorID", p."lastModified", p."lockedByID", p."lockReason", u.id as "authorID", u.username as author, u.url as "authorUrl", t.url as "topicUrl" from posts p join users u on p."userID" = u.id join topics t on p."topicID" = t.id where p.id = $1;',
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
        'update tblForumPosts set ' +
        'lockedBy = ' + connection.escape(args.lockedBy) + ', ' +
        'lockReason = ' + connection.escape(args.lockReason) + ' ' +
        'where intPostID = ' + connection.escape(args.postID),
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            // Clear the cache for this topic and discussion
            app.clear({ scope: args.topic });

            emitter.emit('ready', {
              success: true,
              affectedRows: result.affectedRows
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
        'update tblForumPosts set ' +
        'lockedBy = 0, lockReason = ""' +
        'where intPostID = ' + connection.escape(args.postID),
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            // Clear the cache for this topic and discussion
            app.clear({ scope: args.topic });

            emitter.emit('ready', {
              success: true,
              affectedRows: result.affectedRows
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
            eval(app.db.sql.postBookmarkExists),
            function (err, result) {
              done();
              if ( err ) {
                emitter.emit('error', err);
              } else {
                if ( rows.length ) {
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
                eval(app.db.sql.postBookmarkInsert),
                function (err, result) {
                  done();
                  if ( err ) {
                    emitter.emit('error', err);
                  } else {
                    emitter.emit('ready', result.insertId);
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
          'insert into tblForumPostReports ( intPostID, intPostReportedByID, vchPostReportReason ) values ( ' +
          connection.escape(args.postID) + ', ' +
          connection.escape(args.userID) + ', ' +
          connection.escape(args.reason) + ');',
          function (err, result) {
            done();
            if ( err ) {
              emitter.emit('error', err);
            } else {
              emitter.emit('ready', {
                success: true,
                reportID: result.insertId
              });
            }
          }
        );
      }
    });
  }

}
