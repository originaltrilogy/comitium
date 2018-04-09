// private topics controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {

  app.listen({
    access: function (emitter) {
      app.toolbox.access.privateTopicsView({
        user: params.session
      }, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.url.page = params.url.page || 1;

        app.listen({
          stats: function (emitter) {
            app.models['private-topics'].stats(params.session.userID, emitter);
          },
          topics: function (emitter) {
            var start = ( params.url.page - 1 ) * 25,
                end = start + 25;
            app.models['private-topics'].topics({
              userID: params.session.userID,
              start: start,
              end: end
            }, emitter);
          }
        }, function (output) {
          var stats = output.stats,
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

                if ( topicID.length ) {
                  app.models.user.topicViewTimes({
                    userID: params.session.userID,
                    topicID: topicID.join(', ')
                  }, emitter);
                } else {
                  emitter.emit('ready', false);
                }
              }
            }, function (output) {
              var viewTimes = {};

              if ( output.listen.success ) {

                if ( output.viewTimes ) {
                  output.viewTimes.forEach( function (item, index, array) {
                    viewTimes[item.topicID] = item;
                  });
                }

                topics.forEach( function (item) {
                  if ( !viewTimes[item.id] || ( item.lastPostAuthor !== params.session.username && app.toolbox.moment(item.lastPostCreated).isAfter(viewTimes[item.id].time) ) ) {
                    item.unread = true;
                  }
                })

                emitter.emit('ready', {
                  content: {
                    topics: topics.length ? topics : false,
                    stats: stats,
                    breadcrumbs: app.models['private-topics'].breadcrumbs(),
                    pagination: app.toolbox.helpers.paginate('private-topics', params.url.page, stats.topics),
                    previousAndNext: app.toolbox.helpers.previousAndNext('private-topics', params.url.page, stats.topics)
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
