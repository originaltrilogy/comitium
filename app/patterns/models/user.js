// user model

'use strict';

var crypto = require('crypto');

module.exports = {
  activate: activate,
  activationStatus: activationStatus,
  authenticate: authenticate,
  ban: ban,
  unban: unban,
  create: create,
  emailExists: emailExists,
  exists: exists,
  info: info,
  insert: insert,
  isActivated: isActivated,
  loginData: loginData,
  posts: posts,
  urlExists: urlExists
};



function activate(args, emitter) {
  if ( !args.id || !args.activationCode ) {
    emitter.emit('ready', {
      success: false,
      message: 'The activation link you requested isn\'t valid. Try copying it from your activation e-mail and pasting it into your browser\'s address bar. If you continue to have problems, please contact us for help.'
    });
  } else {
    app.listen('waterfall', {
      userActivationStatus: function (emitter) {
        app.models.user.activationStatus({ id: args.id, activationCode: args.activationCode }, emitter);
      },
      activateUser: function (previous, emitter) {
        // If the account isn't activated, activate it
        if ( previous.userActivationStatus.userExists && !previous.userActivationStatus.activationDate && previous.userActivationStatus.activationCode === args.activationCode ) {
          app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
            if ( err ) {
              emitter.emit('error', err);
            } else {
              client.query(
                'update users set "activationDate" = $1 where id = $2 and "activationCode" = $3',
                [ app.toolbox.helpers.isoDate(), args.id, args.activationCode ],
                function (err, result) {
                  done();
                  if ( err ) {
                    emitter.emit('error', err);
                  } else {
                    emitter.emit('ready', {
                      success: true,
                      message: 'Your account has been activated! You can now sign in using the credentials you chose when you registered.'
                    });
                  }
              });
            }
          });
        } else {
          console.log(previous.userActivationStatus);
          if ( !previous.userActivationStatus.userExists ) {
            emitter.emit('ready', {
              success: false,
              reason: 'userDoesNotExist',
              message: 'The account you\'re trying to activate doesn\'t exist. Please contact us for help.'
            });
          } else if ( previous.userActivationStatus.activationDate ) {
            emitter.emit('ready', {
              success: false,
              reason: 'accountAlreadyActivated',
              message: 'This account has already been activated, so you\'re free to log in below. If you\'re having trouble logging in, try resetting your password. If that doesn\'t work, please let us know.'
            });
          } else if ( previous.userActivationStatus.activationCode !== args.activationCode ) {
            emitter.emit('ready', {
              success: false,
              reason: 'invalidActivationCode',
              message: 'Your activation code is invalid. Please contact us for help.'
            });
          }
        }
      }
    }, function (output) {

      if ( output.listen.success ) {

        emitter.emit('ready', output.activateUser);

      } else {

        emitter.emit('error', output.listen);

      }

    });
  }
}


function activationStatus(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'select "id", "activationCode", "activationDate" from "users" where "id" = $1',
        [ args.id ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            if ( result.rows.length ) {
              emitter.emit('ready', {
                userExists: true,
                id: result.rows[0].id,
                activationCode: result.rows[0].activationCode,
                activationDate: result.rows[0].activationDate
              });
            } else {
              emitter.emit('ready', {
                userExists: false
              });
            }
          }
      });
    }
  });
}


function authenticate(credentials, emitter) {
  var username = credentials.username.trim(),
      password = credentials.password || '',
      passwordHash = credentials.passwordHash || '';

  password = password.trim();
  passwordHash = passwordHash.trim();

  if ( !passwordHash.length && ( !username.length || !password.length ) ) {
    emitter.emit('ready', {
      success: false,
      reason: 'requiredFieldsEmpty',
      message: 'One or more required fields is empty.'
    });
  } else {
    app.listen('waterfall', {
      userExists: function (emitter) {
        app.models.user.exists({ username: username }, emitter);
      },
      loginData: function (previous, emitter) {
        if ( previous.userExists ) {
          app.models.user.loginData({ username: username }, emitter);
        } else {
          emitter.emit('ready', false);
        }
      }
    }, function (output) {

      if ( output.listen.success && output.loginData ) {
        if ( output.loginData.activationDate ) {
          if ( output.loginData.login ) {
            if ( password.length ) {
              // TODO: Fix existing hashes in db to use sha512 (issue new passwords to all users)
              // and remove toLowerCase() because the new hashes will be lowercase, or just loop
              // over the user table and update all hashes using toLowerCase()).
              passwordHash = crypto.createHash('md5').update(password).digest('hex');
            }
            if ( output.loginData.passwordHash === passwordHash || output.loginData.passwordHash.toLowerCase() === passwordHash ) {
              emitter.emit('ready', {
                success: true,
                message: 'Cookies are set.',
                user: {
                  username: username,
                  passwordHash: passwordHash,
                  userID: output.loginData.id,
                  groupID: output.loginData.groupID,
                  moderateDiscussions: output.loginData.moderateDiscussions,
                  moderateUsers: output.loginData.moderateUsers
                }
              });
            } else {
              emitter.emit('ready', {
                success: false,
                reason: 'passwordMismatch',
                message: 'The password you provided doesn\'t match our records.'
              });
            }
          } else {
            emitter.emit('ready', {
              success: false,
              reason: 'banned',
              message: 'The username you provided has had its login privileges revoked.'
            });
          }
        } else {
          emitter.emit('ready', {
            success: false,
            reason: 'notActivated',
            message: 'This account is awaiting activation. Did you follow the instructions in your welcome e-mail to activate your account? If you\'ve activated your account and you\'re still getting this message, please contact an administrator for assistance.'
          });
        }
      } else {
        if ( output.listen.success ) {
          emitter.emit('ready', {
            success: false,
            reason: 'noRecord',
            message: 'The username you provided doesn\'t exist.'
          });
        } else {
          emitter.emit('error', output.listen);
        }
      }
    });
  }
}



