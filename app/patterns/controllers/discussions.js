// discussions controller

'use strict';

module.exports = {
  handler: handler,
  head: head
};


function handler(params, context, emitter) {

  app.listen({
    categories: function (emitter) {
      app.models.discussions.categories(params.session.groupID, emitter);
    },
    topicCount: function (emitter) {
      app.models.stats.topics(emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      for ( var category in output.categories ) {
        if ( output.categories.hasOwnProperty(category) ) {
          for ( var discussion in output.categories[category].discussions ) {
            if ( output.categories[category].discussions.hasOwnProperty(discussion) ) {
              if ( app.toolbox.moment(output.categories[category].discussions[discussion].lastPostCreated).isAfter(params.session.lastActivity) && output.categories[category].discussions[discussion].lastPostAuthorID !== params.session.userID ) {
                output.categories[category].discussions[discussion].unread = true;
              }
            }
          }
        }
      }

      emitter.emit('ready', {
        content: {
          categories: output.categories,
          topicCount: app.toolbox.numeral(output.topicCount).format('0,0'),
          breadcrumbs: app.models.discussions.breadcrumbs()
        },
        include: {
          announcements: {
            route: '/announcements/end/4',
            view: 'compact'
          }
        }
      });
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function head(params, context, emitter) {
  emitter.emit('ready', app.models.discussions.metaData());
}
