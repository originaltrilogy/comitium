// SQL queries related to users and accounts

'use strict';

module.exports = {
  activate: activate,
  emailExists: emailExists,
  exists: exists,
  urlExists: urlExists,
  groupDiscussionAccess: groupDiscussionAccess,
  insert: insert,
  isActivated: isActivated,
  loginData: loginData
};


function activate(args, emitter) {
  // Check if the user account exists
  app.listen({
    userExists: function (emitter) {
      app.data.user.exists({ userID: args.userID }, emitter);
    }
  }, function (output) {
    // If it exists, check if it's already activated
    if ( output.userExists ) {
      app.listen({
        userIsActivated: function (emitter) {
          app.data.user.isActivated({ userID: args.userID }, emitter);
        }
      }, function (output) {
        // If the account isn't activated, activate it
        if ( !output.userIsActivated ) {
          app.db.connect(app.config.db.connectionString, function (err, client, done) {
            if ( err ) {
              throw err;
            }
            client.query(
              'update tblForumUsers ' +
              'set activationDate = ' + connection.escape(app.toolbox.helpers.isoDate()) + ' ' +
              'where intUserID = ' + connection.escape(args.userID) + ' ' +
              'and activationCode = ' + connection.escape(args.activationCode),
              function (err, result) {
                if ( err ) {
                  throw err;
                }
                // If no updates occurred, it's because the activation code isn't valid
                if ( result.affectedRows > 0 ) {
                  emitter.emit('ready', { success: true });
                } else {
                  emitter.emit('ready', { success: false, reason: 'invalidActivationCode' });
                }
                done();
            });
          });
        } else {
          emitter.emit('ready', { success: false, reason: 'userAlreadyActivated' });
        }
      });
    } else {
      emitter.emit('ready', { success: false, reason: 'userDoesNotExist' });
    }
  });
}


function emailExists(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    }
    client.query(
      'select vchUserEmail ' +
      'from tblForumUsers ' +
      'where vchUserEmail = ' + connection.escape(args.email),
      function (err, result) {
        if ( err ) {
          throw err;
        }
        if ( rows.length ) {
          emitter.emit('ready', true);
        } else {
          emitter.emit('ready', false);
        }
        done();
    });
  });
}


function exists(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    }
    if ( args.username ) {
      client.query(
        'select intUserID ' +
        'from tblForumUsers ' +
        'where vchUsername = ' + connection.escape(args.username),
        function (err, result) {
          if ( err ) {
            throw err;
          }
          if ( rows.length ) {
            emitter.emit('ready', true);
          } else {
            emitter.emit('ready', false);
          }
          done();
      });
    } else if ( args.userID ) {
      client.query(
        'select vchUsername ' +
        'from tblForumUsers ' +
        'where intUserID = ' + connection.escape(args.userID),
        function (err, result) {
          if ( err ) {
            throw err;
          }
          if ( rows.length ) {
            emitter.emit('ready', true);
          } else {
            emitter.emit('ready', false);
          }
          done();
      });
    }
  });
}


function urlExists(user, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.userUrlExists),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            if ( rows.length ) {
              emitter.emit('ready', true);
            } else {
              emitter.emit('ready', false);
            }
          }
          done();
        }
      );
    }
  });
}


function groupDiscussionAccess(groupID, discussion, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.groupDiscussionAccess),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.rows);
          }
          done();
      });
    }
  });
}


function insert(args, emitter) {
  var makeUrlUnique = false;

  app.listen({
    urlExists: function (emitter) {
      urlExists(args.vchURLUsername, emitter);
    }
  }, function (output) {
    if ( output.urlExists ) {
      makeUrlUnique = true;
    }

    app.db.connect(app.config.db.connectionString, function (err, client, done) {
      if ( err ) {
        throw err;
      }
      connection.beginTransaction( function (err) {
        if ( err ) {
          throw err;
        }
        client.query(
          'insert into tblForumUsers set ?', args,
          function (err, result) {
            var userID = 0;
            if ( err ) {
              connection.rollback( function () {
                throw err;
              });
            } else {
              userID = result.insertId;

              client.query(
                'insert into tblForumPrivateMessageFolders set intUserID = ?, vchFolderName = "Inbox"', userID,
                function (err, result) {
                  if ( err ) {
                    connection.rollback( function () {
                      throw err;
                    });
                  } else {
                    client.query(
                      'insert into tblForumPrivateMessageFolders set intUserID = ?, vchFolderName = "Sent Items"', userID,
                      function (err, result) {
                        if ( err ) {
                          connection.rollback( function () {
                            throw err;
                          });
                        } else {
                          client.query(
                            'insert into tblForumPrivateMessageFolders set intUserID = ?, vchFolderName = "Drafts"', userID,
                            function (err, result) {
                              if ( err ) {
                                connection.rollback( function () {
                                  throw err;
                                });
                              } else {
                                if ( makeUrlUnique ) {
                                  client.query(
                                    'update tblForumUsers set vchUrlUsername = ? where intUserID = ?', [ args.vchURLUsername + '-' + userID, userID ],
                                    function (err, result) {
                                      if ( err ) {
                                        connection.rollback( function () {
                                          throw err;
                                        });
                                      } else {
                                        connection.commit( function (err) {
                                          if ( err ) {
                                            connection.rollback( function () {
                                              throw err;
                                            });
                                          } else {
                                            done();
                                            emitter.emit('ready', { success: true, userID: userID });
                                          }
                                        });
                                      }
                                  });
                                } else {
                                  connection.commit( function (err) {
                                    if ( err ) {
                                      connection.rollback( function () {
                                        throw err;
                                      });
                                    } else {
                                      done();
                                      emitter.emit('ready', { success: true, userID: userID });
                                    }
                                  });
                                }
                              }
                          });
                        }
                    });
                  }
              });
            }
        });
      });
    });
  });
}


function isActivated(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    }
    client.query(
      'select activationDate ' +
      'from tblForumUsers ' +
      'where intUserID = ' + connection.escape(args.userID),
      function (err, result) {
        if ( err ) {
          throw err;
        }
        if ( rows[0] && rows[0].activationDate ) {
          emitter.emit('ready', true);
        } else {
          emitter.emit('ready', false);
        }
        done();
    });
  });
}


function loginData(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    }
    client.query(
      'select U.intUserID, U.intGroupID, U.vchUsername, U.vchPassword, U.activationDate, UGP.bitLogin ' +
      'from tblForumUsers U ' +
      'inner join tblForumUserGroupPermissions UGP on U.intUserID = UGP.intUserID ' +
      'where U.vchUsername = ' + connection.escape(args.username),
      function (err, result) {
        if ( err ) {
          throw err;
        }
        if ( rows.length ) {
          emitter.emit('ready', result.rows);
          done();
        } else {
          client.query(
            'select U.intUserID, U.intGroupID, U.vchUsername, U.vchPassword, U.activationDate, UGP.bitLogin ' +
            'from tblForumUsers U ' +
            'inner join tblForumUserGroupPermissions UGP on U.intGroupID = UGP.intGroupID ' +
            'where U.vchUsername = ' + connection.escape(args.username),
            function (err, result) {
              if ( err ) {
                throw err;
              }
              emitter.emit('ready', result.rows);
              done();
            }
          );
        }
    });
  });
}
