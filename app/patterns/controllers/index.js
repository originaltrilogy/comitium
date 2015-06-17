// index controller

'use strict';

module.exports = {
  'handler': handler
};


function handler(params, context, emitter) {

  app.listen('waterfall', {
    categories: function (emitter) {
      app.models.index.content(params.session.groupID, emitter);
    },
    durhay: function (previous, emitter) {
      if ( params.url.dummy ) {
        emitter.emit('ready', true);
      } else if ( params.url.end ) {
        emitter.emit('end', false);
      } else if ( params.url.error ) {
        emitter.emit('error', false);
      } else {
        emitter.emit('skip', false);
      }
    },
    dummy: function (previous, emitter) {
      emitter.emit('ready', true);
    },
    dumber: function (previous, emitter) {
      emitter.emit('ready', true);
    }
  }, function (output) {

    if ( output.listen.success ) {

      emitter.emit('ready', {
        content: output
      });

    } else {

      // console.log(output.listen);
      emitter.emit('error', output.listen);

    }

  });

}
