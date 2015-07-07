// account controller

'use strict';

module.exports = {
  handler: handler
};


// default action
function handler(params, context, emitter) {

  if ( params.session.authenticated ) {
    var content = app.models.account.content();

    emitter.emit('ready', {
      content: content
    });
  } else {
    emitter.emit('ready', {
      redirect: app.config.main.basePath + 'sign-in/authenticate/true'
    });
  }

}
