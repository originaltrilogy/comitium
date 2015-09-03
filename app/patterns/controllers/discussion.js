// discussion controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {

  app.listen({
    access: function (emitter) {
      app.toolbox.access.discussionView({
        discussionID: params.url.id,
        user: params.session
      }, emitter);
    }
  }, function (output) {
    var models = {};

    if ( output.listen.success ) {
      if ( output.access === true ) {

        params.url.page = params.url.page || 1;

        models = {
          discussion: function (emitter) {
            app.models.discussion.info(params.url.id, emitter);
          },
          topics: function (emitter) {
            var start = ( params.url.page - 1 ) * 25,
                end = start + 25;
            app.models.discussion.topics({
              discussionID: params.url.id,
              start: start,
              end: end
            }, emitter);
          }
        };

        if ( params.url.page === 1 ) {
          models.announcements = function (emitter) {
            app.models.discussion.announcements(params.url.id, emitter);
          };
        }

        app.listen(models, function (output) {
          var discussion = output.discussion,
              announcements = output.announcements,
              topics = output.topics;

          if ( output.listen.success ) {

            app.listen({
              viewTimes: function (emitter) {
                var topicID = [];

                for ( var topic in topics ) {
                  if ( topics.hasOwnProperty(topic) ) {
                    topicID.push(topics[topic].id);
                  }
                }

                for ( var announcement in announcements ) {
                  if ( announcements.hasOwnProperty(announcement) ) {
                    topicID.push(announcements[announcement].id);
                  }
                }

                app.models.user.topicViewTimes({
                  userID: params.session.userID,
                  topicID: topicID.join(', ')
                }, emitter);
              }
            }, function (output) {
              var viewTimes = {},
                  content = {};

              if ( output.listen.success ) {

                if ( output.viewTimes.length ) {
                  output.viewTimes.forEach( function (item, index, array) {
                    viewTimes[item.topicID] = item;
                  });
                }

                content = {
                  discussion: discussion,
                  breadcrumbs: app.models.discussion.breadcrumbs(discussion.title),
                  pagination: app.toolbox.helpers.paginate('discussion/' + discussion.url + '/id/' + discussion.id, params.url.page, discussion.topics)
                };

                if ( announcements && app.size(announcements) ) {
                  for ( var announcement in announcements ) {
                    if ( params.session.groupID > 1 ) {
                      if ( !viewTimes[announcements[announcement].id] || ( announcements[announcement].lastPostAuthor !== params.session.username && ( app.toolbox.moment(announcements[announcement].lastPostCreated).isAfter(viewTimes[announcements[announcement].id].time) || app.toolbox.moment(announcements[announcement].lastPostCreated).isAfter(params.session.lastActivity) ) ) ) {
                        announcements[announcement].unread = true;
                      }
                    } else {
                      if ( app.toolbox.moment(announcements[announcement].lastPostCreated).isAfter(params.session.lastActivity) ) {
                        announcements[announcement].unread = true;
                      }
                    }
                  }
                  content.announcements = announcements;
                }

                if ( topics && app.size(topics) ) {
                  for ( var topic in topics ) {
                    if ( params.session.groupID > 1 ) {
                      if ( !viewTimes[topics[topic].id] || ( topics[topic].lastPostAuthor !== params.session.username && ( app.toolbox.moment(topics[topic].lastPostCreated).isAfter(viewTimes[topics[topic].id].time) || app.toolbox.moment(topics[topic].lastPostCreated).isAfter(params.session.lastActivity) ) ) ) {
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
