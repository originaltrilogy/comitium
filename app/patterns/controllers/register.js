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
  params.form.tos = false;

  emitter.emit('ready');
}


function form(params, context, emitter) {

  // If it's a POST, attempt to create the account
  if ( params.request.method === 'POST' ) {
    params.form.tos = params.form.tos || false;

    app.listen('waterfall', {
      register: function (emitter) {
        app.models.user.create(params.form, emitter);
      },
      mail: function (previous, emitter) {
        if ( previous.register.success ) {
          app.models.content.mail({
            template: 'Registration',
            replace: {
              activationUrl: app.config.comitium.baseUrl + 'user/action/activate/id/' + previous.register.id + '/activationCode/' + previous.register.activationCode,
              username: previous.register.username
            }
          }, emitter);
        } else {
          emitter.emit('ready', false);
        }
      }
    }, function (output) {
      if ( output.listen.success ) {
        if ( output.register.success ) {
          if ( output.mail.success ) {
            app.toolbox.mail.sendMail({
              from: app.config.comitium.email,
              to: output.register.email,
              subject: output.mail.subject,
              text: output.mail.text
            });
          }
          emitter.emit('ready', {
            redirect: app.config.comitium.basePath + 'register/action/complete'
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
