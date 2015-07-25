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

    params.url.page = params.url.page || 1;

    if ( output.listen.success ) {

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
        var content = {};

        if ( output.listen.success ) {

          content = {
            pagination: app.toolbox.helpers.paginate('private-topics', params.url.page, output.stats.topics)
          };

          if ( output.topics && app.size(output.topics) ) {
            content.topics = output.topics;
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
}
