// announcements controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {

  app.listen({
    access: function (emitter) {
      app.toolbox.access.discussionView(2, params.session.groupID, emitter);
    }
  }, function (output) {
    params.url.page = params.url.page || 1;

    if ( output.listen.success ) {

      app.listen({
        discussion: function (emitter) {
          app.models.announcements.info(2, emitter);
        },
        topics: function (emitter) {
          var start = ( params.url.page - 1 ) * 25,
              end = start + 25;
          app.models.announcements.topics({
            groupID: 2,
            start: start,
            end: end
          }, emitter);
        }
      }, function (output) {
        var content = {};

        if ( output.listen.success ) {

          content = {
            discussion: output.discussion,
            breadcrumbs: app.models.announcements.breadcrumbs(),
            pagination: app.toolbox.helpers.paginate('announcements/id/2', params.url.page, output.discussion.topics)
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
