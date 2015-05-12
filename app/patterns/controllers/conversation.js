// conversation controller

'use strict';

var Remarkable = require('remarkable');

module.exports = {
  handler: handler,
  start: start,
  startForm: startForm,
  reply: reply,
  replyForm: replyForm
};


function handler(params, context, emitter) {
  // Verify the user's group has read access to the topic's parent discussion
  app.listen({
    access: function (emitter) {
      app.toolbox.access.conversationView(params.url.conversation, params.session.userID, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      params.url.page = params.url.page || 1;

      // If the group has read access, get the posts for the requested page
      app.listen({
        topicInfo: function (emitter) {
          app.models.topic.info(params.url.topic, emitter);
        },
        posts: function (emitter) {
          var start = ( params.url.page - 1 ) * 25,
              end = start + 25;
          app.models.topic.posts({
            topic: params.url.topic,
            start: start,
            end: end
          }, emitter);
        },
        subscriptionExists: function (emitter) {
          if ( params.session.userID ) {
            app.models.topic.subscriptionExists({
              userID: params.session.userID,
              topic: params.url.topic
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
              topicID: output.topicInfo.id,
              time: app.toolbox.helpers.isoDate()
            });
          }

          emitter.emit('ready', {
            content: {
              topicInfo: output.topicInfo,
              posts: output.posts,
              userIsSubscribed: output.subscriptionExists,
              pagination: app.toolbox.helpers.paginate(app.config.main.basePath + 'topic/' + output.topicInfo.url, params.url.page, output.topicInfo.replies + 1),
              breadcrumbs: app.models.topic.breadcrumbs(output.topicInfo.discussionTitle, output.topicInfo.discussionUrl)
            },
            handoff: {
              controller: '+_layout'
            }
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


function start(params, context, emitter) {

  // Verify the user has permission to start a private conversation with the recipient
  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.conversationStart({
        userID: params.session.userID,
        recipient: params.url.recipient
      }, emitter);
    },
    recipient: function (previous, emitter) {
      app.models.user.info({
        user: params.url.recipient
      }, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      params.form.recipient = output.recipient.username;
      params.form.subject = '';
      params.form.message = 'We\'ve replaced the old forum script with Markdown, making it easy to add formatting like *italics*, __bold__, and lists:\n\n1. Item one\n2. Item two\n3. Item three\n\nFor more details, tap or click the help button above this form field, or see the [Markdown web site](http://markdown.com).';

      emitter.emit('ready', {
        content: {
          recipient: output.recipient
        },
        view: 'start',
        handoff: {
          controller: '+_layout'
        }
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
        app.toolbox.access.conversationStart({
          userID: params.session.userID,
          recipient: params.url.recipient
        }, emitter);
      },
      recipient: function (previous, emitter) {
        app.models.user.info({
          username: params.form.recipient
        }, emitter);
      }
    }, function (output) {
      var subjectMarkdown = new Remarkable(),
          messageMarkdown = new Remarkable({
            breaks: true,
            linkify: true
          }),
          parsedSubject,
          parsedMessage,
          draft = false,
          time = app.toolbox.helpers.isoDate();

      // If the group has post access, process the topic form
      if ( output.listen.success ) {

        parsedSubject = subjectMarkdown.render(params.form.subject);
        // Get rid of the paragraph tags and line break added by Remarkable
        parsedSubject = parsedSubject.replace(/<p>(.*)<\/p>\n$/, '$1');

        parsedMessage = messageMarkdown.render(params.form.message);

        switch ( params.form.formAction ) {
          case 'Preview':
            emitter.emit('ready', {
              content: {
                preview: {
                  subject: parsedSubject,
                  message: parsedMessage
                }
              },
              view: 'start',
              handoff: {
                controller: '+_layout'
              }
            });
            break;
          case 'Save as draft':
          case 'Send your message':
            if ( params.form.formAction === 'Save as draft' ) {
              draft = true;
            }
            app.listen({
              saveConversation: function (emitter) {
                app.models.conversation.insert({
                  userID: params.session.userID,
                  recipientID: output.recipient.id,
                  subjectMarkdown: params.form.subject,
                  subjectHtml: parsedSubject,
                  markdown: params.form.message,
                  html: parsedMessage,
                  draft: draft,
                  time: time
                }, emitter);
              }
            }, function (output) {
              var saveConversation = output.saveConversation;

              if ( output.listen.success && saveConversation.success ) {
                emitter.emit('ready', {
                  redirect: draft ? app.config.main.baseUrl + '/drafts' : app.config.main.baseUrl + '/conversation/' + saveConversation.id
                });
              } else {

                if ( !output.listen.success ) {
                  emitter.emit('error', output.listen);
                } else {
                  emitter.emit('ready', {
                    content: {
                      start: saveConversation
                    },
                    view: 'start',
                    handoff: {
                      controller: '+_layout'
                    }
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
  // If it's a GET, fall back to the start action
  } else {
    start(params, context, emitter);
  }
}


function reply(params, context, emitter) {

  // Verify the user's group has reply access to the topic
  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.topicReply(params.url.topic, params.session, emitter);
    },
    topicInfo: function (previous, emitter) {
      app.models.topic.info(params.url.topic, emitter);
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

      params.form.message = '';
      params.form.subscribe = false;

      // If the quoted post exists and its topic ID matches this topic ID, add the
      // quote to the post content (this is a security measure, don't remove it).
      if ( output.quote && output.quote.topicID === output.topicInfo.id && output.quote.markdown ) {
        params.form.message = '[' + output.quote.author + ' said](' + app.config.main.basePath + 'post/' + output.quote.id + '):\n> ' + output.quote.markdown.replace(/\n/g, '\n> ') + '\n\n';
      } else if ( params.url.quote && !output.quote ) {
        message = 'We couldn\'t find the post you\'d like to quote. It may have been deleted.';
      }

      emitter.emit('ready', {
        content: {
          topicInfo: output.topicInfo,
          breadcrumbs: app.models.topic.breadcrumbs(output.topicInfo.discussionTitle, output.topicInfo.discussionUrl),
          reply: {
            message: message
          }
        },
        view: 'reply',
        handoff: {
          controller: '+_layout'
        }
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
        app.toolbox.access.topicReply(params.url.topic, params.session, emitter);
      },
      topicInfo: function (previous, emitter) {
        app.models.topic.info(params.url.topic, emitter);
      }
    }, function (output) {
      var topicInfo = output.topicInfo,
          messageMarkdown = new Remarkable({
            breaks: true,
            linkify: true
          }),
          parsedMessage,
          draft = false,
          time = app.toolbox.helpers.isoDate();

      // If the group has reply access, process the form
      if ( output.listen.success ) {

        parsedMessage = messageMarkdown.render(params.form.message);

        switch ( params.form.formAction ) {
          case 'Preview':
            emitter.emit('ready', {
              content: {
                preview: {
                  content: parsedMessage
                },
                topicInfo: topicInfo,
                breadcrumbs: app.models.topic.breadcrumbs(topicInfo.discussionTitle, topicInfo.discussionUrl)
              },
              view: 'reply',
              handoff: {
                controller: '+_layout'
              }
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
                  topicID: topicInfo.id,
                  topicUrl: topicInfo.url,
                  discussionID: topicInfo.discussionID,
                  discussionUrl: topicInfo.discussionUrl,
                  userID: params.session.userID,
                  html: parsedMessage,
                  markdown: params.form.message,
                  draft: draft,
                  time: time
                }, emitter);
              }
            }, function (output) {
              var reply = output.reply,
                  page = Math.ceil( ( topicInfo.replies + 2 ) / 25 ),
                  pageParameter = page !== 1 ? '/page/' + page : '',
                  replyUrl = app.config.main.baseUrl + '/topic/' + topicInfo.url + pageParameter + '/#' + reply.id,
                  forwardToUrl = draft ? app.config.main.baseUrl + '/drafts' : replyUrl;

              if ( output.listen.success ) {

                if ( reply.success ) {
                  if ( params.form.subscribe ) {
                    app.listen({
                      subscribe: function (emitter) {
                        app.models.topic.subscribe({
                          userID: params.session.userID,
                          topicID: topicInfo.id,
                          time: time
                        }, emitter);
                      }
                    }, function (output) {

                      if ( output.listen.success ) {

                        emitter.emit('ready', {
                          content: reply,
                          redirect: forwardToUrl
                        });

                      } else {

                        emitter.emit('error', output.listen);

                      }

                    });
                  } else {
                    emitter.emit('ready', {
                      content: reply,
                      redirect: forwardToUrl
                    });
                  }

                  // If it's not a draft post, notify the topic subscribers
                  if ( !draft ) {
                    notifyParticipants({
                      replyAuthorID: params.session.userID,
                      topicID: topicInfo.id,
                      time: time,
                      url: replyUrl
                    });
                  }
                } else {
                  emitter.emit('ready', {
                    content: {
                      reply: reply,
                      topicInfo: topicInfo,
                      breadcrumbs: app.models.topic.breadcrumbs(topicInfo.discussionTitle, topicInfo.discussionUrl)
                    },
                    view: 'reply',
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

  // If it's a GET, fall back to the default topic reply action
  } else {
    reply(params, context, emitter);
  }
}


function notifyParticipants(args, emitter) {

  app.listen({
    subscribersToNotify: function (emitter) {
      app.models.topic.subscribersToNotify({
        topicID: args.topicID,
        replyAuthorID: args.replyAuthorID
      }, emitter);
    }
  }, function (output) {
    console.log(output.subscribersToNotify);
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