function ban(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {

      client.query(
        'update "users" set "groupID" = ( select "id" from "groups" where "name" = \'Banned Users\' ) where "url" = $1;',
        [ args.user ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
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



function unban(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {

      client.query(
        'update "users" set "groupID" = ( select "id" from "groups" where "name" = \'New Members\' ) where "url" = $1;',
        [ args.user ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
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



function create(args, emitter) {
  var username = args.username.trim(),
      email = args.email.trim(),
      password = args.password.trim(),
      verifyPassword = args.verifyPassword.trim(),
      tos = args.tos || false;

  // Defeat attempts to mimic a username with extra internal spaces
  while ( username.search(/\s\s/) >= 0 ) {
    username = username.replace(/\s\s/g, ' ');
  }

  if ( !username.length || !password.length || !verifyPassword.length || !email.length || !tos ) {
    emitter.emit('ready', failed('requiredFieldsEmpty'));
  } else if ( app.toolbox.validate.username(username) === false ) {
    emitter.emit('ready', failed('invalidUsername'));
  } else if ( app.toolbox.validate.email(email) === false ) {
    emitter.emit('ready', failed('invalidEmail'));
  } else if ( app.toolbox.validate.password(password) === false ) {
    emitter.emit('ready', failed('invalidPassword'));
  } else if ( password !== verifyPassword ) {
    emitter.emit('ready', failed('passwordMismatch'));
  } else {
    app.listen({
      userExists: function (emitter) {
        app.models.user.exists({ username: username }, emitter);
      },
      emailExists: function (emitter) {
        app.models.user.emailExists({ email: email }, emitter);
      }
    }, function (output) {
      var url,
          time,
          activationCode;

      if ( output.listen.success ) {
        if ( output.userExists ) {
          emitter.emit('ready', failed('userExists'));
        } else if ( output.emailExists ) {
          emitter.emit('ready', failed('emailExists'));
        } else {
          url = app.toolbox.slug(username);
          time = app.toolbox.helpers.isoDate();
          activationCode = Math.random().toString().replace('0.', '');

          app.listen({
            userInsert: function (emitter) {
              app.models.user.insert({
                groupID: 2,
                username: username,
                passwordHash: crypto.createHash('md5').update(password).digest('hex'),
                url: url,
                email: email,
                timezone: 0,
                dateFormat: 'mmmm d, yyyy',
                lastActivity: time,
                joinDate: time,
                pmEmailNotification: true,
                subscriptionEmailNotification: true,
                activationCode: activationCode,
                system: false,
                locked: false
              }, emitter);
            }
          }, function (output) {

            if ( output.listen.success ) {
              emitter.emit('ready', {
                success: true,
                message: 'Your account has been created. You need to activate it before you can post, so please check your e-mail for your activation instructions.',
                username: username,
                url: url,
                id: output.userInsert.id,
                email: email,
                activationCode: activationCode
              });
            } else {
              emitter.emit('error', output.listen);
            }

          });
        }
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }

  function failed(reason) {
    var output = {
          success: false,
          reason: reason
        };

    switch ( reason ) {
      case 'requiredFieldsEmpty':
        output.message = 'One or more required fields is empty.';
        break;
      case 'userExists':
        output.message = 'The username you requested already exists.';
        break;
      case 'emailExists':
        output.message = 'The e-mail address you provided already exists. Are you sure you don\'t have an account already?';
        break;
      case 'invalidUsername':
        output.message = 'The username you requested contains characters that aren\'t allowed.';
        break;
      case 'invalidEmail':
        output.message = 'The e-mail address you provided isn\'t valid.';
        break;
      case 'invalidPassword':
        output.message = 'The password you requested doesn\'t meet the requirements (at least 8 characters, letters and numbers only).';
        break;
      case 'passwordMismatch':
        output.message = 'The passwords you provided don\'t match.';
        break;
      default:
        output.message = 'An unspecified error occurred. Please try again later.';
    }

    return output;
  }
}


function emailExists(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'select email ' +
        'from users ' +
        'where email = $1',
        [ args.email ],
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
      });
    }
  });
}


function exists(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      if ( args.username ) {
        client.query(
          'select id ' +
          'from users ' +
          'where username = $1',
          [ args.username ],
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
        });
      } else if ( args.id ) {
        client.query(
          'select username ' +
          'from users ' +
          'where id = $1',
          [ args.id ],
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
        });
      }
    }
  });
}


function info(user, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'select u."id", u."groupID", u."username", u."passwordHash", u."url", u."email", u."timezone", u."dateFormat", u."signature", u."lastActivity", u."joinDate", u."website", u."blog", u."pmEmailNotification", u."subscriptionEmailNotification", u."activationDate", u."activationCode", u."system", u."locked", g."name" as "group", ( select count("id") from "posts" where "userID" = ( select "id" from "users" where "url" = $1 ) ) as "postCount" from "users" u join "groups" g on u."groupID" = g."id" where "url" = $1',
        [ user ],
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
      });
    }
  });
}


