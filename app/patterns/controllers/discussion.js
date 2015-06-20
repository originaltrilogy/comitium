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
              
              topics.forEach( function (item, index, array) {
                topicID.push(item.id);
              });
              
              // for ( var item in topics ) {
              //   topicID.push(topics[item].id);
              // }
              
              app.models.user.topicViewTimes({
                userID: params.session.userID,
                topicID: topicID.join(', ')
              }, emitter);
            }
          }, function (output) {
            var viewTimes = {},
                updatedTopics = {},
                content = {};
            
            if ( output.listen.success ) {
            
              if ( output.viewTimes ) {
                output.viewTimes.forEach( function (item, index, array) {
                  viewTimes[item.topicID] = item;
                });
              }
              
              content = {
                discussion: discussion,
                breadcrumbs: app.models.discussion.breadcrumbs(discussion.title),
                pagination: app.toolbox.helpers.paginate('discussion/' + discussion.url + '/id/' + discussion.id, params.url.page, discussion.topics)
              };
    
              if ( announcements && announcements.length ) {
                announcements.forEach( function (item, index, array) {
                  if ( ( !viewTimes[item.id] && item.lastPostDate > params.session.lastActivity ) || ( viewTimes[item.id] && item.lastPostDate > viewTimes[item.id].time ) ) {
                    announcements[index].updated = true;
                  }
                });
                content.announcements = announcements;
              }
              
              if ( topics && topics.length ) {
                topics.forEach( function (item, index, array) {
                  if ( ( !viewTimes[item.id] && app.toolbox.moment(item.lastPostDate).isAfter(params.session.lastActivity) ) || ( viewTimes[item.id] && app.toolbox.moment(item.lastPostDate).isAfter(viewTimes[item.id].time) ) ) {
                    updatedTopics[item.id] = true;
                    // topics[index].updated = true;
                  }
                });
              // if ( topics && app.size(topics) ) {
              //   for ( var item in topics ) {
              //     if ( ( !viewTimes[topics[item].id] && app.toolbox.moment(topics[item].lastPostDate).isAfter(params.session.lastActivity) ) || ( viewTimes[topics[item].id] && app.toolbox.moment(topics[item].lastPostDate).isAfter(viewTimes[topics[item].id].time) ) ) {
              //       topics[item].updated = true;
              //     }
              //   }
                content.topics = topics;
                content.updatedTopics = updatedTopics;
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
