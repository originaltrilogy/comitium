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
    },
    firstPost: function (emitter) {
      app.models.stats.firstPost(emitter);
    }
  }, function (output) {
    var copyrightYear = new Date(output.firstPost).getFullYear(),
        year = new Date().getFullYear();

    if ( copyrightYear !== year ) {
      copyrightYear += '-' + year;
    }

    emitter.emit('ready', {
      content: {
        logo: app.resources.images.logoVertical,
        stats: {
          topics: app.toolbox.numeral(output.topics).format('0,0'),
          posts: app.toolbox.numeral(output.posts).format('0,0'),
          users: app.toolbox.numeral(output.users).format('0,0'),
          firstPostCreated: app.toolbox.moment.tz(output.firstPost, 'America/New_York').format('MMMM D, YYYY')
        },
        copyrightYear: copyrightYear
      },
      cache: {
        controller: {
          lifespan: 'application'
        }
      }
    });
  });
}
