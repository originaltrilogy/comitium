// topic controller

'use strict';

var Remarkable = require('remarkable');

module.exports = {
  handler: handler,
  start: start,
  startForm: startForm,
  startPrivate: startPrivate,
  startPrivateForm: startPrivateForm,
  reply: reply,
  replyForm: replyForm,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  lock: lock,
  lockForm: lockForm,
  unlock: unlock,
  // merge: merge,
  // mergeForm: mergeForm,
  move: move,
  moveForm: moveForm,
  trash: trash,
  trashForm: trashForm
};


function handler(params, context, emitter) {
  // Verify the user's group has read access to the topic's parent discussion
  app.listen({
    access: function (emitter) {
      app.toolbox.access.topicView(params.url.id, params.session, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {
      
      if ( !output.access.redirect ) {
        
        params.url.page = params.url.page || 1;

        // If the group has read access, get the posts for the requested page
        app.listen({
          topic: function (emitter) {
            app.models.topic.info(params.url.id, emitter);
          },
          posts: function (emitter) {
            var start = ( params.url.page - 1 ) * 25,
                end = start + 25;
            app.models.topic.posts({
              topicID: params.url.id,
              start: start,
              end: end
            }, emitter);
          },
          subscriptionExists: function (emitter) {
            if ( params.session.userID ) {
              app.models.topic.subscriptionExists({
                userID: params.session.userID,
                topicID: params.url.id
              }, emitter);
            } else {
              emitter.emit('ready', false);
            }
          }
        }, function (output) {
  
          if ( output.listen.success ) {
  
            if ( params.session.username ) {
              app.models.topic.viewTimeUpdate({
                userID: params.session.userID,
                topicID: output.topic.id,
                time: app.toolbox.helpers.isoDate()
              });
            }
  
            emitter.emit('ready', {
              view: output.topic.private ? 'private-topic' : 'topic',
              content: {
                topic: output.topic,
                posts: output.posts,
                userIsSubscribed: output.subscriptionExists,
                pagination: app.toolbox.helpers.paginate('topic/' + output.topic.url + '/id/' + output.topic.id, params.url.page, output.topic.replies + 1),
                breadcrumbs: app.models.topic.breadcrumbs(output.topic.discussionTitle || 'Private Topics', output.topic.discussionUrl || 'private-topics', output.topic.discussionID)
              }
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


function start(params, context, emitter) {

  // Verify the user's group has post access to the discussion
  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.discussionPost(params.url.id, params.session, emitter);
    },
    discussion: function (previous, emitter) {
      app.models.discussion.info(params.url.id, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      params.form.title = '';
      params.form.content = 'We\'ve replaced the old forum script with Markdown, making it easy to add formatting like *italics*, __bold__, and lists:\n\n1. Item one\n2. Item two\n3. Item three\n\nFor more details, tap or click the help button above this form field, or see the [Markdown web site](http://markdown.com).';
      params.form.subscribe = false;

      emitter.emit('ready', {
        content: {
          discussion: output.discussion,
          breadcrumbs: app.models.topic.breadcrumbs(output.discussion.title, output.discussion.url, output.discussion.id)
        },
        view: 'start'
      });

    } else {

      emitter.emit('error', output.listen);

    }

  });
}


function startForm(params, context, emitter) {

  if ( params.request.method === 'POST' ) {
    params.form.subscribe = params.form.subscribe || false;

    // Verify the user's group has post access to the discussion
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.discussionPost(params.url.id, params.session, emitter);
      },
      discussion: function (previous, emitter) {
        app.models.discussion.info(params.url.id, emitter);
      }
    }, function (output) {
      var discussion = output.discussion,
          titleMarkdown = new Remarkable(),
          contentMarkdown = new Remarkable({
            breaks: true,
            linkify: true
          }),
          parsedTitle,
          parsedContent,
          url,
          draft = false,
          time = app.toolbox.helpers.isoDate();

      // If the group has post access, process the topic form
      if ( output.listen.success ) {

        parsedTitle = titleMarkdown.render(params.form.title);
        // Get rid of the paragraph tags and line break added by Remarkable
        parsedTitle = parsedTitle.replace(/<p>(.*)<\/p>\n$/, '$1');

        parsedContent = contentMarkdown.render(params.form.content);

        url = app.toolbox.slug(params.form.title);

        switch ( params.form.formAction ) {
          case 'Preview':
            emitter.emit('ready', {
              content: {
                preview: {
                  title: parsedTitle,
                  content: parsedContent
                },
                discussion: discussion,
                breadcrumbs: app.models.topic.breadcrumbs(discussion.title, discussion.url)
              },
              view: 'start'
            });
            break;
          case 'Save as draft':
          case 'Post your topic':
            if ( params.form.formAction === 'Save as draft' ) {
              draft = true;
            }
            app.listen({
              saveTopic: function (emitter) {
                app.models.topic.insert({
                  discussionID: discussion.id,
                  userID: params.session.userID,
                  titleMarkdown: params.form.title,
                  titleHtml: parsedTitle,
                  url: url,
                  markdown: params.form.content,
                  html: parsedContent,
                  draft: draft,
                  private: false,
                  time: time
                }, emitter);
              }
            }, function (output) {
              var topic = output.saveTopic;

              if ( output.listen.success && output.saveTopic.success ) {
                if ( params.form.subscribe ) {
                  app.listen({
                    subscribe: function (emitter) {
                      app.models.topic.subscribe({
                        userID: params.session.userID,
                        topicID: topic.id,
                        time: time
                      }, emitter);
                    }
                  }, function (output) {

                    if ( output.listen.success ) {
                      emitter.emit('ready', {
                        redirect: draft ? app.config.main.baseUrl + 'drafts' : app.config.main.baseUrl + 'topic/' + url + '/id/' + topic.id
                      });
                    } else {
                      emitter.emit('error', output.listen);
                    }

                  });
                } else {
                  emitter.emit('ready', {
                    redirect: draft ? app.config.main.baseUrl + 'drafts' : app.config.main.baseUrl + 'topic/' + url + '/id/' + topic.id
                  });
                }
              } else {

                if ( !output.listen.success ) {
                  emitter.emit('error', output.listen);
                } else {
                  emitter.emit('ready', {
                    content: {
                      topic: output.saveTopic,
                      discussion: discussion,
                      breadcrumbs: app.models.topic.breadcrumbs(discussion.title, discussion.url, discussion.id)
                    },
                    view: 'start'
                  });
                }

              }
            });
            break;
        }

      } else {

        emitter.emit('error', output.listen);

      }

    });
  // If it's a GET, fall back to the default topic start action
  } else {
    start(params, context, emitter);
  }
}


function startPrivate(params, context, emitter) {

  // Verify the user can start a private topic with the invitee(s)
  app.listen('waterfall', {
    invitees: function (emitter) {
      if ( params.url.invitee ) {
        app.listen({
          invitees: function (emitter) {
            app.models.user.info({
              user: params.url.invitee
            }, emitter);
          }
        }, function (output) {
          if ( output.listen.success ) {
            emitter.emit('ready', [ output.invitees.username ]);
          } else {
            emitter.emit('error', output.listen);
          }
        });
      } else if ( params.form.invitees ) {
        emitter.emit('ready', params.form.invitees.split('\n'));
      } else {
        emitter.emit('ready');
      }
    },
    access: function (previous, emitter) {
      app.toolbox.access.privateTopicStart({
        userID: params.session.userID,
        username: params.session.username,
        invitees: previous.invitees
      }, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      params.form.invitees = output.invitees ? output.invitees.join('\n') : '';
      params.form.title = '';
      params.form.content = 'We\'ve replaced the old forum script with Markdown, making it easy to add formatting like *italics*, __bold__, and lists:\n\n1. Item one\n2. Item two\n3. Item three\n\nFor more details, tap or click the help button above this form field, or see the [Markdown web site](http://markdown.com).';

      emitter.emit('ready', {
        content: {
          invitees: output.invitees
        },
        view: 'start-private'
      });

    } else {

      emitter.emit('error', output.listen);

    }

  });
}


function startPrivateForm(params, context, emitter) {
  var inviteesArray;

  if ( params.request.method === 'POST' ) {
    inviteesArray = params.form.invitees.split('\r\n');
    params.form.subscribe = params.form.subscribe || false;

    // Verify the user can start a private topic with the invitees
    app.listen({
      access: function (emitter) {
        app.toolbox.access.privateTopicStart({
          userID: params.session.userID,
          username: params.session.username,
          invitees: inviteesArray
        }, emitter);
      }
    }, function (output) {
      var titleMarkdown = new Remarkable(),
          contentMarkdown = new Remarkable({
            breaks: true,
            linkify: true
          }),
          parsedTitle,
          parsedContent,
          url,
          draft = false,
          time = app.toolbox.helpers.isoDate();

      // If the user has permission, process the topic form
      if ( output.listen.success ) {

        parsedTitle = titleMarkdown.render(params.form.title);
        // Get rid of the paragraph tags and line break added by Remarkable
        parsedTitle = parsedTitle.replace(/<p>(.*)<\/p>\n$/, '$1');

        parsedContent = contentMarkdown.render(params.form.content);

        url = app.toolbox.slug(params.form.title);

        switch ( params.form.formAction ) {
          case 'Preview':
            emitter.emit('ready', {
              content: {
                preview: {
                  title: parsedTitle,
                  content: parsedContent
                }
              },
              view: 'start-private'
            });
            break;
          case 'Save as draft':
          case 'Post your topic':
            if ( params.form.formAction === 'Save as draft' ) {
              draft = true;
            }
            app.listen({
              saveTopic: function (emitter) {
                app.models.topic.insert({
                  userID: params.session.userID,
                  username: params.session.username,
                  invitees: inviteesArray,
                  discussionID: 0,
                  titleMarkdown: params.form.title,
                  titleHtml: parsedTitle,
                  url: url,
                  markdown: params.form.content,
                  html: parsedContent,
                  draft: draft,
                  private: true,
                  time: time
                }, emitter);
              }
            }, function (output) {
              var topic = output.saveTopic,
                  methods = {};

              if ( output.listen.success && output.saveTopic.success ) {

                if ( !draft ) {
                  inviteesArray.forEach( function (item, index, array) {
                    methods[item] = function (emitter) {
                      app.models.user.info({
                        username: item
                      }, emitter);
                    };
                  });

                  app.listen(methods, function (output) {
                    if ( output.listen.success ) {
                      delete output.listen;
                      for ( var invitee in output ) {
                        if ( invitee.pmEmailNotification ) {
                          app.mail.sendMail({
                            from: app.config.main.email,
                            to: invitee.email,
                            subject: 'New private topic started by ' + params.session.username,
                            text: app.config.main.baseUrl + '/topic/id/' + topic.id
                          });
                        }
                      }
                    } else {
                      emitter.emit('error', output.listen);
                    }
                  });
                }

                if ( params.form.subscribe ) {
                  app.listen({
                    subscribe: function (emitter) {
                      app.models.topic.subscribe({
                        userID: params.session.userID,
                        topicID: topic.id,
                        time: time
                      }, emitter);
                    }
                  }, function (output) {

                    if ( output.listen.success ) {
                      emitter.emit('ready', {
                        redirect: draft ? app.config.main.baseUrl + 'drafts' : app.config.main.baseUrl + 'topic/id/' + topic.id
                      });
                    } else {
                      emitter.emit('error', output.listen);
                    }

                  });
                } else {
                  emitter.emit('ready', {
                    redirect: draft ? app.config.main.baseUrl + 'drafts' : app.config.main.baseUrl + 'topic/id/' + topic.id
                  });
                }
              } else {

                if ( !output.listen.success ) {
                  emitter.emit('error', output.listen);
                } else {
                  emitter.emit('ready', {
                    content: {
                      topic: topic
                    },
                    view: 'start-private'
                  });
                }

              }
            });
            break;
        }

      } else {

        emitter.emit('error', output.listen);

      }

    });
  // If it's a GET, fall back to the default topic start action
  } else {
    start(params, context, emitter);
  }
}


function reply(params, context, emitter) {

  // Verify the user's group has reply access to the topic
  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicReply(params.url.id, params.session, emitter);
    },
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    },
    quote: function (previous, emitter) {
      if ( params.url.quote && app.isNumeric(params.url.quote) ) {
        app.models.post.info(params.url.quote, emitter);
      } else {
        emitter.emit('ready');
      }
    }
  }, function (output) {
    var message = '';

    // If the group has reply access, display the topic reply form
    if ( output.listen.success ) {

      params.form.content = '';
      params.form.subscribe = false;

      // If the quoted post exists and its topic ID matches this topic ID, add the
      // quote to the post content (this is a security measure, don't remove it).
      if ( output.quote && output.quote.topicID === output.topic.id && output.quote.markdown ) {
        params.form.content = '[' + output.quote.author + ' said](post/' + output.quote.id + '):\n> ' + output.quote.markdown.replace(/\n/g, '\n> ') + '\n\n';
      } else if ( params.url.quote && !output.quote ) {
        message = 'We couldn\'t find the post you\'d like to quote. It may have been deleted.';
      }

      emitter.emit('ready', {
        content: {
          topic: output.topic,
          breadcrumbs: app.models.topic.breadcrumbs(output.topic.discussionTitle, output.topic.discussionUrl, output.topic.discussionID),
          reply: {
            message: message
          }
        },
        view: 'reply'
      });

    } else {

      emitter.emit('error', output.listen);

    }

  });
}


function replyForm(params, context, emitter) {

  if ( params.request.method === 'POST' ) {
    params.form.subscribe = params.form.subscribe || false;

    // Verify the user's group has reply access to the topic
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.topicReply(params.url.id, params.session, emitter);
      },
      topic: function (previous, emitter) {
        app.models.topic.info(params.url.id, emitter);
      }
    }, function (output) {
      var topic = output.topic,
          contentMarkdown = new Remarkable({
            breaks: true,
            linkify: true
          }),
          parsedContent,
          draft = false,
          time = app.toolbox.helpers.isoDate();

      // If the group has reply access, process the form
      if ( output.listen.success ) {

        parsedContent = contentMarkdown.render(params.form.content);

        switch ( params.form.formAction ) {
          case 'Preview':
            emitter.emit('ready', {
              content: {
                preview: {
                  content: parsedContent
                },
                topic: topic,
                breadcrumbs: app.models.topic.breadcrumbs(topic.discussionTitle, topic.discussionUrl, topic.discussionID)
              },
              view: 'reply'
            });
            break;
          case 'Save as draft':
          case 'Post your reply':
            if ( params.form.formAction === 'Save as draft' ) {
              draft = true;
            }
            app.listen({
              reply: function (emitter) {
                app.models.topic.reply({
                  topicID: topic.id,
                  discussionID: topic.discussionID,
                  userID: params.session.userID,
                  html: parsedContent,
                  markdown: params.form.content,
                  draft: draft,
                  private: topic.private,
                  time: time
                }, emitter);
              }
            }, function (output) {
              var page = Math.ceil( ( topic.replies + 2 ) / 25 ),
                  pageParameter = page !== 1 ? '/page/' + page : '',
                  replyUrl = app.config.main.baseUrl + params.route.controller + '/' + topic.url + '/id/' + topic.id + pageParameter + '/#' + output.reply.id,
                  forwardToUrl = draft ? app.config.main.baseUrl + '/drafts' : replyUrl;

              if ( output.listen.success ) {

                if ( output.reply.success ) {
                  if ( params.form.subscribe ) {
                    app.listen({
                      subscribe: function (emitter) {
                        app.models.topic.subscribe({
                          userID: params.session.userID,
                          topicID: topic.id,
                          time: time
                        }, emitter);
                      }
                    }, function (output) {

                      if ( output.listen.success ) {

                        emitter.emit('ready', {
                          content: output.reply,
                          redirect: forwardToUrl
                        });

                      } else {

                        emitter.emit('error', output.listen);

                      }

                    });
                  } else {
                    emitter.emit('ready', {
                      content: output.reply,
                      redirect: forwardToUrl
                    });
                  }

                  // If it's not a draft post, notify the topic subscribers
                  if ( !draft ) {
                    notifySubscribers({
                      replyAuthorID: params.session.userID,
                      topicID: topic.id,
                      time: time,
                      url: replyUrl
                    });
                  }
                } else {
                  emitter.emit('ready', {
                    content: {
                      reply: output.reply,
                      topic: topic,
                      breadcrumbs: app.models.topic.breadcrumbs(topic.discussionTitle, topic.discussionUrl, topic.discussionID)
                    },
                    view: 'reply'
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

  // If it's a GET, fall back to the default topic reply action
  } else {
    reply(params, context, emitter);
  }
}


function notifySubscribers(args, emitter) {

  app.listen({
    subscribersToNotify: function (emitter) {
      app.models.topic.subscribersToNotify({
        topicID: args.topicID,
        replyAuthorID: args.replyAuthorID
      }, emitter);
    }
  }, function (output) {
    if ( output.listen.success && output.subscribersToNotify.length ) {
      for ( var i = 0; i < output.subscribersToNotify.length; i++ ) {
        app.mail.sendMail({
          from: app.config.main.email,
          to: output.subscribersToNotify[i].email,
          subject: 'Forum topic update',
          text: args.url
        });
      }
      app.models.topic.subscriptionNotificationSentUpdate({
        topicID: args.topicID,
        time: args.time
      });
    } else if ( !output.listen.success && emitter ) {
      emitter.emit('error', output.listen);
    }
  });

}


function subscribe(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicView(params.url.id, params.session, emitter);
    },
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    },
    subscribe: function (previous, emitter) {
      app.models.topic.subscribe({
        userID: params.session.userID,
        topicID: previous.topic.id,
        time: app.toolbox.helpers.isoDate()
      }, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {
      emitter.emit('ready', {
        redirect: app.toolbox.access.signInRedirect(params, app.config.main.baseUrl + '/' + params.route.controller + '/' + output.topic.url + '/id/' + output.topic.id)
      });
    } else {
      emitter.emit('error', output.listen);
    }

  });

}


function unsubscribe(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicView(params.url.id, params.session, emitter);
    },
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    },
    unsubscribe: function (previous, emitter) {
      app.models.topic.unsubscribe({
        userID: params.session.userID,
        topicID: previous.topic.id
      }, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {
      emitter.emit('ready', {
        redirect: app.toolbox.access.signInRedirect(params, app.config.main.baseUrl + '/' + params.route.controller + '/' + output.topic.url + '/id/' + output.topic.id)
      });
    } else {
      emitter.emit('error', output.listen);
    }

  });

}



function lock(params, context, emitter) {

  params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.main.baseUrl + '/' + params.route.controller + '/' + params.url.id);
  params.form.reason = '';

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicLock(params.url.id, params.session, emitter);
    },
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      emitter.emit('ready', {
        content: {
          topic: output.topic
        },
        view: 'lock'
      });

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function lockForm(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicLock(params.url.id, params.session, emitter);
    },
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    }
  }, function (output) {
    var topic = output.topic,
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
          app.models.topic.lock({
            topicID: topic.id,
            lockedByID: params.session.userID,
            lockReason: parsedReason
          }, emitter);
        }
      }, function (output) {

        if ( output.listen.success ) {

          if ( output.lock.success ) {

            if ( params.form.notify ) {

              // notify subscribers (if the author isn't subscribed, they probably don't care)

            }

            emitter.emit('ready', {
              redirect: params.form.forwardToUrl
            });

          } else {

            emitter.emit('ready', {
              content: {
                topic: topic,
                lock: output.lock
              },
              view: 'lock'
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
      app.toolbox.access.topicLock(params.url.id, params.session, emitter);
    },
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    }
  }, function (output) {
    var topic = output.topic;

    if ( output.listen.success ) {

      app.listen({
        unlock: function (emitter) {
          app.models.topic.unlock({
            topicID: topic.id
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



function move(params, context, emitter) {

  params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.main.baseUrl + '/' + params.route.controller + '/' + params.url[params.route.controller] + '/id/' + params.url.id);

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicMove(params.url.id, params.session, emitter);
    },
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    },
    categories: function (previous, emitter) {
      app.models.discussions.categories(params.session.groupID, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      emitter.emit('ready', {
        content: {
          topic: output.topic,
          categories: output.categories
        },
        view: 'move'
      });

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function moveForm(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicMoveForm(params.url.id, params.form.destination, params.session, emitter);
    },
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    }
  }, function (output) {
    var topic = output.topic;

    if ( output.listen.success ) {

      app.listen('waterfall', {
        newdiscussion: function (emitter) {
          app.models.discussion.info(params.form.destination, emitter);
        },
        move: function (previous, emitter) {
          app.models.topic.move({
            topicID: topic.id,
            topicUrl: topic.url,
            discussionID: topic.discussionID,
            discussionUrl: topic.discussionUrl,
            newDiscussionID: previous.newdiscussion.id,
            newDiscussionUrl: params.form.destination
          }, emitter);
        }
      }, function (output) {

        if ( output.listen.success ) {

          if ( output.move.success ) {

            if ( params.form.notify ) {

              // notify subscribers (if the author isn't subscribed, they probably don't care)

            }

            emitter.emit('ready', {
              redirect: params.form.forwardToUrl
            });

          } else {

            emitter.emit('ready', {
              content: {
                topic: topic,
                move: output.move
              },
              view: 'move'
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

  params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.main.baseUrl + '/' + params.route.controller + '/' + params.url[params.route.controller] + '/id/' + params.url.id);

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicTrash(params.url.id, params.session, emitter);
    },
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      emitter.emit('ready', {
        content: {
          topic: output.topic
        },
        view: 'trash'
      });

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function trashForm(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicTrash(params.url.id, params.session, emitter);
    },
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    }
  }, function (output) {
    var topic = output.topic;

    if ( output.listen.success ) {

      app.listen({
        trash: function (emitter) {
          app.models.topic.move({
            topicID: topic.id,
            topicUrl: topic.url,
            discussionID: topic.discussionID,
            newDiscussionID: 1,
            newDiscussionUrl: 'Trash'
          }, emitter);
        }
      }, function (output) {

        if ( output.listen.success ) {

          if ( output.trash.success ) {

            if ( params.form.notify ) {

              // notify subscribers (if the author isn't subscribed, they probably don't care)

            }

            emitter.emit('ready', {
              redirect: params.form.forwardToUrl
            });

          } else {

            emitter.emit('ready', {
              content: {
                topic: topic,
                trash: output.trash
              },
              view: 'trash'
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
