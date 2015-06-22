// discussion controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {

  app.listen({
    access: function (emitter) {
      app.toolbox.access.discussionView(params.url.id, params.session.groupID, emitter);
    }
  }, function (output) {
    var models = {};

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

    if ( output.listen.success ) {

      app.listen(models, function (output) {
        var discussion = output.discussion,
            announcements = output.announcements,
            topics = output.topics;

        if ( output.listen.success ) {
          
          app.listen({
            viewTimes: function (emitter) {
              var topicID = [];
              
              for ( var topic in topics ) {
                topicID.push(topics[topic].id)
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
                  if ( ( !viewTimes[announcements[announcement].id] && app.toolbox.moment(announcements[announcement].lastPostDate).isAfter(params.session.lastActivity) ) || ( viewTimes[announcements[announcement].id] && app.toolbox.moment(announcements[announcement].lastPostDate).isAfter(viewTimes[announcements[announcement].id].time) && app.toolbox.moment(announcements[announcement].lastPostDate).isAfter(params.session.lastActivity) ) ) {
                    announcements[announcement].updated = true;
                  }
                }
                content.announcements = announcements;
              }
              
              if ( topics && app.size(topics) ) {
                for ( var topic in topics ) {
                  if ( ( !viewTimes[topics[topic].id] && app.toolbox.moment(topics[topic].lastPostDate).isAfter(params.session.lastActivity) ) || ( viewTimes[topics[topic].id] && app.toolbox.moment(topics[topic].lastPostDate).isAfter(viewTimes[topics[topic].id].time) && app.toolbox.moment(topics[topic].lastPostDate).isAfter(params.session.lastActivity) ) ) {
                    topics[topic].updated = true;
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

      emitter.emit('error', output.listen);

    }

  });
}
