// discussion controller

'use strict';

module.exports = {
  handler: handler,
  head: head
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
    var page = parseInt(params.url.page, 10) || 1;

    if ( output.listen.success ) {
      if ( output.access === true ) {
        app.listen({
          discussion: function (emitter) {
            app.models.discussion.info(params.url.id, emitter);
          },
          topics: function (emitter) {
            var start = ( page - 1 ) * 25,
                end = start + 25;
            app.models.discussion.topics({
              discussionID: params.url.id,
              start: start,
              end: end
            }, emitter);
          },
          announcements: function (emitter) {
            if ( page === 1 ) {
              app.models.discussion.announcements(params.url.id, emitter);
            } else {
              emitter.emit('ready', []);
            }
          }
        }, function (output) {
          var discussion = output.discussion,
              announcements = output.announcements,
              topics = output.topics;

          if ( output.listen.success ) {
            if ( params.route.descriptor === discussion.url ) {
              app.listen({
                viewTimes: function (emitter) {
                  var topicID = [];
  
                  topics.forEach( function (item) {
                    topicID.push(item.id);
                  })
  
                  announcements.forEach( function (item) {
                    topicID.push(item.id);
                  })
  
                  app.models.user.topicViewTimes({
                    userID: params.session.userID,
                    topicID: topicID.join(', ')
                  }, emitter);
                }
              }, function (output) {
                var viewTimes = {};
  
                if ( output.listen.success ) {
                  if ( output.viewTimes.length ) {
                    output.viewTimes.forEach( function (item) {
                      viewTimes[item.topicID] = item;
                    });
                  }
  
                  announcements.forEach( function (item) {
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
  
                  topics.forEach( function (item) {
                    if ( params.session.groupID > 1 ) {
                      if ( !viewTimes[item.id] || ( item.lastPostAuthor !== params.session.username && app.toolbox.moment(item.lastPostCreated).isAfter(viewTimes[item.id].time) ) ) {
                        item.unread = true;
                      }
                    } else if ( app.toolbox.moment(item.lastPostCreated).isAfter(params.session.lastActivity) ) {
                      item.unread = true;
                    }
                  })
  
                  emitter.emit('ready', {
                    content: {
                      discussion: discussion,
                      announcements: announcements.length ? announcements : false,
                      topics: topics.length ? topics : false,
                      breadcrumbs: app.models.discussion.breadcrumbs(discussion.title),
                      page: page,
                      pagination: app.toolbox.helpers.paginate('discussion/' + discussion.url + '/id/' + discussion.id, page, discussion.topics),
                      previousAndNext: app.toolbox.helpers.previousAndNext('discussion/' + discussion.url + '/id/' + discussion.id, page, discussion.topics)
                    }
                  });
  
                } else {
                  emitter.emit('error', output.listen);
                }
              });
            } else {
              emitter.emit('ready', {
                redirect: {
                  url: app.config.comitium.baseUrl + 'discussion/' + discussion.url + '/id/' + discussion.id + ( params.url.page ? '/page/' + params.url.page : '' ),
                  statusCode: 301
                }
              })
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



function head(params, context, emitter) {
  app.listen({
    metaData: function (emitter) {
      app.models.discussion.metaData({
        discussionID: params.url.id
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
