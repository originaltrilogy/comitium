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
        var content = {};

        if ( output.listen.success ) {

          content = {
            discussion: output.discussion,
            breadcrumbs: app.models.discussion.breadcrumbs(output.discussion.title),
            pagination: app.toolbox.helpers.paginate('discussion/' + output.discussion.url + '/id/' + output.discussion.id, params.url.page, output.discussion.topics)
          };

          if ( output.announcements && app.size(output.announcements) ) {
            content.announcements = output.announcements;
          }
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
