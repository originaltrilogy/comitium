// conversations controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {

  app.listen({
    access: function (emitter) {
      app.toolbox.access.conversationsView(params.session, emitter);
    }
  }, function (output) {

    params.url.page = params.url.page || 1;

    if ( output.listen.success ) {

      app.listen({
        stats: function (emitter) {
          app.models.conversations.info(params.session.userID, emitter);
        },
        conversations: function (emitter) {
          var start = ( params.url.page - 1 ) * 25,
              end = start + 25;
          app.models.conversations.conversations({
            userID: params.session.userID,
            start: start,
            end: end
          }, emitter);
        }
      }, function (output) {
        var content = {};

        if ( output.listen.success ) {

          content = {
            pagination: app.toolbox.helpers.paginate('conversations/', params.url.page, output.stats.conversations)
          };

          if ( output.conversations && app.size(output.conversations) ) {
            content.conversations = output.conversations;
          }

          emitter.emit('ready', {
            content: content,
            handoff: {
              controller: '+_layout'
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
