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

                topics.forEach( function (item) {
                  if ( params.session.groupID > 1 ) {
                    if ( !viewTimes[item.id] || ( item.lastPostAuthor !== params.session.username && app.toolbox.moment(item.lastPostCreated).isAfter(viewTimes[item.id].time) ) ) {
                      item.unread = true;
                    }
                  } else {
                    if ( app.toolbox.moment(item.lastPostCreated).isAfter(params.session.lastActivity) ) {
                      item.unread = true;
                    }
                  }
                })

                emitter.emit('ready', {
                  content: {
                    discussion: discussion,
                    topics: topics.length ? topics : false,
                    breadcrumbs: app.models.announcements.breadcrumbs(),
                    pagination: app.toolbox.helpers.paginate('announcements/id/2', params.url.page, discussion.topics),
                    previousAndNext: app.toolbox.helpers.previousAndNext('announcements/id/2', params.url.page, discussion.topics)
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
