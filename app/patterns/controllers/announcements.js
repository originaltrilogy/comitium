// announcements controller

'use strict';

module.exports = {
  handler: handler,
  head: head
};


function handler(params, context, emitter) {

  app.listen({
    access: function (emitter) {
      app.toolbox.access.discussionView({
        discussionID: 2,
        user: params.session
      }, emitter);
    }
  }, function (output) {
    params.url.page = params.url.page || 1;

    if ( output.listen.success ) {
      if ( output.access === true ) {
        app.listen({
          discussion: function (emitter) {
            app.models.announcements.info(2, emitter);
          },
          topics: function (emitter) {
            var start = params.url.start || ( params.url.page - 1 ) * 25,
                end = params.url.end || start + 25;

            app.models.announcements.topics({
              groupID: 1,
              start: start,
              end: end
            }, emitter);
          }
        }, function (output) {
          var discussion = output.discussion,
              topics = output.topics;

          if ( output.listen.success ) {
            app.listen({
              viewTimes: function (emitter) {
                var topicID = [];

                if ( params.session.userID ) {
                  for ( var topic in topics ) {
                    if ( topics.hasOwnProperty(topic) ) {
                      topicID.push(topics[topic].id);
                    }
                  }

                  app.models.user.topicViewTimes({
                    userID: params.session.userID,
                    topicID: topicID.join(', ')
                  }, emitter);
                } else {
                  emitter.emit('ready');
                }
              }
            }, function (output) {
              var viewTimes = {},
                  content = {};

              if ( output.listen.success ) {
                if ( output.viewTimes ) {
                  output.viewTimes.forEach( function (item, index, array) {
                    viewTimes[item.topicID] = item;
                  });
                }

                content = {
                  discussion: discussion,
                  breadcrumbs: app.models.announcements.breadcrumbs(),
                  pagination: app.toolbox.helpers.paginate('announcements/id/2', params.url.page, discussion.topics)
                };

                if ( topics && app.size(topics) ) {
                  for ( var topic in topics ) {
                    if ( params.session.groupID > 1 ) {
                      if ( !viewTimes[topics[topic].id] || ( topics[topic].lastPostAuthor !== params.session.username && app.toolbox.moment(topics[topic].lastPostCreated).isAfter(viewTimes[topics[topic].id].time) ) ) {
                        topics[topic].unread = true;
                      }
                    } else if ( app.toolbox.moment(topics[topic].lastPostCreated).isAfter(params.session.lastActivity) ) {
                      topics[topic].unread = true;
                    }
                  }
                  content.topics = topics;
                }

                emitter.emit('ready', {
                  content: content
                });
              } else {
                emitter.emit('error', output.listen);
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



function head(params, context, emitter) {
  emitter.emit('ready', app.models.announcements.metaData());
}
