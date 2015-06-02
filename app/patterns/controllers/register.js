// register controller

'use strict';

module.exports = {
  handler: handler,
  form: form,
  complete: complete
};


function handler(params, context, emitter) {
  params.form.username = '';
  params.form.email = '';
  params.form.password = '';
  params.form.verifyPassword = '';
  params.form.tos = false;

  emitter.emit('ready', {
    handoff: {
      controller: '+_layout'
    }
  });
}


function form(params, context, emitter) {

  // If it's a POST, attempt to create the account
  if ( params.request.method === 'POST' ) {
    params.form.tos = params.form.tos || false;

    app.listen({
      register: function (emitter) {
        app.models.user.create(params.form, emitter);
      }
    }, function (output) {
      var email = {};

      if ( output.listen.success ) {

        if ( output.register.success ) {
          email.text = '<a href="' + app.config.main.baseUrl + 'user/action/activate/id/' + output.register.id + '/activationCode/' + output.register.activationCode + '">Click here to activate your account</a>';

          app.mail.sendMail({
            from: app.config.main.email,
            to: output.register.email,
            subject: 'Forum registration confirmation',
            text: email.text
          });

          emitter.emit('ready', {
            redirect: app.config.main.basePath + 'register/action/complete'
          });
        } else {
          emitter.emit('ready', {
            content: {
              register: output.register
            }
          });
        }

      } else {

        emitter.emit('error', output.listen);

      }

    });
  // If it's a GET, fall back to the default action
  } else {
    handler(params, context, emitter);
  }
}


function complete(params, context, emitter) {
  emitter.emit('ready', {
    view: 'complete'
  });
}
