// discussions controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  
  app.listen({
    categories: function (emitter) {
      app.models.discussions.categories(params.session.groupID, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      for ( var category in output.categories ) {
        if ( output.categories.hasOwnProperty(category) ) {
          for ( var discussion in output.categories[category].discussions ) {
            if ( output.categories[category].discussions.hasOwnProperty(discussion) ) {
              if ( app.toolbox.moment(output.categories[category].discussions[discussion].lastPostDate).isAfter(params.session.lastActivity) ) {
                output.categories[category].discussions[discussion].updated = true;
              }
            }
          }
        }
      }
      console.log(output.categories);

      emitter.emit('ready', {
        content: {
          categories: output.categories,
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
