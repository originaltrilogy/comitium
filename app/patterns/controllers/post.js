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
      app.toolbox.access.postView({
        postID: params.url.id,
        user: params.session
      }, emitter);
    },
    proceed: function (previous, emitter) {
      if ( previous.access === true ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('end', false);
      }
    },
    post: function (previous, emitter) {
      app.models.post.info(params.url.id, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        output.post.topicLink = output.post.discussionID !== 2 ? 'topic' : 'announcement';
        output.post.topicLink += '/' + output.post.topicUrl + '/id/' + output.post.topicID;

        emitter.emit('ready', {
          content: {
            post: output.post
          }
        });
      } else {
        emitter.emit('ready', output.access);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function bookmark(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postView({
        postID: params.url.id,
        user: params.session
      }, emitter);
    },
    proceed: function (previous, emitter) {
      if ( previous.access === true ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('end', false);
      }
    },
    post: function (previous, emitter) {
      app.models.post.info(params.url.id, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + 'bookmarks');
        params.form.notes = '';

        emitter.emit('ready', {
          view: 'bookmark',
          content: {
            post: output.post
          },
          include: {
            post: {
              route: '/post/id/' + output.post.id
            }
          }
        });
      } else {
        emitter.emit('ready', output.access);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function bookmarkForm(params, context, emitter) {

  if ( params.request.method === 'POST' ) {
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.postView({
          postID: params.url.id,
          user: params.session
        }, emitter);
      },
      proceed: function (previous, emitter) {
        if ( previous.access === true ) {
          emitter.emit('ready', true);
        } else {
          emitter.emit('end', false);
        }
      },
      post: function (previous, emitter) {
        app.models.post.info(params.url.id, emitter);
      }
    }, function (output) {
      if ( output.listen.success ) {
        if ( output.access === true ) {
          app.listen({
            saveBookmark: function (emitter) {
              app.models.post.saveBookmark({
                userID: params.session.userID,
                postID: output.post.id,
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
          emitter.emit('ready', output.access);
        }
      } else {
        emitter.emit('error', output.listen);
      }
    });
  } else {
    bookmark(params, context, emitter);
  }

}



function edit(params, context, emitter) {

  // Verify the user has edit rights
  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postEdit({
        postID: params.url.id,
        user: params.session
      }, emitter);
    },
    proceed: function (previous, emitter) {
      if ( previous.access === true ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('end', false);
      }
    },
    post: function (previous, emitter) {
      app.models.post.info(params.url.id, emitter);
    }
  }, function (output) {
    // If the user has access rights, display the post edit form
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + '/post/' + output.post.id);
        params.form.content = output.post.markdown;
        params.form.reason = '';

        emitter.emit('ready', {
          view: 'edit',
          content: {
            post: output.post
          }
        });
      } else {
        emitter.emit('ready', output.access);
      }
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
        app.toolbox.access.postEdit({
          postID: params.url.id,
          user: params.session
        }, emitter);
      },
      proceed: function (previous, emitter) {
        if ( previous.access === true ) {
          emitter.emit('ready', true);
        } else {
          emitter.emit('end', false);
        }
      },
      post: function (previous, emitter) {
        app.models.post.info(params.url.id, emitter);
      }
    }, function (output) {
      var post = output.post,
          markdown = new Remarkable({
            breaks: true,
            linkify: true,
            typographer: true
          }),
          parsedContent,
          parsedReason,
          draft = false,
          time = app.toolbox.helpers.isoDate();

      if ( output.listen.success ) {
        if ( output.access === true ) {
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
                view: 'edit'
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
                var forwardToUrl = draft ? app.config.comitium.baseUrl + '/drafts' : params.form.forwardToUrl;

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
                      view: 'edit'
                    });
                  }
                } else {
                  emitter.emit('error', output.listen);
                }
              });
              break;
          }
        } else {
          emitter.emit('ready', output.access);
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

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postLock({
        postID: params.url.id,
        user: params.session
      }, emitter);
    },
    proceed: function (previous, emitter) {
      if ( previous.access === true ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('end', false);
      }
    },
    post: function (previous, emitter) {
      app.models.post.info(params.url.id, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + '/post/id/' + output.post.id);
        params.form.reason = '';

        emitter.emit('ready', {
          view: 'lock',
          content: {
            post: output.post
          },
          include: {
            post: {
              route: '/post/id/' + output.post.id
            }
          }
        });
      } else {
        emitter.emit('ready', output.access);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function lockForm(params, context, emitter) {

  if ( params.request.method === 'POST' ) {
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.postLock({
          postID: params.url.id,
          user: params.session
        }, emitter);
      },
      proceed: function (previous, emitter) {
        if ( previous.access === true ) {
          emitter.emit('ready', true);
        } else {
          emitter.emit('end', false);
        }
      },
      post: function (previous, emitter) {
        app.models.post.info(params.url.id, emitter);
      }
    }, function (output) {
      var post = output.post,
          markdown = new Remarkable({
            breaks: true,
            linkify: true,
            typographer: true
          }),
          parsedReason;

      if ( output.listen.success ) {
        if ( output.access === true ) {
          parsedReason = markdown.render(params.form.reason);
          // Get rid of the paragraph tags and line break added by Remarkable
          parsedReason = parsedReason.replace(/<p>(.*)<\/p>\n$/, '$1');

          app.listen({
            lock: function (emitter) {
              app.models.post.lock({
                postID: post.id,
                topicID: post.topicID,
                lockedByID: params.session.userID,
                lockReason: parsedReason
              }, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( output.lock.success ) {
                if ( params.form.notify ) {
                  app.listen({
                    user: function (emitter) {
                      app.models.user.info({
                        user: post.authorUrl
                      }, emitter);
                    }
                  }, function (output) {
                    var mailText = 'The following post has been locked by a moderator: ' + params.route.parsed.protocol + app.config.comitium.baseUrl + '/post/id/' + post.id;

                    if ( parsedReason.length ) {
                      mailText += '\n\n' + 'Reason: ' + parsedReason;
                    }

                    app.mail.sendMail({
                      from: app.config.comitium.email,
                      to: output.user.email,
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
                  view: 'lock',
                  content: {
                    post: post,
                    lock: output.lock
                  },
                  include: {
                    post: {
                      route: '/post/id/' + output.post.id
                    }
                  }
                });
              }
            } else {
              emitter.emit('error', output.listen);
            }
          });
        } else {
          emitter.emit('ready', output.access);
        }
      } else {
        emitter.emit('error', output.listen);
      }
    });
  } else {
    lock(params, context, emitter);
  }

}



function unlock(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postLock({
        postID: params.url.id,
        user: params.session
      }, emitter);
    },
    proceed: function (previous, emitter) {
      if ( previous.access === true ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('end', false);
      }
    },
    post: function (previous, emitter) {
      app.models.post.info(params.url.id, emitter);
    }
  }, function (output) {
    var post = output.post;

    if ( output.listen.success ) {
      if ( output.access === true ) {
        app.listen({
          unlock: function (emitter) {
            app.models.post.unlock({
              postID: post.id,
              topicID: post.topicID,
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
        emitter.emit('ready', output.access);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function report(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postView({
        postID: params.url.id,
        user: params.session
      }, emitter);
    },
    proceed: function (previous, emitter) {
      if ( previous.access === true ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('end', false);
      }
    },
    post: function (previous, emitter) {
      app.models.post.info(params.url.id, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + '/post/id/' + output.post.id);
        params.form.reason = '';

        emitter.emit('ready', {
          view: 'report',
          content: {
            post: output.post
          },
          include: {
            post: {
              route: '/post/id/' + output.post.id
            }
          }
        });
      } else {
        emitter.emit('ready', output.access);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function reportForm(params, context, emitter) {

  if ( params.request.method === 'POST' ) {
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.postView({
          postID: params.url.id,
          user: params.session
        }, emitter);
      },
      proceed: function (previous, emitter) {
        if ( previous.access === true ) {
          emitter.emit('ready', true);
        } else {
          emitter.emit('end', false);
        }
      },
      post: function (previous, emitter) {
        app.models.post.info(params.url.id, emitter);
      }
    }, function (output) {
      var post = output.post,
          markdown = new Remarkable({
            breaks: true,
            linkify: true,
            typographer: true
          }),
          parsedReason;

      if ( output.listen.success ) {
        if ( output.access === true ) {
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
                  from: app.config.comitium.email,
                  to: app.config.comitium.email,
                  subject: 'Forum post report',
                  text: 'Submitted by: ' + params.session.username + '\n\n' + 'Post: ' + params.route.parsed.protocol + app.config.comitium.baseUrl + '/post/id/' + post.id + '\n\n' + 'Reason: ' + params.form.reason
                });
                emitter.emit('ready', {
                  redirect: params.form.forwardToUrl
                });
              } else {
                emitter.emit('ready', {
                  view: 'report',
                  content: {
                    post: post,
                    report: output.saveReport
                  },
                  include: {
                    post: {
                      route: '/post/id/' + post.id
                    }
                  }
                });
              }
            } else {
              emitter.emit('error', output.listen);
            }
          });
        } else {
          emitter.emit('ready', output.access);
        }
      } else {
        emitter.emit('error', output.listen);
      }
    });
  } else {
    report(params, context, emitter);
  }

}



function trash(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postTrash({
        postID: params.url.id,
        user: params.session
      }, emitter);
    },
    proceed: function (previous, emitter) {
      if ( previous.access === true ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('end', false);
      }
    },
    post: function (previous, emitter) {
      app.models.post.info(params.url.id, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + '/post/id/' + output.post.id);
        params.form.reason = '';

        emitter.emit('ready', {
          view: 'trash',
          content: {
            post: output.post
          },
          include: {
            post: {
              route: '/post/id/' + output.post.id
            }
          }
        });
      } else {
        emitter.emit('ready', output.access);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function trashForm(params, context, emitter) {

  if ( params.request.method === 'POST' ) {
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.postTrash({
          postID: params.url.id,
          user: params.session
        }, emitter);
      },
      proceed: function (previous, emitter) {
        if ( previous.access === true ) {
          emitter.emit('ready', true);
        } else {
          emitter.emit('end', false);
        }
      },
      post: function (previous, emitter) {
        app.models.post.info(params.url.id, emitter);
      }
    }, function (output) {
      var post = output.post,
          markdown = new Remarkable({
            breaks: true,
            linkify: true,
            typographer: true
          }),
          parsedReason;

      if ( output.listen.success ) {
        if ( output.access === true ) {
          parsedReason = markdown.render(params.form.reason);
          // Get rid of the paragraph tags and line break added by Remarkable
          parsedReason = parsedReason.replace(/<p>(.*)<\/p>\n$/, '$1');

          app.listen({
            trash: function (emitter) {
              app.models.post.trash({
                postID: post.id,
                topicID: post.topicID,
                discussionID: post.discussionID,
                deletedByID: params.session.userID,
                deleteReason: parsedReason
              }, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( output.trash.success ) {
                if ( params.form.notify ) {
                  app.listen({
                    user: function (emitter) {
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
                      from: app.config.comitium.email,
                      to: output.user.email,
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
                  view: 'trash',
                  content: {
                    post: post,
                    trash: output.trash
                  },
                  include: {
                    post: {
                      route: '/post/id/' + post.id
                    }
                  }
                });
              }
            } else {
              emitter.emit('error', output.listen);
            }
          });
        } else {
          emitter.emit('ready', output.access);
        }
      } else {
        emitter.emit('error', output.listen);
      }
    });
  } else {
    trash(params, context, emitter);
  }

}