function insert(args, emitter) {

  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      app.listen('waterfall', {
        urlExists: function (emitter) {
          client.query(
            'select id from users where url = $1;',
            [ args.url ],
            function (err, result) {
              if ( err ) {
                done();
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
        },
        begin: function (previous, emitter) {
          client.query('begin', function (err) {
            if ( err ) {
              done();
              emitter.emit('error', err);
            } else {
              emitter.emit('ready');
            }
          });
        },
        insertUser: function (previous, emitter) {
          client.query(
            'insert into "users" ( "groupID", "username", "passwordHash", "url", "email", "timezone", "dateFormat", "lastActivity", "joinDate", "pmEmailNotification", "subscriptionEmailNotification", "activationCode", "system", "locked" ) values ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14 ) returning id;',
            [ args.groupID, args.username, args.passwordHash, args.activationCode, args.email, args.timezone, args.dateFormat, args.lastActivity, args.joinDate, args.pmEmailNotification, args.subscriptionEmailNotification, args.activationCode, args.system, args.locked ],
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
        updateUrl: function (previous, emitter) {
          var sql;

          if ( previous.urlExists ) {
            sql = 'update "users" set "url" = $1 || \'-\' || "id" where "username" = $2;';
          } else {
            sql = 'update "users" set "url" = $1 where "username" = $2;';
          }

          client.query(
            sql,
            [ args.url, args.username ],
            function (err, result) {
              if ( err ) {
                client.query('rollback', function (err) {
                  done();
                });
                emitter.emit('error', err);
              } else {
                emitter.emit('ready', {
                  rowsAffected: result.rowCount
                });
              }
          });
        },
        commit: function (previous, emitter) {
          client.query('commit', function () {
            done();
            emitter.emit('ready');
          });
        }
      }, function (output) {

        if ( output.listen.success ) {

          emitter.emit('ready', output.insertUser);

        } else {

          emitter.emit('error', output.listen);

        }

      });
    }
  });

}


function isActivated(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'select "activationDate" ' +
        'from "users" ' +
        'where "id" = $1',
        [ args.id ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            if ( result.rows[0] && result.rows[0].activationDate ) {
              emitter.emit('ready', true);
            } else {
              emitter.emit('ready', false);
            }
          }
      });
    }
  });
}


function loginData(args, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        'select u."id", u."groupID", u."username", u."passwordHash", u."activationDate", g."login", g."moderateDiscussions", g."moderateUsers" ' +
        'from "users" u ' +
        'join "groups" g on u."groupID" = g."id" ' +
        'where u."username" = $1',
        [ args.username ],
        function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            emitter.emit('ready', result.rows[0]);
          }
        }
      );
    }
  });
}



function posts(args, emitter) {
  // See if this topic subset is already cached
  var user = args.user,
      start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'models-user-posts-subset-' + start + '-' + end,
      scope = user,
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
              'where u."url" = $1 and p.draft = false ' +
              'order by p."dateCreated" desc ' +
              'limit $2 offset $3;',
              [ user, end - start, start ],
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



function urlExists(user, emitter) {
  app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query(
        eval(app.db.sql.userUrlExists),
        [ user ],
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
