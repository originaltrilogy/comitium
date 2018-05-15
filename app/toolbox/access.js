// Security checks to verify if users have access to a given controller/action/view

'use strict';

module.exports = {
  challenge: challenge,
  contentEdit: contentEdit,
  discussionPost: discussionPost,
  discussionReply: discussionReply,
  discussionView: discussionView,
  postEdit: postEdit,
  postLock: postLock,
  postReport: postReport,
  postTrash: postTrash,
  postView: postView,
  privateTopicStart: privateTopicStart,
  privateTopicsView: privateTopicsView,
  topicEdit: topicEdit,
  topicLock: topicLock,
  topicMove: topicMove,
  topicMoveForm: topicMoveForm,
  topicReply: topicReply,
  topicSubscribe: topicSubscribe,
  topicTrash: topicTrash,
  topicView: topicView,
  signInRedirect: signInRedirect,
  subscriptionsView: subscriptionsView,
  userBan: userBan,
  userEdit: userEdit,
  userIPBan: userIPBan
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



function contentEdit(args, emitter) {
  app.listen('waterfall', {
    content: function (emitter) {
      app.models.content.getContent(args.contentID, emitter)
    },
    contentEdit: function (previous, emitter) {
      if ( previous.content ) {
        if ( args.user.moderateDiscussions ) {
          emitter.emit('ready', true)
        } else {
          challenge(args, emitter)
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        })
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.contentEdit === true ) {
        emitter.emit('ready', true)
      } else {
        challenge(args, emitter)
      }
    } else {
      emitter.emit('error', output.listen)
    }
  })
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



function postReport(args, emitter) {

  app.listen('waterfall', {
    userIsLoggedIn: function (emitter) {
      if ( args.user.userID ) {
        emitter.emit('ready', true);
      } else {
        challenge(app.extend(args, { emit: 'end' }), emitter);
      }
    },
    post: function (previous, emitter) {
      app.models.post.info(args.postID, emitter);
    },
    postView: function (previous, emitter) {
      if ( previous.post ) {
        postView(args, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.postView === true ) {
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
        if ( previous.post.topicReplies > 0 ) {
          if ( args.user.moderateDiscussions ) {
            topicView(app.extend(args, {
              topicID: previous.post.topicID
            }), emitter);
          } else {
            challenge(app.extend(args, { emit: 'end' }), emitter);
          }
        } else {
          emitter.emit('error', {
            statusCode: 403,
            message: 'You can\'t delete the only post in a topic. Delete the entire topic instead.'
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



function topicEdit(args, emitter) {
  app.listen('waterfall', {
    topic: function (emitter) {
      app.models.topic.info(args.topicID, emitter);
    },
    topicView: function (previous, emitter) {
      if ( previous.topic ) {
        topicView(args, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    },
    topicEdit: function (previous, emitter) {
      if ( previous.topicView && ( ( args.user.userID === previous.topic.authorID && !previous.topic.lockedByID ) || args.user.moderateDiscussions ) ) {
        emitter.emit('ready', true);
      } else {
        challenge(app.extend(args, { emit: 'end' }), emitter);
      }
    },
    // Check if the user has posting rights to the topic's current discussion.
    // If a topic has been moved to a discussion that the user doesn't have
    // permission to post in, they lose their editing permissions.
    discussionPost: function (previous, emitter) {
      if ( !previous.topic.private ) {
        discussionPost(app.extend(args, {
          discussionID: previous.topic.discussionID
        }), emitter);
      } else {
        emitter.emit('ready', true);
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.topicEdit === true && output.discussionPost === true ) {
        emitter.emit('ready', true);
      } else {
        challenge(args, emitter);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });
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
            app.listen('waterfall', {
              topicNotLocked: function (emitter) {
                if ( !output.topic.lockedByID || args.user.moderateDiscussions ) {
                  emitter.emit('ready', true);
                } else {
                  challenge(app.extend(args, { emit: 'end' }), emitter);
                }
              },
              discussionReply: function (previous, emitter) {
                discussionReply(app.extend(args, {
                  discussionID: output.topic.discussionID
                }), emitter);
              }
            }, function (output) {
              if ( output.listen.success ) {
                if ( output.topicNotLocked === true && output.discussionReply === true ) {
                  emitter.emit('ready', true);
                } else {
                  challenge(args, emitter);
                }
              } else {
                emitter.emit('error', output.listen);
              }
            });
          } else {
            app.listen('waterfall', {
              topicNotLocked: function (emitter) {
                if ( !output.topic.lockedByID || args.user.moderateDiscussions ) {
                  emitter.emit('ready', true);
                } else {
                  challenge(app.extend(args, { emit: 'end' }), emitter);
                }
              },
              announcementReply: function (previous, emitter) {
                app.models.topic.announcementReply({
                  topicID: args.topicID,
                  groupID: args.user.groupID
                }, emitter);
              }
            }, function (output) {
              if ( output.listen.success ) {
                if ( output.topicNotLocked === true && output.announcementReply === true ) {
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
            invitee: function (emitter) {
              app.models.topic.invitee({
                topicID: args.topicID,
                userID: args.user.userID
              }, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( args.user.talkPrivately && output.invitee && !output.invitee.left ) {
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
            invitee: function (emitter) {
              app.models.topic.invitee({
                topicID: args.topicID,
                userID: args.user.userID
              }, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( args.user.talkPrivately && output.invitee && !output.invitee.left ) {
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



function subscriptionsView(args, emitter) {

  // If the user is logged in, proceed.
  if ( args.user.userID ) {
    emitter.emit('ready', true);
  // Otherwise, challenge.
  } else {
    challenge(args, emitter);
  }

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



function userIPBan(args, emitter) {

  if ( args.user.moderateUsers ) {
    emitter.emit('ready', true);
  } else {
    emitter.emit('ready', false);
  }

}
