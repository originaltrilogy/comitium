// Security checks to verify if users have access to a given controller/action/view

'use strict';

module.exports = {
  challenge: challenge,
  signInRedirect: signInRedirect,
  discussionView: discussionView,
  discussionPost: discussionPost,
  discussionReply: discussionReply,
  privateTopicsView: privateTopicsView,
  privateTopicStart: privateTopicStart,
  topicLock: topicLock,
  topicMerge: topicMerge,
  topicMove: topicMove,
  topicMoveForm: topicMoveForm,
  topicReply: topicReply,
  topicTrash: topicTrash,
  topicView: topicView,
  announcementView: announcementView,
  announcementReply: announcementReply,
  postView: postView,
  postEdit: postEdit,
  postLock: postLock,
  postTrash: postTrash
};


// Use challenge() for actions that don't require authentication, but have different
// access privileges based on the group ID. If they're not logged in, send them to
// the sign in form. If they are, respond with a 403 Forbidden.
function challenge(groupID, emitter) {

  if ( groupID === 1 ) {
    emitter.emit('ready', {
      redirect: app.config.main.baseUrl + 'sign-in'
    });
  } else {
    emitter.emit('error', {
      statusCode: 403
    });
  }

}



function signInRedirect(params, url) {

  return params.request.headers.referer && params.request.headers.referer.search('/sign-in') < 0 ? params.request.headers.referer : url;

}



