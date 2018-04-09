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
      output.categories.forEach( function (item) {
        item.subcategories.forEach( function (item) {
          if ( app.toolbox.moment(item.lastPostCreated).isAfter(params.session.lastActivity) && item.lastPostAuthorID !== params.session.userID ) {
            item.unread = true;
          }
        });
      })

      emitter.emit('ready', {
        content: {
          categories: output.categories,
          topicCount: app.toolbox.numeral(output.topicCount).format('0,0')
          // Breadcrumbs will return when the today/home page is done
          // breadcrumbs: app.models.discussions.breadcrumbs()
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
