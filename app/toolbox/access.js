// Security checks to verify if users have access to a given controller/action/view

'use strict';

module.exports = {
  challenge: challenge,
  discussionPost: discussionPost,
  discussionReply: discussionReply,
  discussionView: discussionView,
  postEdit: postEdit,
  postLock: postLock,
  postTrash: postTrash,
  postView: postView,
  privateTopicStart: privateTopicStart,
  privateTopicsView: privateTopicsView,
  topicLock: topicLock,
  topicMove: topicMove,
  topicMoveForm: topicMoveForm,
  topicReply: topicReply,
  topicSubscribe: topicSubscribe,
  topicTrash: topicTrash,
  topicView: topicView,
  signInRedirect: signInRedirect,
  userBan: userBan,
  userEdit: userEdit
};



// If they're not logged in, send them to the sign in form. If they are, respond with a 403 Forbidden.
function challenge(args, emitter) {
  var emit = args.emit || 'ready';

  if ( args.user.groupID === 1 ) {
    if ( args.response !== 'boolean' ) {
      emitter.emit(emit, {
        redirect: app.config.comitium.baseUrl + 'sign-in'
      });
    } else {
      emitter.emit('ready', false);
    }
  } else {
    if ( args.response !== 'boolean' ) {
      emitter.emit('error', {
        statusCode: 403
      });
    } else {
      emitter.emit('ready', false);
    }
  }

}



