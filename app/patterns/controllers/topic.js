// topic controller

'use strict';

module.exports = {
  handler: handler,
  head: head,
  notifySubscribers: notifySubscribers,
  start: start,
  startForm: startForm,
  startAnnouncement: startAnnouncement,
  startAnnouncementForm: startAnnouncementForm,
  startPrivate: startPrivate,
  startPrivateForm: startPrivateForm,
  reply: reply,
  replyForm: replyForm,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  lock: lock,
  lockForm: lockForm,
  unlock: unlock,
  edit: edit,
  editForm: editForm,
  // merge: merge,
  // mergeForm: mergeForm,
  move: move,
  moveForm: moveForm,
  trash: trash,
  trashForm: trashForm
};



function handler(params, context, emitter) {
  // Verify the user's group has read access to the topic's parent discussion
  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicView({
        topicID: params.url.id,
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
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    },
    // Gets the first unread post for both public users and authenticated
    // users based on the presence of params.session.userID
    firstUnreadPost: function (previous, emitter) {
      // Don't check for unread posts if a specific page is requested.
      if ( !params.url.page ) {
        app.models.topic.firstUnreadPost({
          topicID: previous.topic.id,
          userID: params.session.userID,
          viewTime: params.session.lastActivity
        }, emitter);
      } else {
        emitter.emit('ready', false);
      }
    }
  }, function (output) {
    var topic = output.topic,
        page, type, url;

    if ( output.listen.success ) {
      if ( output.access === true ) {
        switch ( topic.discussionID ) {
          case 0:
            type = 'private-topic';
            break;
          case 2:
            type = 'announcement';
            break;
          default:
            type = 'topic';
            break;
        }
        page = parseInt(params.url.page, 10) || 1;
        url = topic.private ? 'topic' : type + '/' + topic.url;

        // If there are unread posts, the first unread post isn't the first post in the topic,
        // and a specific page hasn't been requested, redirect the user to the first unread post.
        if ( output.firstUnreadPost && output.firstUnreadPost.post.id !== topic.firstPostID ) {
          emitter.emit('ready', {
            redirect: app.config.comitium.baseUrl + url + '/id/' + topic.id + '/page/' + output.firstUnreadPost.page + '#' + output.firstUnreadPost.post.id
          });
        } else {
          // If the user has read access, get the posts for the requested page
          app.listen({
            posts: function (emitter) {
              var start = ( page - 1 ) * 25,
                  end = start + 25;

              app.models.topic.posts({
                topicID: topic.id,
                start: start,
                end: end
              }, emitter);
            },
            invitees: function (emitter) {
              if ( topic.private ) {
                app.models.topic.invitees({
                  topicID: topic.id
                }, emitter);
              } else {
                emitter.emit('ready', false);
              }
            },
            subscriptionExists: function (emitter) {
              if ( params.session.userID ) {
                app.models.topic.subscriptionExists({
                  userID: params.session.userID,
                  topicID: topic.id
                }, emitter);
              } else {
                emitter.emit('ready', false);
              }
            },
            userCanReply: function (emitter) {
              app.toolbox.access.topicReply({
                topicID: topic.id,
                user: params.session,
                response: 'boolean'
              }, emitter);
            }
          }, function (output) {
            var firstPost = [];

            if ( output.listen.success ) {
              if ( params.session.userID ) {
                app.models.topic.viewTimeUpdate({
                  userID: params.session.userID,
                  topic: topic,
                  time: app.toolbox.helpers.isoDate()
                });
              }

              topic.createdFormatted = app.toolbox.moment.tz(topic.created, 'America/New_York').format('D-MMM-YYYY');
              topic.repliesFormatted = app.toolbox.numeral(topic.replies).format('0,0');

              if ( page === 1 ) {
                firstPost[0] = output.posts.shift();
              }

              emitter.emit('ready', {
                view: type,
                content: {
                  topic: topic,
                  firstPost: firstPost,
                  posts: output.posts,
                  page: page,
                  invitees: output.invitees,
                  userIsSubscribed: output.subscriptionExists,
                  userCanEdit: ( ( !topic.lockedByID && params.session.userID === topic.authorID ) || params.session.moderateDiscussions ) && topic.discussionID !== 0 && topic.discussionID !== 1,
                  userCanReply: output.userCanReply,
                  pagination: app.toolbox.helpers.paginate(url + '/id/' + topic.id, page, topic.replies + 1),
                  previousAndNext: app.toolbox.helpers.previousAndNext(url + '/id/' + topic.id, page, topic.replies + 1),
                  breadcrumbs: app.models.topic.breadcrumbs(topic)
                }
              });
            } else {
              emitter.emit('error', output.listen);
            }
          });
        }
      } else {
        emitter.emit('ready', output.access);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function head(params, context, emitter) {
  app.listen({
    metaData: function (emitter) {
      app.models.topic.metaData({
        topicID: params.url.id
      }, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      emitter.emit('ready', output.metaData);
    } else {
      emitter.emit('error', output.listen);
    }
  });
}



function start(params, context, emitter) {

  // Verify the user's group has post access to the discussion
  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.discussionPost({
        discussionID: params.url.id,
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
    discussion: function (previous, emitter) {
      app.models.discussion.info(params.url.id, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.title = '';
        params.form.content = app.config.comitium.editorIntro;
        params.form.subscribe = true;

        emitter.emit('ready', {
          view: 'start',
          content: {
            discussion: output.discussion,
            breadcrumbs: app.models.topic.breadcrumbs({
              discussionTitle: output.discussion.title,
              discussionUrl: output.discussion.url,
              discussionID: output.discussion.id
            })
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



function startForm(params, context, emitter) {

  if ( params.request.method === 'POST' ) {
    // Verify the user's group has post access to the discussion
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.discussionPost({
          discussionID: params.url.id,
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
      discussion: function (previous, emitter) {
        app.models.discussion.info(params.url.id, emitter);
      }
    }, function (output) {
      var discussion = output.discussion,
          parsedTitle,
          parsedContent,
          url,
          draft = false,
          time = app.toolbox.helpers.isoDate();

      // If the group has post access, process the topic form
      if ( output.listen.success ) {
        if ( output.access === true ) {
          parsedTitle = app.toolbox.markdown.title(params.form.title);
          parsedContent = app.toolbox.markdown.content(params.form.content);

          url = app.toolbox.slug(params.form.title);
          url = url.length ? url : 'untitled';

          switch ( params.form.formAction ) {
            default:
              emitter.emit('error', {
                message: 'No valid form action received'
              });
              break;
            case 'Preview post':
              emitter.emit('ready', {
                view: 'start',
                content: {
                  preview: {
                    title: parsedTitle,
                    content: parsedContent
                  },
                  discussion: discussion,
                  breadcrumbs: app.models.topic.breadcrumbs({
                    discussionTitle: output.discussion.title,
                    discussionUrl: output.discussion.url,
                    discussionID: output.discussion.id
                  })
                }
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
                    title: params.form.title,
                    titleHtml: parsedTitle,
                    url: url,
                    text: params.form.content,
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
                          redirect: draft ? app.config.comitium.baseUrl + 'drafts' : app.config.comitium.baseUrl + 'topic/' + url + '/id/' + topic.id
                        });
                      } else {
                        emitter.emit('error', output.listen);
                      }
                    });
                  } else {
                    emitter.emit('ready', {
                      redirect: draft ? app.config.comitium.baseUrl + 'drafts' : app.config.comitium.baseUrl + 'topic/' + url + '/id/' + topic.id
                    });
                  }
                } else {
                  if ( !output.listen.success ) {
                    emitter.emit('error', output.listen);
                  } else {
                    emitter.emit('ready', {
                      view: 'start',
                      content: {
                        topic: output.saveTopic,
                        discussion: discussion,
                        breadcrumbs: app.models.topic.breadcrumbs(discussion.title, discussion.url, discussion.id)
                      }
                    });
                  }
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
  // If it's a GET, fall back to the default topic start action
  } else {
    start(params, context, emitter);
  }

}



function startAnnouncement(params, context, emitter) {

  // Verify the user's group has post access to the discussion
  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.discussionPost({
        discussionID: 2,
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
    categoriesPost: function (previous, emitter) {
      app.models.discussions.categoriesPost(params.session.groupID, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.title = '';
        params.form.content = app.config.comitium.editorIntro;
        params.form.displayDiscussions = 'none';
        params.form.discussions = [];
        params.form.subscribe = true;

        emitter.emit('ready', {
          view: 'start-announcement',
          content: {
            categories: output.categoriesPost,
            breadcrumbs: app.models.topic.breadcrumbs({
              discussionTitle: 'Announcements',
              discussionUrl: 'announcements',
              discussionID: 2
            })
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



function startAnnouncementForm(params, context, emitter) {
  var discussions = [];

  if ( params.request.method === 'POST' ) {
    params.form.subscribe = params.form.subscribe || false;
    params.form.displayDiscussions = params.form.displayDiscussions || 'none';
    params.form.discussions = params.form.discussions || [];

    params.form.discussions.forEach( function (item, index, array) {
      discussions[item] = item;
    });

    params.form.discussions = discussions;

    // Verify the user's group has post access to the discussion
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.discussionPost({
          discussionID: 2,
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
      categoriesPost: function (previous, emitter) {
        app.models.discussions.categoriesPost(params.session.groupID, emitter);
      }
    }, function (output) {
      var categories = output.categoriesPost,
          parsedTitle,
          parsedContent,
          url,
          draft = false,
          time = app.toolbox.helpers.isoDate();

      // If the group has post access, process the announcement form
      if ( output.listen.success ) {
        if ( output.access === true ) {
          parsedTitle = app.toolbox.markdown.title(params.form.title);
          parsedContent = app.toolbox.markdown.content(params.form.content);

          url = app.toolbox.slug(params.form.title);
          url = url.length ? url : 'untitled';

          switch ( params.form.formAction ) {
            default:
              emitter.emit('error', {
                message: 'No valid form action received'
              });
              break;
            case 'Preview post':
              emitter.emit('ready', {
                view: 'start-announcement',
                content: {
                  preview: {
                    title: parsedTitle,
                    content: parsedContent
                  },
                  categories: categories,
                  breadcrumbs: app.models.topic.breadcrumbs({
                    discussionTitle: 'Announcements',
                    discussionUrl: 'announcements',
                    discussionID: 2
                  })
                }
              });
              break;
            case 'Save as draft':
            case 'Post your announcement':
              if ( params.form.formAction === 'Save as draft' ) {
                draft = true;
              }

              switch ( params.form.displayDiscussions ) {
                case 'none':
                  params.form.discussions = [ 2 ];
                  break;
                case 'all':
                  for ( var category in categories ) {
                    if ( categories.hasOwnProperty(category) ) {
                      for ( var discussion in categories[category].discussions ) {
                        if ( categories[category].discussions.hasOwnProperty(discussion) ) {
                          params.form.discussions.push(categories[category].discussions[discussion].discussionID);
                        }
                      }
                    }
                  }
                  break;
              }

              app.listen({
                saveTopic: function (emitter) {
                  app.models.topic.insert({
                    announcement: true,
                    discussionID: 2,
                    discussions: params.form.discussions,
                    userID: params.session.userID,
                    title: params.form.title,
                    titleHtml: parsedTitle,
                    url: url,
                    text: params.form.content,
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
                          redirect: draft ? app.config.comitium.baseUrl + 'drafts' : app.config.comitium.baseUrl + 'announcement/' + url + '/id/' + topic.id
                        });
                      } else {
                        emitter.emit('error', output.listen);
                      }

                    });
                  } else {
                    emitter.emit('ready', {
                      redirect: draft ? app.config.comitium.baseUrl + 'drafts' : app.config.comitium.baseUrl + 'announcement/' + url + '/id/' + topic.id
                    });
                  }
                } else {

                  if ( !output.listen.success ) {
                    emitter.emit('error', output.listen);
                  } else {
                    emitter.emit('ready', {
                      view: 'start-announcement',
                      content: {
                        topic: topic,
                        categories: categories,
                        breadcrumbs: app.models.topic.breadcrumbs({
                          discussionTitle: 'Announcements',
                          discussionUrl: 'announcements',
                          discussionID: 2
                        })
                      }
                    });
                  }

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
  // If it's a GET, fall back to the default announcement start action
  } else {
    start(params, context, emitter);
  }

}



function startPrivate(params, context, emitter) {

  // Verify the user can start a private topic with the invitee(s)
  app.listen('waterfall', {
    invitees: function (emitter) {
      var inviteesArray = [];

      if ( params.url.invitee ) {
        app.listen({
          invitees: function (emitter) {
            app.models.user.info({
              userID: params.url.invitee
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
        inviteesArray = params.form.invitees.split(',');

        for ( var i = 0; i < inviteesArray.length; i += 1 ) {
          inviteesArray[i] = inviteesArray[i].trim();
        }
        emitter.emit('ready', inviteesArray);
      } else {
        emitter.emit('ready');
      }
    },
    access: function (previous, emitter) {
      app.toolbox.access.privateTopicStart({
        user: params.session,
        invitees: previous.invitees
      }, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.invitees = output.invitees ? output.invitees.join(', ') : '';
        params.form.title = '';
        params.form.content = app.config.comitium.editorIntro;
        params.form.subscribe = true;

        emitter.emit('ready', {
          view: 'start-private',
          content: {
            invitees: output.invitees
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



function startPrivateForm(params, context, emitter) {
  var inviteesList = '',
      inviteesArray = [];

  if ( params.request.method === 'POST' ) {
    inviteesList = params.form.invitees.replace(/(^[,\s]+)|([,\s]+$)/g, '');

    if ( inviteesList.length ) {
      inviteesArray = inviteesList.split(',');

      for ( var i = 0; i < inviteesArray.length; i += 1 ) {
        inviteesArray[i] = inviteesArray[i].trim();
      }
    }

    // Verify the user can start a private topic with the invitees
    app.listen({
      access: function (emitter) {
        app.toolbox.access.privateTopicStart({
          user: params.session,
          invitees: inviteesArray
        }, emitter);
      }
    }, function (output) {
      var parsedTitle,
          parsedContent,
          url,
          draft = false,
          time = app.toolbox.helpers.isoDate();

      // If the user has permission, process the topic form
      if ( output.listen.success ) {
        if ( output.access === true ) {
          parsedTitle = app.toolbox.markdown.title(params.form.title);
          parsedContent = app.toolbox.markdown.content(params.form.content);

          url = app.toolbox.slug(params.form.title);
          url = url.length ? url : 'untitled';

          switch ( params.form.formAction ) {
            default:
              emitter.emit('error', {
                message: 'No valid form action received'
              });
              break;
            case 'Preview post':
              emitter.emit('ready', {
                view: 'start-private',
                content: {
                  preview: {
                    title: parsedTitle,
                    content: parsedContent
                  }
                }
              });
              break;
            case 'Save as draft':
            case 'Post your topic':
              if ( params.form.formAction === 'Save as draft' ) {
                draft = true;
              }
              app.listen('waterfall', {
                saveTopic: function (emitter) {
                  app.models.topic.insert({
                    private: true,
                    invitees: inviteesArray,
                    userID: params.session.userID,
                    username: params.session.username,
                    discussionID: 0,
                    title: params.form.title,
                    titleHtml: parsedTitle,
                    url: url,
                    text: params.form.content,
                    html: parsedContent,
                    draft: draft,
                    time: time
                  }, emitter);
                },
                mail: function (previous, emitter) {
                  if ( previous.saveTopic.success ) {
                    app.models.content.mail({
                      template: 'Topic Invitation',
                      replace: {
                        topicUrl: app.config.comitium.baseUrl + 'topic/id/' + previous.saveTopic.id,
                        author: params.session.username
                      }
                    }, emitter);
                  } else {
                    emitter.emit('ready', false);
                  }
                }
              }, function (output) {
                var topic = output.saveTopic,
                    mail = output.mail,
                    methods = {};

                if ( output.listen.success && output.saveTopic.success ) {
                  if ( !draft && output.mail.success ) {
                    inviteesArray.forEach( function (item, index, array) {
                      // Dedupes invitees by overwriting the method if it already exists
                      methods[item.toLowerCase()] = function (emitter) {
                        app.models.user.info({
                          username: item
                        }, emitter);
                      };
                    });

                    // Delete the author if they invited themselves
                    delete methods[params.session.username.toLowerCase()];

                    app.listen(methods, function (output) {
                      if ( output.listen.success ) {
                        delete output.listen;
                        for ( var invitee in output ) {
                          if ( output[invitee].privateTopicEmailNotification ) {
                            app.toolbox.mail.sendMail({
                              from: app.config.comitium.email,
                              to: output[invitee].email,
                              subject: mail.subject,
                              text: mail.text
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
                          redirect: draft ? app.config.comitium.baseUrl + 'drafts' : app.config.comitium.baseUrl + 'topic/id/' + topic.id
                        });
                      } else {
                        emitter.emit('error', output.listen);
                      }
                    });
                  } else {
                    emitter.emit('ready', {
                      redirect: draft ? app.config.comitium.baseUrl + 'drafts' : app.config.comitium.baseUrl + 'topic/id/' + topic.id
                    });
                  }
                } else {
                  if ( !output.listen.success ) {
                    emitter.emit('error', output.listen);
                  } else {
                    emitter.emit('ready', {
                      view: 'start-private',
                      content: {
                        topic: topic
                      }
                    });
                  }
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
  // If it's a GET, fall back to the default topic start action
  } else {
    startPrivate(params, context, emitter);
  }

}



function reply(params, context, emitter) {

  // Verify the user's group has reply access to the topic
  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicReply({
        topicID: params.url.id,
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
      if ( output.access === true ) {
        params.form.content = app.config.comitium.editorIntro;

        // If the quoted post exists and its topic ID matches this topic ID, add the
        // quote to the post content (this is a security measure, don't remove it).
        if ( output.quote && output.quote.topicID === output.topic.id && output.quote.text ) {
          params.form.content = '> [**' + output.quote.author + '** said:](post/id/' + output.quote.id + ')\n>\n> ' + output.quote.text.replace(/\n/g, '\n> ') + '\n>\n\n';
        } else if ( params.url.quote && !output.quote ) {
          message = 'We couldn\'t find the post you\'d like to quote. It may have been deleted.';
        }

        emitter.emit('ready', {
          view: 'reply',
          content: {
            topic: output.topic,
            reply: {
              message: message
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



function replyForm(params, context, emitter) {

  if ( params.request.method === 'POST' ) {
    // Verify the user's group has reply access to the topic
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.topicReply({
          topicID: params.url.id,
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
      topic: function (previous, emitter) {
        app.models.topic.info(params.url.id, emitter);
      }
    }, function (output) {
      var topic = output.topic,
          parsedContent,
          draft = false,
          time = app.toolbox.helpers.isoDate();

      // If the group has reply access, process the form
      if ( output.listen.success ) {
        if ( output.access === true ) {
          parsedContent = app.toolbox.markdown.content(params.form.content);

          switch ( params.form.formAction ) {
            default:
              emitter.emit('error', {
                message: 'No valid form action received'
              });
              break;
            case 'Preview post':
              emitter.emit('ready', {
                view: 'reply',
                content: {
                  preview: {
                    content: parsedContent
                  },
                  topic: topic
                }
              });
              break;
            case 'Save as draft':
            case 'Submit your reply':
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
                    text: params.form.content,
                    draft: draft,
                    private: topic.private,
                    time: time
                  }, emitter);
                }
              }, function (output) {
                var page = Math.ceil( ( topic.replies + 2 ) / 25 ),
                    pageParameter = page === 1 ? '' : '/page/' + page,
                    controller = topic.discussionID === 2 ? 'announcement' : 'topic',
                    urlTitle = topic.private ? '' : '/' + topic.url,
                    replyUrl = app.config.comitium.baseUrl + controller + urlTitle + '/id/' + topic.id + pageParameter + '#' + output.reply.id,
                    forwardToUrl = draft ? app.config.comitium.baseUrl + '/drafts' : replyUrl;

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
                        topicID: topic.id,
                        scope: 'updates',
                        skip: [ params.session.userID ],
                        time: time,
                        template: 'Topic Reply',
                        replace: {
                          replyAuthor: params.session.username,
                          replyUrl: replyUrl,
                          topicTitle: topic.private ? 'Private Topic (title withheld for your privacy)' : topic.title,
                          unsubscribeUrl: app.config.comitium.baseUrl + 'topic/action/unsubscribe/id/' + topic.id
                        }
                      });
                    }
                  } else {
                    emitter.emit('ready', {
                      view: 'reply',
                      content: {
                        reply: output.reply,
                        topic: topic,
                        breadcrumbs: app.models.topic.breadcrumbs(topic)
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
          emitter.emit('ready', output.access);
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

  app.listen('waterfall', {
    subscribersToNotify: function (emitter) {
      switch ( args.scope ) {
        case 'updates':
          app.models.topic.subscribersToUpdate({
            topicID: args.topicID,
            skip: args.skip
          }, emitter);
          break;
        default:
          app.models.topic.subscribers({
            topicID: args.topicID
          }, emitter);
      }
    },
    mail: function (previous, emitter) {
      if ( previous.subscribersToNotify.length ) {
        app.models.content.mail({
          template: args.template,
          replace: args.replace
        }, emitter);
      } else {
        emitter.emit('ready', false);
      }
    }
  }, function (output) {
    if ( output.mail && output.mail.success ) {
      for ( var i = 0; i < output.subscribersToNotify.length; i++ ) {
        app.toolbox.mail.sendMail({
          from: app.config.comitium.email,
          to: output.subscribersToNotify[i].email,
          subject: output.mail.subject,
          text: output.mail.text
        });
      }
      if ( args.scope === 'updates' ) {
        app.models.topic.subscriptionNotificationSentUpdate({
          topicID: args.topicID,
          time: args.time
        });
      }
    } else if ( !output.listen.success && emitter ) {
      emitter.emit('error', output.listen);
    }
  });

}



function subscribe(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicSubscribe({
        topicID: params.url.id,
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
      if ( output.access === true ) {
        emitter.emit('ready', {
          redirect: app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + '/' + params.route.controller + '/' + output.topic.url + '/id/' + output.topic.id)
        });
      } else {
        emitter.emit('ready', output.access);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function unsubscribe(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicSubscribe({
        topicID: params.url.id,
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
      if ( output.access === true ) {
        emitter.emit('ready', {
          redirect: params.request.headers['referer'] && params.request.headers['referer'].search('/sign-in') == -1 ? params.request.headers['referer'] : app.config.comitium.baseUrl + 'subscriptions'
        });
      } else {
        emitter.emit('ready', output.access);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function lock(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicLock({
        topicID: params.url.id,
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
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + params.route.controller + '/' + output.topic.url + '/id/' + output.topic.id);
        params.form.reason = '';

        emitter.emit('ready', {
          view: 'lock',
          content: {
            topic: output.topic
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

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicLock({
        topicID: params.url.id,
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
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    }
  }, function (output) {
    var topic = output.topic,
        parsedReason;

    if ( output.listen.success ) {
      if ( output.access === true ) {
        parsedReason = app.toolbox.markdown.inline(params.form.reason);

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
                notifySubscribers({
                  topicID: topic.id,
                  template: 'Topic Lock',
                  replace: {
                    topicTitle: topic.title,
                    topicUrl: app.config.comitium.baseUrl + 'topic/' + topic.url + '/id/' + topic.id,
                    reason: params.form.reason
                  }
                });
              }
              emitter.emit('ready', {
                redirect: params.form.forwardToUrl
              });
            } else {
              emitter.emit('ready', {
                view: 'lock',
                content: {
                  topic: topic,
                  lock: output.lock
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

}



function unlock(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicLock({
        topicID: params.url.id,
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
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    }
  }, function (output) {
    var topic = output.topic;

    if ( output.listen.success ) {
      if ( output.access === true ) {
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
        emitter.emit('ready', output.access);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function edit(params, context, emitter) {
  // Verify the user has edit rights
  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicEdit({
        topicID: params.url.id,
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
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    }
  }, function (output) {
    // If the user has access rights, display the topic edit form
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + '/topic/' + output.topic.id + '/' + output.topic.url);
        params.form.title = output.topic.title;
        params.form.content = output.topic.text;

        emitter.emit('ready', {
          view: 'edit',
          content: {
            topic: output.topic
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
    // Verify the user's group has edit access to the topic
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.topicEdit({
          topicID: params.url.id,
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
      topic: function (previous, emitter) {
        app.models.topic.info(params.url.id, emitter);
      },
      post: function (previous, emitter) {
        app.models.post.info(previous.topic.firstPostID, emitter);
      }
    }, function (output) {
      var topic = output.topic,
          announcement = topic.discussionID === 2 ? true : false,
          parsedTitle,
          parsedContent,
          parsedReason,
          url,
          time = app.toolbox.helpers.isoDate();

      // If the user has edit access, process the topic form
      if ( output.listen.success ) {
        if ( output.access === true ) {
          parsedTitle = app.toolbox.markdown.title(params.form.title);
          parsedContent = app.toolbox.markdown.content(params.form.content);
          parsedReason = app.toolbox.markdown.inline(params.form.reason);

          url = app.toolbox.slug(params.form.title);
          url = url.length ? url : 'untitled';

          switch ( params.form.formAction ) {
            default:
              emitter.emit('error', {
                message: 'No valid form action received'
              });
              break;
            case 'Preview changes':
              emitter.emit('ready', {
                view: 'edit',
                content: {
                  preview: {
                    title: parsedTitle,
                    content: parsedContent
                  },
                  topic: topic
                }
              });
              break;
            case 'Save changes':
              app.listen({
                edit: function (emitter) {
                  app.models.topic.edit({
                    topicID: topic.id,
                    discussionID: topic.discussionID,
                    postID: topic.firstPostID,
                    editorID: params.session.userID,
                    currentPost: output.post,
                    title: params.form.title,
                    titleHtml: parsedTitle,
                    url: url,
                    text: params.form.content,
                    html: parsedContent,
                    reason: parsedReason,
                    time: time
                  }, emitter);
                }
              }, function (output) {
                if ( output.listen.success && output.edit.success ) {
                  emitter.emit('ready', {
                    redirect: announcement ? app.config.comitium.baseUrl + 'announcement/' + url + '/id/' + topic.id : app.config.comitium.baseUrl + 'topic/' + url + '/id/' + topic.id
                  });
                } else {
                  if ( !output.listen.success ) {
                    emitter.emit('error', output.listen);
                  } else {
                    emitter.emit('ready', {
                      view: 'edit',
                      content: {
                        topic: output.edit
                      }
                    });
                  }
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
  // If it's a GET, fall back to the default topic start action
  } else {
    start(params, context, emitter);
  }

}



function move(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicMove({
        topicID: params.url.id,
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
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    },
    categories: function (previous, emitter) {
      app.models.discussions.categories(params.session.groupID, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + 'topic/action/move/id/' + output.topic.id);

        emitter.emit('ready', {
          view: 'move',
          content: {
            topic: output.topic,
            categories: output.categories
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



function moveForm(params, context, emitter) {

  if ( params.request.method === 'POST' ) {
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.topicMoveForm({
          topicID: params.url.id,
          newDiscussionID: params.form.destination,
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
      topic: function (previous, emitter) {
        app.models.topic.info(params.url.id, emitter);
      }
    }, function (output) {
      var topic = output.topic;

      if ( output.listen.success ) {
        if ( output.access === true ) {
          app.listen('waterfall', {
            newDiscussion: function (emitter) {
              app.models.discussion.info(params.form.destination, emitter);
            },
            move: function (previous, emitter) {
              app.models.topic.move({
                topicID: topic.id,
                topicUrl: topic.url,
                discussionID: topic.discussionID,
                discussionUrl: topic.discussionUrl,
                newDiscussionID: previous.newDiscussion.id
              }, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( output.move.success ) {
                if ( params.form.notify ) {
                  notifySubscribers({
                    topicID: topic.id,
                    template: 'Topic Move',
                    replace: {
                      topicTitle: topic.title,
                      topicUrl: app.config.comitium.baseUrl + 'topic/' + topic.url + '/id/' + topic.id,
                      oldDiscussionTitle: topic.discussionTitle,
                      newDiscussionTitle: output.newDiscussion.title
                    }
                  });
                }
                emitter.emit('ready', {
                  redirect: params.form.forwardToUrl
                });
              } else {
                emitter.emit('ready', {
                  view: 'move',
                  content: {
                    topic: topic,
                    move: output.move
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
    move(params, context, emitter);
  }

}



function trash(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicTrash({
        topicID: params.url.id,
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
    topic: function (previous, emitter) {
      app.models.topic.info(params.url.id, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + 'topic/action/trash/id/' + output.topic.id);
        params.form.reason = '';

        emitter.emit('ready', {
          view: 'trash',
          content: {
            topic: output.topic
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
        app.toolbox.access.topicTrash({
          topicID: params.url.id,
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
      topic: function (previous, emitter) {
        app.models.topic.info(params.url.id, emitter);
      }
    }, function (output) {
      var topic = output.topic;

      if ( output.listen.success ) {
        if ( output.access === true ) {
          app.listen({
            trash: function (emitter) {
              app.models.topic.move({
                topicID: topic.id,
                discussionID: topic.discussionID,
                newDiscussionID: 1
              }, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              if ( output.trash.success ) {
                if ( params.form.notify ) {
                  notifySubscribers({
                    topicID: topic.id,
                    template: 'Topic Delete',
                    replace: {
                      topicTitle: topic.title,
                      reason: params.form.reason
                    }
                  });
                }
                emitter.emit('ready', {
                  redirect: params.form.forwardToUrl
                });
              } else {
                emitter.emit('ready', {
                  view: 'trash',
                  content: {
                    topic: topic,
                    trash: output.trash
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
