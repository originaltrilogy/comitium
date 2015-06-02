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

      emitter.emit('ready', {
        content: {
          categories: output.categories,
          breadcrumbs: app.models.discussions.breadcrumbs()
        }
      });

    } else {

      emitter.emit('error', output.listen);

    }

  });
}
