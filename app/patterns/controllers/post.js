// post controller

'use strict';

var Remarkable = require('remarkable');

module.exports = {
  handler: handler,
  bookmark: bookmark,
  bookmarkForm: bookmarkForm,
  edit: edit,
  editForm: editForm,
  lock: lock,
  lockForm: lockForm,
  unlock: unlock,
  report: report,
  reportForm: reportForm,
  trash: trash,
  trashForm: trashForm
};


// default action
function handler(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postView(params.url.post, params.session.groupID, emitter);
    },
    postInfo: function (previous, emitter) {
      app.models.post.info(params.url.post, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      emitter.emit('ready', {
        content: {
          post: output.postInfo
        },
        handoff: {
          controller: '+_layout'
        }
      });

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function bookmark(params, context, emitter) {

  params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.main.baseUrl + '/bookmarks');
  params.form.notes = '';

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postView(params.url.post, params.session.groupID, emitter);
    },
    postInfo: function (previous, emitter) {
      app.models.post.info(params.url.post, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      emitter.emit('ready', {
        content: {
          post: output.postInfo
        },
        view: 'bookmark',
        include: {
          post: {
            route: '/post/' + params.url.post
          }
        },
        handoff: {
          controller: '+_layout'
        }
      });

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function bookmarkForm(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postView(params.url.post, params.session.groupID, emitter);
    },
    postInfo: function (previous, emitter) {
      app.models.post.info(params.url.post, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      app.listen({
        saveBookmark: function (emitter) {
          app.models.post.saveBookmark({
            userID: params.session.userID,
            postID: output.postInfo.id,
            notes: params.form.notes
          }, emitter);
        }
      }, function (output) {

        if ( output.listen.success ) {

          emitter.emit('ready', {
            redirect: params.form.forwardToUrl
          });

        } else {

          emitter.emit('error', output.listen);

        }

      });

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function edit(params, context, emitter) {

  // Verify the user has edit rights
  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postEdit(params.url.post, params.session, emitter);
    },
    post: function (previous, emitter) {
      app.models.post.info(params.url.post, emitter);
    }
  }, function (output) {

    // If the user has access rights, display the post edit form
    if ( output.listen.success ) {

      params.form.forwardToUrl = params.form.forwardToUrl || params.session.loginReferrer || params.request.headers.referer || app.config.main.baseUrl + '/post/' + params.url.post;
      params.form.content = output.post.markdown;
      params.form.reason = '';

      emitter.emit('ready', {
        content: {
          post: output.post
        },
        view: 'edit',
        handoff: {
          controller: '+_layout'
        }
      });

    } else {

      emitter.emit('error', output.listen);

    }

  });
}



function editForm(params, context, emitter) {

  if ( params.request.method === 'POST' ) {
    // Verify the user's group has reply access to the topic
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.postEdit(params.url.post, params.session, emitter);
      },
      post: function (previous, emitter) {
        app.models.post.info(params.url.post, emitter);
      }
    }, function (output) {
      var post = output.post,
          markdown = new Remarkable({
            breaks: true,
            linkify: true
          }),
          parsedContent,
          parsedReason,
          draft = false,
          time = app.toolbox.helpers.isoDate();

      if ( output.listen.success ) {

        parsedContent = markdown.render(params.form.content);
        parsedReason = markdown.render(params.form.reason);
        // Get rid of the paragraph tags and line break added by Remarkable
        parsedReason = parsedReason.replace(/<p>(.*)<\/p>\n$/, '$1');

        switch ( params.form.formAction ) {
          case 'Preview':
            emitter.emit('ready', {
              content: {
                preview: {
                  content: parsedContent
                },
                post: post
              },
              view: 'edit',
              handoff: {
                controller: '+_layout'
              }
            });
            break;
          case 'Save as draft':
          case 'Save changes':
            if ( params.form.formAction === 'Save as draft' ) {
              draft = true;
            }
            app.listen({
              edit: function (emitter) {
                app.models.post.edit({
                  id: post.id,
                  editorID: params.session.userID,
                  html: parsedContent,
                  markdown: params.form.content,
                  reason: parsedReason,
                  currentPost: post,
                  draft: draft,
                  time: time
                }, emitter);
              }
            }, function (output) {
              var forwardToUrl = draft ? app.config.main.baseUrl + '/drafts' : params.form.forwardToUrl;

              if ( output.listen.success ) {

                if ( output.edit.success ) {
                  emitter.emit('ready', {
                    redirect: forwardToUrl
                  });
                } else {
                  emitter.emit('ready', {
                    content: {
                      edit: output.edit,
                      post: post
                    },
                    view: 'edit',
                    handoff: {
                      controller: '+_layout'
                    }
                  });
                }

              } else {

                emitter.emit('error', output.listen);

              }

            });
            break;
        }

      } else {

        emitter.emit('error', output.listen);

      }

    });

  // If it's a GET, fall back to the default topic edit action
  } else {
    edit(params, context, emitter);
  }
}



