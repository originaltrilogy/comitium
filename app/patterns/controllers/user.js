// user controller

'use strict';

module.exports = {
  handler: handler,
  activate: activate
};


function handler(params, context, emitter) {
  // show the user's profile
}


function activate(params, context, emitter) {
  app.listen({
    activate: function (emitter) {
      app.models.user.activate({
        id: params.url.id || false,
        activationCode: params.url.activationCode || false
      }, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.activate.success || ( !output.activate.success && output.activate.reason === 'userAlreadyActivated' ) ) {

        emitter.emit('ready', {
          content: output,
          view: 'activate',
          handoff: {
            controller: 'sign-in',
            view: 'sign-in-partial'
          }
        });

      } else {

        emitter.emit('ready', {
          content: output,
          view: 'activate',
          handoff: {
            controller: '+_layout'
          }
        });

      }

    } else {

      emitter.emit('error', output.listen);

    }

  });

}