function discussionPost(args, emitter) {

  app.listen('waterfall', {
    discussion: function (emitter) {
      app.models.discussion.info(args.discussionID, emitter);
    },
    discussionPermissions: function (previous, emitter) {
      if ( previous.discussion ) {
        app.models.group.discussionPermissions(args.discussionID, args.user.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.discussionPermissions.post === true ) {
        emitter.emit('ready', true);
      } else {
        challenge(args, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function discussionReply(args, emitter) {

  app.listen('waterfall', {
    discussion: function (emitter) {
      app.models.discussion.info(args.discussionID, emitter);
    },
    discussionPermissions: function (previous, emitter) {
      if ( previous.discussion ) {
        app.models.group.discussionPermissions(args.discussionID, args.user.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.discussionPermissions.reply === true ) {
        emitter.emit('ready', true);
      } else {
        challenge(args, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function discussionView(args, emitter) {

  app.listen('waterfall', {
    discussion: function (emitter) {
      app.models.discussion.info(args.discussionID, emitter);
    },
    discussionPermissions: function (previous, emitter) {
      if ( previous.discussion ) {
        app.models.group.discussionPermissions(args.discussionID, args.user.groupID, emitter);
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
        challenge(args, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function postEdit(args, emitter) {

  app.listen('waterfall', {
    post: function (emitter) {
      app.models.post.info(args.postID, emitter);
    },
    topic: function (previous, emitter) {
      if ( previous.post ) {
        if ( ( args.user.username === previous.post.author && !previous.post.lockedByID ) || args.user.moderateDiscussions ) {
          app.models.topic.info(previous.post.topicID, emitter);
        } else {
          challenge(app.extend(args, { emit: 'end' }), emitter);
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    },
    topicLocked: function (previous, emitter) {
      if ( previous.topic ) {
        if ( !previous.topic.lockedByID || args.user.moderateDiscussions ) {
          emitter.emit('ready', false);
        } else {
          challenge(app.extend(args, { emit: 'end' }), emitter);
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    },
    topicView: function (previous, emitter) {
      topicView(app.extend(args, {
        topicID: previous.topic.id
      }), emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.topicView === true ) {
        emitter.emit('ready', true);
      } else {
        challenge(args, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function postLock(args, emitter) {

  app.listen('waterfall', {
    post: function (emitter) {
      app.models.post.info(args.postID, emitter);
    },
    topicView: function (previous, emitter) {
      if ( previous.post ) {
        if ( args.user.moderateDiscussions ) {
          topicView(app.extend(args, {
            topicID: previous.post.topicID
          }), emitter);
        } else {
          challenge(app.extend(args, { emit: 'end' }), emitter);
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.topicView === true ) {
        emitter.emit('ready', true);
      } else {
        challenge(args, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function postTrash(args, emitter) {

  app.listen('waterfall', {
    post: function (emitter) {
      app.models.post.info(args.postID, emitter);
    },
    topicView: function (previous, emitter) {
      if ( previous.post ) {
        if ( args.user.moderateDiscussions ) {
          topicView(app.extend(args, {
            topicID: previous.post.topicID
          }), emitter);
        } else {
          challenge(app.extend(args, { emit: 'end' }), emitter);
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.topicView === true ) {
        emitter.emit('ready', true);
      } else {
        challenge(args, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function postView(args, emitter) {

  app.listen('waterfall', {
    post: function (emitter) {
      app.models.post.info(args.postID, emitter);
    },
    topicView: function (previous, emitter) {
      if ( previous.post ) {
        topicView(app.extend(args, {
          topicID: previous.post.topicID
        }), emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.topicView === true ) {
        emitter.emit('ready', true);
      } else {
        challenge(args, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function privateTopicStart(args, emitter) {

  app.listen('waterfall', {
    userCanTalkPrivately: function (emitter) {
      if ( args.user.talkPrivately ) {
        emitter.emit('ready', true);
      } else {
        challenge(app.extend(args, { emit: 'end' }), emitter);
      }
    },
    userIsIgnored: function (previous, emitter) {
      var methods = {};

      if ( args.invitees && args.invitees.length ) {
        args.invitees.forEach( function (item, index, array) {
          methods[item] = function (emitter) {
            app.models.user.isIgnored({
              username: args.user.username,
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
      if ( output.userCanTalkPrivately === true && output.userIsIgnored === false ) {
        emitter.emit('ready', true);
      } else {
        if ( output.userCanTalkPrivately.redirect ) {
          emitter.emit('ready', output.userCanTalkPrivately);
        } else {
          switch ( args.user.group ) {
            case 'New Members':
              message = 'New members require a minimum of 5 posts before they can start private topics.';
              break;
            default:
              message = 'Your private topic privileges have been revoked. Please contact an administrator for details.';
              break;
          }
          emitter.emit('error', {
            statusCode: 403,
            message: message
          });
        }
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function privateTopicsView(args, emitter) {

  if ( args.user.talkPrivately ) {
    emitter.emit('ready', true);
  } else {
    challenge(args, emitter);
  }

}



function topicLock(args, emitter) {

	app.listen('waterfall', {
    topicModerate: function (emitter) {
      if ( args.user.moderateDiscussions ) {
        emitter.emit('ready', true);
      } else {
        challenge(app.extend(args, { emit: 'end' }), emitter);
      }
    },
    topicView: function (previous, emitter) {
      topicView(args, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.topicView === true ) {
        emitter.emit('ready', true);
      } else {
        challenge(args, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function topicMove(args, emitter) {

	app.listen({
    topicModerate: function (emitter) {
      if ( args.user.moderateDiscussions ) {
        topicView(args, emitter);
      } else {
        challenge(app.extend(args, { emit: 'end' }), emitter);
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.topicModerate === true) {
        emitter.emit('ready', true);
      } else {
        challenge(args, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function topicMoveForm(args, emitter) {

	app.listen('waterfall', {
    topicModerate: function (emitter) {
      if ( args.user.moderateDiscussions ) {
        topicView(args, emitter);
      } else {
        challenge(app.extend(args, { emit: 'end' }), emitter);
      }
    },
    newDiscussionView: function (previous, emitter) {
      discussionView(app.extend(args, {
        discussionID: args.newDiscussionID
      }), emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.topicModerate === true && output.newDiscussionView === true ) {
        emitter.emit('ready', true);
      } else {
        challenge(args, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function topicReply(args, emitter) {

	app.listen({
    topic: function (emitter) {
      app.models.topic.info(args.topicID, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.topic ) {
        if ( !output.topic.private ) {
          if ( output.topic.discussionID !== 2 ) {
            app.listen({
              topicLocked: function (emitter) {
                if ( !output.topic.lockedByID || args.user.moderateDiscussions ) {
                  emitter.emit('ready', false);
                } else {
                  challenge(app.extend(args, { emit: 'end' }), emitter);
                }
              },
              discussionReply: function (emitter) {
                discussionReply(app.extend(args, {
                  discussionID: output.topic.discussionID
                }), emitter);
              }
            }, function (output) {
              if ( output.listen.success ) {
                if ( output.discussionReply === true ) {
                  emitter.emit('ready', true);
                } else {
                  challenge(args, emitter);
                }
              } else {
                emitter.emit('error', output.listen);
              }
            });
          } else {
            app.listen({
              announcementReply: function (emitter) {
                app.models.topic.announcementReply({
                  topicID: args.topicID,
                  groupID: args.user.groupID
                }, emitter);
              }
            }, function (output) {
              if ( output.listen.success ) {
                if ( output.announcementReply === true ) {
                  emitter.emit('ready', true);
                } else {
                  challenge(args, emitter);
                }
              } else {
                emitter.emit('error', output.listen);
              }
            });
          }
        } else {
          app.listen({
            userIsInvited: function (emitter) {
              app.models.topic.hasInvitee({
                topicID: args.topicID,
                userID: args.user.userID
              }, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( args.user.talkPrivately && output.userIsInvited ) {
                emitter.emit('ready', true);
              } else {
                challenge(args, emitter);
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



function topicSubscribe(args, emitter) {

  app.listen('waterfall', {
    topic: function (emitter) {
      app.models.topic.info(args.topicID, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.topic ) {
        if ( !output.topic.private ) {
          app.listen('waterfall', {
            userIsLoggedIn: function (emitter) {
              if ( args.user.userID ) {
                emitter.emit('ready', true);
              } else {
                challenge(app.extend(args, { emit: 'end' }), emitter);
              }
            },
            topicView: function (previous, emitter) {
              topicView(args, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( output.topicView === true ) {
                emitter.emit('ready', true);
              } else {
                challenge(args, emitter);
              }
            } else {
              emitter.emit('error', output.listen);
            }
          });
        } else {
          app.listen({
            userIsInvited: function (emitter) {
              app.models.topic.hasInvitee({
                topicID: args.topicID,
                userID: args.user.userID
              }, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( args.user.talkPrivately && output.userIsInvited ) {
                emitter.emit('ready', true);
              } else {
                challenge(args, emitter);
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



function topicTrash(args, emitter) {

	app.listen({
    topicModerate: function (emitter) {
      if ( args.user.moderateDiscussions ) {
        topicView(args, emitter);
      } else {
        challenge(app.extend(args, { emit: 'end' }), emitter);
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.topicModerate === true ) {
        emitter.emit('ready', true);
      } else {
        challenge(args, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function topicView(args, emitter) {

	app.listen('waterfall', {
    topic: function (emitter) {
      app.models.topic.info(args.topicID, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.topic ) {
        if ( !output.topic.private ) {
          if ( output.topic.discussionID !== 2 ) {
            app.listen({
              discussionView: function (emitter) {
                discussionView(app.extend(args, {
                  discussionID: output.topic.discussionID
                }), emitter);
              }
            }, function (output) {
              if ( output.listen.success ) {
                if ( output.discussionView === true ) {
                  emitter.emit('ready', true);
                } else {
                  challenge(args, emitter);
                }
              } else {
                emitter.emit('error', output.listen);
              }
            });
          } else {
            app.listen({
              announcementView: function (emitter) {
                app.models.topic.announcementView({
                  topicID: args.topicID,
                  groupID: args.user.groupID
                }, emitter);
              }
            }, function (output) {
              if ( output.listen.success ) {
                if ( output.announcementView === true ) {
                  emitter.emit('ready', true);
                } else {
                  challenge(args, emitter);
                }
              } else {
                emitter.emit('error', output.listen);
              }
            });
          }
        } else {
          app.listen({
            userIsInvited: function (emitter) {
              app.models.topic.hasInvitee({
                topicID: args.topicID,
                userID: args.user.userID
              }, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( args.user.talkPrivately && output.userIsInvited ) {
                emitter.emit('ready', true);
              } else {
                challenge(args, emitter);
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



function signInRedirect(params, url) {

  return params.request.headers.referer && params.request.headers.referer.search('/sign-in') < 0 ? params.request.headers.referer : url;

}



function userBan(args, emitter) {

  app.listen('waterfall', {
    user: function (emitter) {
      app.models.user.info({
        userID: args.userID
      }, emitter);
    },
    banUser: function (previous, emitter) {
      var banTarget = previous.user;

      if ( banTarget ) {
        if ( args.user.moderateUsers ) {
          if ( banTarget.group === 'Administrators' ) {
            emitter.emit('error', {
              statusCode: 403,
              message: 'Administrators can\'t be banned.'
            });
          } else if ( banTarget.group === 'Moderators' && args.user.group !== 'Administrators' ) {
            emitter.emit('error', {
              statusCode: 403,
              message: 'Only an administrator can ban a moderator or lift an existing ban on a moderator.'
            });
          } else {
            emitter.emit('ready', true);
          }
        } else {
          challenge(app.extend(args, { emit: 'end' }), emitter);
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.banUser === true ) {
        emitter.emit('ready', true);
      } else {
        challenge(args, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function userEdit(args, emitter) {

  if ( args.userID === args.user.userID || args.user.moderateUsers ) {
    emitter.emit('ready', true);
  } else {
    emitter.emit('ready', false);
  }

}