function lock(params, context, emitter) {

  params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.main.baseUrl + '/post/' + params.url.post);
  params.form.reason = '';

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postLock(params.url.post, params.session, emitter);
    },
    postInfo: function (previous, emitter) {
      app.models.post.info(params.url.post, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      emitter.emit('ready', {
        content: {
          post: output.postInfo
        },
        view: 'lock',
        include: {
          post: {
            route: '/post/' + params.url.post
          }
        },
        handoff: {
          controller: '+_layout'
        }
      });

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function lockForm(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postLock(params.url.post, params.session, emitter);
    },
    postInfo: function (previous, emitter) {
      app.models.post.info(params.url.post, emitter);
    }
  }, function (output) {
    var post = output.postInfo,
        markdown = new Remarkable({
          breaks: true,
          linkify: true
        }),
        parsedReason;

    if ( output.listen.success ) {

      parsedReason = markdown.render(params.form.reason);
      // Get rid of the paragraph tags and line break added by Remarkable
      parsedReason = parsedReason.replace(/<p>(.*)<\/p>\n$/, '$1');

      app.listen({
        lock: function (emitter) {
          app.models.post.lock({
            postID: post.id,
            topicUrl: post.topicUrl,
            lockedByID: params.session.userID,
            lockReason: parsedReason
          }, emitter);
        }
      }, function (output) {

        if ( output.listen.success ) {

          if ( output.lock.success ) {

            if ( params.form.notify ) {

              app.listen({
                userInfo: function (emitter) {
                  app.models.user.info({
                    user: post.authorUrl
                  }, emitter);
                }
              }, function (output) {
                var mailText = 'The following post has been locked by a moderator: ' + params.route.parsed.protocol + app.config.main.baseUrl + '/post/' + post.id;

                if ( parsedReason.length ) {
                  mailText += '\n\n' + 'Reason: ' + parsedReason;
                }

                app.mail.sendMail({
                  from: app.config.main.email,
                  to: output.userInfo.email,
                  subject: 'Forum post lock notification',
                  text: mailText
                });
              });

            }

            emitter.emit('ready', {
              redirect: params.form.forwardToUrl
            });

          } else {

            emitter.emit('ready', {
              content: {
                post: post,
                lock: output.lock
              },
              view: 'lock',
              include: {
                post: {
                  route: '/post/' + params.url.post
                }
              },
              handoff: {
                controller: '+_layout'
              }
            });

          }

        } else {

          emitter.emit('error', output.listen);

        }

      });

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function unlock(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postLock(params.url.post, params.session, emitter);
    },
    postInfo: function (previous, emitter) {
      app.models.post.info(params.url.post, emitter);
    }
  }, function (output) {
    var post = output.postInfo;

    if ( output.listen.success ) {

      app.listen({
        unlock: function (emitter) {
          app.models.post.unlock({
            postID: post.id,
            topicUrl: post.topicUrl,
          }, emitter);
        }
      }, function (output) {

        if ( output.listen.success ) {

          emitter.emit('ready', {
            redirect: params.request.headers.referer
          });

        } else {

          emitter.emit('error', output.listen);

        }

      });

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function report(params, context, emitter) {

  params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.main.baseUrl + '/post/' + params.url.post);
  params.form.reason = '';

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postView(params.url.post, params.session.groupID, emitter);
    },
    postInfo: function (previous, emitter) {
      app.models.post.info(params.url.post, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      emitter.emit('ready', {
        content: {
          post: output.postInfo
        },
        view: 'report',
        include: {
          post: {
            route: '/post/' + params.url.post
          }
        },
        handoff: {
          controller: '+_layout'
        }
      });

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function reportForm(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postView(params.url.post, params.session.groupID, emitter);
    },
    postInfo: function (previous, emitter) {
      app.models.post.info(params.url.post, emitter);
    }
  }, function (output) {
    var post = output.postInfo,
        markdown = new Remarkable({
          breaks: true,
          linkify: true
        }),
        parsedReason;

    if ( output.listen.success ) {

      parsedReason = markdown.render(params.form.reason);
      // Get rid of the paragraph tags and line break added by Remarkable
      parsedReason = parsedReason.replace(/<p>(.*)<\/p>\n$/, '$1');

      app.listen({
        saveReport: function (emitter) {
          app.models.post.saveReport({
            userID: params.session.userID,
            postID: post.id,
            reason: parsedReason
          }, emitter);
        }
      }, function (output) {

        if ( output.listen.success ) {

          if ( output.saveReport.success ) {

            app.mail.sendMail({
              from: app.config.main.email,
              to: app.config.main.email,
              subject: 'Forum post report',
              text: 'Submitted by: ' + params.session.username + '\n\n' + 'Post: ' + params.route.parsed.protocol + app.config.main.baseUrl + '/post/' + post.id + '\n\n' + 'Reason: ' + params.form.reason
            });

            emitter.emit('ready', {
              redirect: params.form.forwardToUrl
            });

          } else {

            emitter.emit('ready', {
              content: {
                post: post,
                report: output.saveReport
              },
              view: 'report',
              include: {
                post: {
                  route: '/post/' + params.url.post
                }
              },
              handoff: {
                controller: '+_layout'
              }
            });

          }

        } else {

          emitter.emit('error', output.listen);

        }

      });

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function trash(params, context, emitter) {

  params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.main.baseUrl + '/post/' + params.url.post);
  params.form.reason = '';

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postTrash(params.url.post, params.session, emitter);
    },
    postInfo: function (previous, emitter) {
      app.models.post.info(params.url.post, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      emitter.emit('ready', {
        content: {
          post: output.postInfo
        },
        view: 'trash',
        include: {
          post: {
            route: '/post/' + params.url.post
          }
        },
        handoff: {
          controller: '+_layout'
        }
      });

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function trashForm(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postTrash(params.url.post, params.session, emitter);
    },
    postInfo: function (previous, emitter) {
      app.models.post.info(params.url.post, emitter);
    }
  }, function (output) {
    var post = output.postInfo,
        markdown = new Remarkable({
          breaks: true,
          linkify: true
        }),
        parsedReason;

    if ( output.listen.success ) {

      parsedReason = markdown.render(params.form.reason);
      // Get rid of the paragraph tags and line break added by Remarkable
      parsedReason = parsedReason.replace(/<p>(.*)<\/p>\n$/, '$1');

      app.listen({
        trash: function (emitter) {
          app.models.post.trash({
            postID: post.id,
            topicID: post.topicID,
            topicUrl: post.topicUrl,
            discussionID: post.discussionID,
            discussionUrl: post.discussionUrl,
            deletedByID: params.session.userID,
            deleteReason: parsedReason
          }, emitter);
        }
      }, function (output) {

        if ( output.listen.success ) {

          if ( output.trash.success ) {

            if ( params.form.notify ) {

              app.listen({
                userInfo: function (emitter) {
                  app.models.user.info({
                    user: post.authorUrl
                  }, emitter);
                }
              }, function (output) {
                var mailText = 'Your post has been deleted by a moderator.';

                if ( parsedReason.length ) {
                  mailText += '\n\n' + 'Reason: ' + parsedReason;
                }

                mailText += '\n\n' + post.html;

                app.mail.sendMail({
                  from: app.config.main.email,
                  to: output.userInfo.email,
                  subject: 'Your forum post was deleted',
                  text: mailText
                });
              });

            }

            emitter.emit('ready', {
              redirect: params.form.forwardToUrl
            });

          } else {

            emitter.emit('ready', {
              content: {
                post: post,
                trash: output.trash
              },
              view: 'lock',
              include: {
                post: {
                  route: '/post/' + params.url.post
                }
              },
              handoff: {
                controller: '+_layout'
              }
            });

          }

        } else {

          emitter.emit('error', output.listen);

        }

      });

    } else {

      emitter.emit('error', output.listen);

    }

  });

}
