// password-reset controller

'use strict';

module.exports = {
  handler: handler,
  form: form,
  confirmation: confirmation,
  reset: reset,
  resetForm: resetForm,
  resetConfirmation: resetConfirmation
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
  var message = '';
  
  params.form.email = params.form.email.trim() || '';
  
  if ( !params.form.email.length ) {
    message = 'Your e-mail address is required.';
  } else if ( !app.toolbox.validate.email(params.form.email) ) {
    message = 'That doesn\'t appear to be a properly formatted e-mail address. Please check your entry and try again.';
  } else {
    app.listen({
      user: function (emitter) {
        app.models.user.info({ email: params.form.email }, emitter);
      }
    }, function (output) {
      if ( output.user ) {
        app.listen('waterfall', {
          generateVerification: function (emitter) {
            app.models.user.passwordResetInsert({ userID: output.user.id }, emitter);
          },
          sendEmail: function (previous, emitter) {
            app.mail.sendMail({
              from: app.config.main.email,
              to: output.user.email,
              subject: 'Password reset instructions',
              text: params.route.parsed.protocol + app.config.main.baseUrl + 'password-reset/action/reset/id/' + output.user.id + '/code/' + previous.generateVerification.verificationCode
            });
          }
        });
      }
      emitter.emit('ready', {
        redirect: app.config.main.basePath + 'password-reset/action/confirmation'
      });
    });
  }

  if ( message.length ) {
    emitter.emit('ready', {
      content: {
        reset: {
          message: message
        }
      }
    });
  }

}



function confirmation(params, context, emitter) {
  emitter.emit('ready', {
    view: 'confirmation'
  });
}



function reset(params, context, emitter) {
  
}



function resetForm(params, context, emitter) {
  
}



function resetConfirmation(params, context, emitter) {
  emitter.emit('ready', {
    view: 'reset-confirmation'
  });
}