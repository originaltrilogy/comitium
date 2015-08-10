// announcement controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  // Verify the user's group has read access to the announcement's parent discussion
  app.listen({
    access: function (emitter) {
      app.toolbox.access.topicView({
        topicID: params.url.id,
        user: params.session
      }, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        if ( params.url.unread && params.session.userID ) {
          app.listen({
            firstUnreadPost: function (emitter) {
              app.models.topic.firstUnreadPost({
                topicID: params.url.id,
                userID: params.session.userID
              }, emitter);
            }
          }, function (output) {
            if ( output.listen.success ) {
              var urlTopic = params.url.announcement,
                  urlPage = output.firstUnreadPost.page !== 1 ? '/page/' + output.firstUnreadPost.page : '',
                  urlPost = output.firstUnreadPost.post ? '/#' + output.firstUnreadPost.post.id : '';

              emitter.emit('ready', {
                redirect: params.route.parsed.protocol + app.config.comitium.baseUrl + 'announcement/' + urlTopic + '/id/' + params.url.id + urlPage + urlPost
              });
            } else {
              emitter.emit('error', output.listen);
            }
          });

        } else {
        
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
            },
            userCanReply: function (emitter) {
              app.toolbox.access.topicReply({
                topicID: params.url.id,
                user: params.session,
                response: 'boolean'
              }, emitter);
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
                content: {
                  topic: output.topic,
                  posts: output.posts,
                  userIsSubscribed: output.subscriptionExists,
                  userCanReply: output.userCanReply,
                  pagination: app.toolbox.helpers.paginate('announcement/' + output.topic.url + '/id/' + output.topic.id, params.url.page, output.topic.replies + 1),
                  breadcrumbs: app.models.topic.breadcrumbs('Announcements', 'announcements')
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
