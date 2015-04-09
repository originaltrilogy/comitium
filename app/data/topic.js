// SQL queries related to topics

'use strict';

module.exports = {
  exists: exists,
  info: info,
  infoByTopicID: infoByTopicID,
  insert: insert,
  postByPostID: postByPostID,
  posts: posts,
  reply: reply,
  viewTimeUpdate: viewTimeUpdate,
  subscribersToNotify: subscribersToNotify,
  subscriptionNotificationSentUpdate: subscriptionNotificationSentUpdate,
  subscriptionExists: subscriptionExists,
  subscriptionInsert: subscriptionInsert,
  subscriptionDelete: subscriptionDelete
};


function exists(topic, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.topicExists),
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


function info(topic, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.topicInfo),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.rows);
          }
          done();
        }
      );
    }
  });
}


function infoByTopicID(topic, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.topicInfoByTopicID),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.rows);
          }
          done();
        }
      );
    }
  });
}


function insert(args, emitter) {
  var makeUrlTitleUnique = false;

  app.listen({
    urlTitleExists: function (emitter) {
      exists(args.urlTitle, emitter);
    }
  }, function (output) {
    if ( output.urlTitleExists ) {
      makeUrlTitleUnique = true;
    }
    app.db.connect(app.config.db.connectionString, function (err, client, done) {
      if ( err ) {
        throw err;
      } else {
        connection.beginTransaction( function (err) {
          if ( err ) {
            throw err;
          } else {
            client.query(
              eval(app.data.sql.topicInsert),
              function (err, result) {
                if ( err ) {
                  connection.rollback( function () {
                    throw err;
                  });
                } else {
                  args.topicID = result.insertId;

                  client.query(
                    eval(app.data.sql.postInsert),
                    function (err, result) {
                      if ( err ) {
                        connection.rollback( function () {
                          throw err;
                        });
                      } else {
                        client.query(
                          eval(app.data.sql.topicLookupInsert),
                          function (err, result) {
                            if ( err ) {
                              connection.rollback( function () {
                                throw err;
                              });
                            } else {
                              client.query(
                                eval(app.data.sql.discussionCountsUpdate),
                                function (err, result) {
                                  if ( err ) {
                                    connection.rollback( function () {
                                      throw err;
                                    });
                                  } else {
                                    if ( makeUrlTitleUnique ) {
                                      args.urlTitle = args.urlTitle + '-' + args.topicID;

                                      client.query(
                                        eval(app.data.sql.topicUrlTitleUpdate),
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
                                                emitter.emit('ready', {
                                                  success: true,
                                                  topicID: args.topicID,
                                                  urlTitle: args.urlTitle
                                                });
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
                                          emitter.emit('ready', {
                                            success: true,
                                            topicID: args.topicID,
                                            urlTitle: args.urlTitle
                                          });
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
          }
        });
      }
    });
  });
}


function posts(topic, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.postsByTopic),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.rows);
          }
          done();
        }
      );
    }
  });
}


function postByPostID(postID, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.postByPostID),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            if ( rows.length ) {
              emitter.emit('ready', rows[0]);
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


function reply(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      connection.beginTransaction( function (err) {
        if ( err ) {
          throw err;
        } else {
          client.query(
            eval(app.data.sql.postInsert),
            function (err, result) {
              var postID = 0;

              if ( err ) {
                connection.rollback( function () {
                  throw err;
                });
              } else {
                postID = result.insertId;

                client.query(
                  eval(app.data.sql.topicCountsUpdate),
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
                          emitter.emit('ready', {
                            success: true,
                            postID: postID
                          });
                        }
                      });
                    }
                });
              }
          });
        }
      });
    }
  });
}


function viewTimeUpdate(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.topicViewTimeUpdate),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            if ( result.affectedRows ) {
              emitter.emit('ready', result.affectedRows);
            } else {
              client.query(
                eval(app.data.sql.topicViewTimeInsert),
                function (err, result) {
                  if ( err ) {
                    throw err;
                  } else {
                    emitter.emit('ready', result.id);
                  }
                  done();
                }
              );
            }
          }
          done();
        }
      );
    }
  });
}


function subscribersToNotify(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.topicSubscribersToNotify),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.rows);
          }
          done();
        }
      );
    }
  });
}


function subscriptionNotificationSentUpdate(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.topicSubscriptionNotificationSentUpdate),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.affectedRows);
          }
          done();
        }
      );
    }
  });
}


function subscriptionExists(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    var sql;

    if ( err ) {
      throw err;
    } else {
      if ( args.topicID ) {
        sql = app.data.sql.topicSubscriptionExists;
      } else if ( args.topic ) {
        sql = app.data.sql.topicSubscriptionExistsByTopic;
      }
      client.query(
        eval(sql),
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


function subscriptionInsert(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.topicSubscriptionInsert),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready', result.id);
          }
          done();
        }
      );
    }
  });
}


function subscriptionDelete(args, emitter) {
  app.db.connect(app.config.db.connectionString, function (err, client, done) {
    if ( err ) {
      throw err;
    } else {
      client.query(
        eval(app.data.sql.topicSubscriptionDelete),
        function (err, result) {
          if ( err ) {
            throw err;
          } else {
            emitter.emit('ready');
          }
          done();
        }
      );
    }
  });
}
