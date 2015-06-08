// announcement controller

'use strict';

var Remarkable = require('remarkable');

module.exports = {
  handler: handler,
  start: start,
  startForm: startForm,
  reply: reply,
  replyForm: replyForm,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  lock: lock,
  lockForm: lockForm,
  unlock: unlock,
  trash: trash,
  trashForm: trashForm
};



function handler(params, context, emitter) {
  emitter.emit('ready', {
    view: false,
    handoff: {
      controller: 'topic',
      view: 'announcement'
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



function reply(params, context, emitter) {
  emitter.emit('ready', {
    view: false,
    handoff: {
      controller: 'topic',
      action: 'reply',
      view: 'reply-announcement'
    }
  });
}


function replyForm(params, context, emitter) {
  emitter.emit('ready', {
    view: false,
    handoff: {
      controller: 'topic',
      action: 'replyForm',
      view: 'reply-announcement'
    }
  });
}


function subscribe(params, context, emitter) {
  emitter.emit('ready', {
    view: false,
    handoff: {
      controller: 'topic',
      action: 'subscribe'
    }
  });
}


function unsubscribe(params, context, emitter) {
  emitter.emit('ready', {
    view: false,
    handoff: {
      controller: 'topic',
      action: 'unsubscribe'
    }
  });
}



function lock(params, context, emitter) {
  emitter.emit('ready', {
    view: false,
    handoff: {
      controller: 'topic',
      action: 'lock'
    }
  });
}



function lockForm(params, context, emitter) {
  emitter.emit('ready', {
    view: false,
    handoff: {
      controller: 'topic',
      action: 'lockForm'
    }
  });
}



function unlock(params, context, emitter) {
  emitter.emit('ready', {
    view: false,
    handoff: {
      controller: 'topic',
      action: 'unlock'
    }
  });
}



function trash(params, context, emitter) {

  params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.main.baseUrl + '/topic/' + params.url.id);

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
