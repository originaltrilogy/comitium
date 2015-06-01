// password-reset controller

'use strict';

module.exports = {
  handler: handler,
  form: form
};


// default action
function handler(params, context, emitter) {

  params.form.email = '';

  emitter.emit('ready', {
    handoff: {
      controller: '+_layout'
    }
  });

}



function form(params, context, emitter) {

  params.form.email = params.form.email || '';

  if ( !params.form.email.length ) {
    emitter.emit('ready', {
      content: {
        reset: {
          message: 'Your e-mail address is required.'
        }
      },
      handoff: {
        controller: '+_layout'
      }
    });
  }

}
