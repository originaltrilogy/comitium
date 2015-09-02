// _footer controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  app.listen({
    topics: function (emitter) {
      app.models.stats.topics(emitter);
    },
    posts: function (emitter) {
      app.models.stats.posts(emitter);
    },
    users: function (emitter) {
      app.models.stats.users(emitter);
    }
  }, function (output) {
    emitter.emit('ready', {
      content: {
        stats: {
          topics: app.toolbox.numeral(output.topics).format('0,0'),
          posts: app.toolbox.numeral(output.posts).format('0,0'),
          users: app.toolbox.numeral(output.users).format('0,0')
        }
      },
      cache: {
        controller: {
          lifespan: 'application'
        }
      }
    });
  });
}