function privateTopicStart(args, emitter) {

  app.listen({
    user: function (emitter) {
      app.models.user.info({
        userID: args.userID
      }, emitter);
    },
    userIsIgnored: function (emitter) {
      var methods = {};

      if ( args.invitees ) {
        args.invitees.forEach( function (item, index, array) {
          methods[item] = function (emitter) {
            app.models.user.isIgnored({
              username: args.username,
              ignoredBy: item
            }, emitter);
          };
        });

        app.listen(methods, function (output) {
          var ignored = false;

          if ( output.listen.success ) {
            delete output.listen;
            for ( var property in output ) {
              if ( property === true ) {
                ignored = true;
                emitter.emit('error', {
                  statusCode: 403,
                  message: property + ' has you on their ignore list, so you can\'t invite them to a private topic.'
                });
              }
            }
            if ( !ignored ) {
              emitter.emit('ready', false);
            }
          } else {
            emitter.emit('error', output.listen);
          }
        });
      } else {
        emitter.emit('ready', false);
      }
    }
  }, function (output) {
    var message = '';

    if ( output.listen.success ) {
      if ( output.user.talkPrivately && !output.userIsIgnored ) {
        emitter.emit('ready', true);
      } else {
        if ( !output.user.talkPrivately ) {
          if ( output.user.group === 'New Members' ) {
            message = 'New members require a minimum of 5 posts before they can start private topics.';
          } else {
            message = 'Your private topic privileges have been revoked. Please contact an administrator for details.';
          }
        }
        emitter.emit('error', {
          statusCode: 403,
          message: message
        });
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function privateTopicsView(session, emitter) {

  if ( session.talkPrivately ) {
    emitter.emit('ready', true);
  } else {
    emitter.emit('error', {
      statusCode: 403
    });
  }

}



function discussionView(discussionID, groupID, emitter) {

	app.listen('waterfall', {
    discussion: function (emitter) {
      app.models.discussion.info(discussionID, emitter);
    },
    discussionPermissions: function (previous, emitter) {
      if ( previous.discussion ) {
        app.models.group.discussionPermissions(discussionID, groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionPermissions.read ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function discussionPost(discussionID, session, emitter) {

	app.listen('waterfall', {
    discussion: function (emitter) {
      app.models.discussion.info(discussionID, emitter);
    },
    discussionPermissions: function (previous, emitter) {
      if ( previous.discussion ) {
        app.models.group.discussionPermissions(discussionID, session.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionPermissions.post ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function discussionReply(discussion, groupID, emitter) {

	app.listen('waterfall', {
    discussion: function (emitter) {
      app.models.discussion.info(discussion, emitter);
    },
    discussionPermissions: function (previous, emitter) {
      if ( previous.discussion ) {
        app.models.group.discussionPermissions(discussion, groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionPermissions.reply ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function topicLock(topicID, session, emitter) {

	app.listen('waterfall', {
    topic: function (emitter) {
      if ( session.moderateDiscussions ) {
        app.models.topic.info(topicID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topic ) {
        discussionView(previous.topic.discussionID, session.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the topic exists but the group doesn't have lock access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.topic ) {
        challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function topicMerge(topicID, session, emitter) {

	app.listen('waterfall', {
    topic: function (emitter) {
      if ( session.moderateDiscussions ) {
        app.models.topic.info(topicID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topic ) {
        discussionView(previous.topic.discussionID, session.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the topic exists but the group doesn't have merge access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.topic ) {
        challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function topicMove(topicID, session, emitter) {

	app.listen('waterfall', {
    topic: function (emitter) {
      if ( session.moderateDiscussions ) {
        app.models.topic.info(topicID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topic ) {
        if ( session.moderateDiscussions ) {
          discussionView(previous.topic.discussionID, session.groupID, emitter);
        } else {
          emitter.emit('error', {
            statusCode: 403
          });
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the topic exists but the group doesn't have move access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.topic ) {
        challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function topicMoveForm(topicID, newDiscussionID, session, emitter) {

	app.listen('waterfall', {
    topic: function (emitter) {
      if ( session.moderateDiscussions ) {
        app.models.topic.info(topicID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topic ) {
        if ( session.moderateDiscussions ) {
          discussionView(previous.topic.discussionID, session.groupID, emitter);
        } else {
          emitter.emit('error', {
            statusCode: 403
          });
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    },
    discussionMoveView: function (previous, emitter) {
      discussionView(newDiscussionID, session.groupID, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView && output.discussionMoveView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the topic exists but the group doesn't have move access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.topic ) {
        challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function topicReply(topicID, session, emitter) {

	app.listen({
    topic: function (emitter) {
      app.models.topic.info(topicID, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.topic ) {
        if ( !output.topic.private ) {
          app.listen({
            discussionReply: function (emitter) {
              discussionReply(output.topic.discussionID, session.groupID, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( output.discussionReply ) {
                emitter.emit('ready', true);
              } else {
                challenge(session.groupID, emitter);
              }
            } else {
              emitter.emit('error', output.listen);
            }
          });
        } else {
          app.listen({
            userIsInvited: function (emitter) {
              app.models.topic.hasInvitee({
                topicID: topicID,
                userID: session.userID
              }, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( session.talkPrivately && output.userIsInvited ) {
                emitter.emit('ready', true);
              } else {
                emitter.emit('error', {
                  statusCode: 403
                });
              }
            } else {
              emitter.emit('error', output.listen);
            }
          });
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    } else {
      emitter.emit('error', output.listen);
    }

  });

}



function topicTrash(topicID, session, emitter) {

	app.listen('waterfall', {
    topic: function (emitter) {
      if ( session.moderateDiscussions ) {
        app.models.topic.info(topicID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topic ) {
        discussionView(previous.topic.discussionID, session.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the topic exists but the group doesn't have trash access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.topic ) {
        challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function announcementView(topicID, session, emitter) {
  
  app.listen('waterfall', {
    announcement: function (emitter) {
      app.models.announcement.info(topicID, emitter);
    },
    announcementView: function (previous, emitter) {
      if ( previous.announcement ) {
        app.models.announcement.groupView({
          topicID: topicID,
          groupID: session.groupID
        }, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.announcementView ) {
        emitter.emit('ready', true);
      } else {
        challenge(session.groupID, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function announcementReply(topicID, session, emitter) {
  
  app.listen('waterfall', {
    announcement: function (emitter) {
      app.models.announcement.info(topicID, emitter);
    },
    announcementReply: function (previous, emitter) {
      if ( previous.announcement ) {
        app.models.announcement.groupReply({
          topicID: topicID,
          groupID: session.groupID
        }, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.announcementReply ) {
        emitter.emit('ready', true);
      } else {
        challenge(session.groupID, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function topicView(topicID, session, emitter) {

	app.listen('waterfall', {
    topic: function (emitter) {
      app.models.topic.info(topicID, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.topic ) {
        if ( !output.topic.private ) {
          app.listen({
            discussionView: function (emitter) {
              discussionView(output.topic.discussionID, session.groupID, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( output.discussionView ) {
                emitter.emit('ready', true);
              } else {
                challenge(session.groupID, emitter);
              }
            } else {
              emitter.emit('error', output.listen);
            }
          });
        } else {
          app.listen({
            userIsInvited: function (emitter) {
              app.models.topic.hasInvitee({
                topicID: topicID,
                userID: session.userID
              }, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( session.talkPrivately && output.userIsInvited ) {
                emitter.emit('ready', true);
              } else {
                emitter.emit('error', {
                  statusCode: 403
                });
              }
            } else {
              emitter.emit('error', output.listen);
            }
          });
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    } else {
      emitter.emit('error', output.listen);
    }

  });

}



function postView(postID, session, emitter) {

	app.listen('waterfall',{
    post: function (emitter) {
      app.models.post.info(postID, emitter);
    },
    topic: function (previous, emitter) {
      if ( previous.post ) {
        app.models.topic.info(previous.post.topicID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.topic.private ) {
        app.listen({
          userIsInvited: function (emitter) {
            app.models.topic.hasInvitee({
              topicID: output.topic.id,
              userID: session.userID
            }, emitter);
          }
        }, function (output) {
          if ( output.listen.success ) {
            if ( session.talkPrivately && output.userIsInvited ) {
              emitter.emit('ready', true);
            } else {
              emitter.emit('error', {
                statusCode: 403
              });
            }
          } else {
            emitter.emit('error', output.listen);
          }
        });
      } else {
        app.listen({
          discussionView: function (emitter) {
            discussionView(output.topic.discussionID, session.groupID, emitter);
          }
        }, function (output) {
          if ( output.listen.success ) {
            if ( output.discussionView ) {
              emitter.emit('ready', true);
            } else {
              challenge(session.groupID, emitter);
            }
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



function postEdit(postID, session, emitter) {

	app.listen('waterfall', {
    post: function (emitter) {
      app.models.post.info(postID, emitter);
    },
    topic: function (previous, emitter) {
      if ( previous.post ) {
        if ( ( session.username === previous.post.author && !previous.post.lockedByID ) || session.moderateDiscussions ) {
          app.models.topic.info(previous.post.topicID, emitter);
        } else {
          emitter.emit('error', {
            statusCode: 403
          });
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topic ) {
        discussionView(previous.topic.discussionID, session.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the post exists but the group doesn't have edit access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.post ) {
        challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function postLock(postID, session, emitter) {

	app.listen('waterfall', {
    post: function (emitter) {
      app.models.post.info(postID, emitter);
    },
    topic: function (previous, emitter) {
      if ( previous.post ) {
        if ( session.moderateDiscussions ) {
          app.models.topic.info(previous.post.topicID, emitter);
        } else {
          emitter.emit('error', {
            statusCode: 403
          });
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topic ) {
        discussionView(previous.topic.discussionID, session.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the post exists but the group doesn't have lock access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.post ) {
        challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function postTrash(postID, session, emitter) {

	app.listen('waterfall', {
    post: function (emitter) {
      app.models.post.info(postID, emitter);
    },
    topic: function (previous, emitter) {
      if ( previous.post ) {
        if ( session.moderateDiscussions ) {
          app.models.topic.info(previous.post.topicID, emitter);
        } else {
          emitter.emit('error', {
            statusCode: 403
          });
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topic ) {
        discussionView(previous.topic.discussionID, session.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the post exists but the group doesn't have trash access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.post ) {
        challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}
