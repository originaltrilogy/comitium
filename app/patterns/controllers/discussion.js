// discussion controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {

  app.listen({
    access: function (emitter) {
      app.toolbox.access.discussionView(params.url.discussion, params.session.groupID, emitter);
    }
  }, function (output) {
    var models = {};

    params.url.page = params.url.page || 1;

    models = {
      discussionInfo: function (emitter) {
        app.models.discussion.info(params.url.discussion, emitter);
      },
      topics: function (emitter) {
        var start = ( params.url.page - 1 ) * 25,
            end = start + 25;
        app.models.discussion.topics({
          discussion: params.url.discussion,
          start: start,
          end: end
        }, emitter);
      }
    };

    if ( params.url.page === 1 ) {
      models.announcements = function (emitter) {
        app.models.discussion.announcements(params.url.discussion, emitter);
      };
    }

    if ( output.listen.success ) {

      app.listen(models, function (output) {
        var content = {};

        if ( output.listen.success ) {

          content = {
            discussionInfo: output.discussionInfo,
            breadcrumbs: app.models.discussion.breadcrumbs(output.discussionInfo.discussionTitle),
            pagination: app.toolbox.helpers.paginate(app.config.main.basePath + 'discussion/' + output.discussionInfo.discussionUrl, params.url.page, output.discussionInfo.topics)
          };

          if ( output.announcements && app.size(output.announcements) ) {
            content.announcements = output.announcements;
          }
          if ( output.topics && app.size(output.topics) ) {
            content.topics = output.topics;
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
