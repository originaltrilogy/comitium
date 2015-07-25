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

  emitter.emit('ready');
}



function form(params, context, emitter) {
  
  if ( params.request.method === 'POST' ) {
    params.form.email = params.form.email.trim() || '';

    app.listen('waterfall', {
      validateForm: function (emitter) {
        var message = '';
        
        if ( !params.form.email.length ) {
          message = 'Your e-mail address is required.';
        } else if ( !app.toolbox.validate.email(params.form.email) ) {
          message = 'That doesn\'t appear to be a properly formatted e-mail address. Please check your entry and try again.';
        }
        
        if ( message.length ) {
          emitter.emit('end', {
            success: false,
            message: message
          });
        } else {
          emitter.emit('ready', {
            success: true
          });
        }
      },
      user: function (previous, emitter) {
        app.models.user.info({ email: params.form.email }, emitter);
      }
    }, function (output) {
      var ip = app.toolbox.helpers.ip(params.request);
      
      if ( output.listen.success ) {
        if ( output.validateForm.success ) {
          if ( output.user ) {
            
            app.listen('waterfall', {
              generateVerification: function (emitter) {
                app.models.user.passwordResetInsert({
                  userID: output.user.id,
                  ip: ip
                 }, emitter);
              },
              sendEmail: function (previous, emitter) {
                app.mail.sendMail({
                  from: app.config.comitium.email,
                  to: output.user.email,
                  subject: 'Password reset instructions',
                  text: params.route.parsed.protocol + app.config.comitium.baseUrl + 'password-reset/action/reset/id/' + output.user.id + '/code/' + previous.generateVerification.verificationCode
                });
              }
            });
            
            emitter.emit('ready', {
              redirect: app.config.comitium.basePath + 'password-reset/action/confirmation'
            });
          }
        } else {
          emitter.emit('ready', {
            content: {
              reset: {
                message: output.validateForm.message
              }
            }
          });
        }
      } else {
        emitter.emit('error', output.listen);
      }
    });
  } else {
    handler(params, context, emitter);
  }


}



function confirmation(params, context, emitter) {
  emitter.emit('ready', {
    view: 'confirmation'
  });
}



function reset(params, context, emitter) {
  params.form.password = '';
  params.form.verifyPassword = '';
  
  app.listen({
    verify: function (emitter) {
      app.models.user.passwordResetVerify({
        userID: params.url.id,
        verificationCode: params.url.code
      }, emitter);
    }
  }, function (output) {
    if ( output.verify ) {
      emitter.emit('ready', {
        view: 'reset'
      });
    } else {
      emitter.emit('ready', {
        view: 'invalid'
      });
    }
  });
}



function resetForm(params, context, emitter) {

  app.listen('waterfall', {
    validateForm: function (emitter) {
      var message = '';
      
      if ( !params.form.password.length || !params.form.verifyPassword.length ) {
        message = 'All fields are required.';
      } else if ( params.form.password !== params.form.verifyPassword ) {
        message = 'The passwords you entered don\'t match.';
      } else if ( !app.toolbox.validate.password(params.form.password) ) {
        message = 'The password you entered is invalid. It must be at least 8 characters, and can contain anything but spaces. Keep in mind that passwords are case-sensitive.';
      }
      
      if ( message.length ) {
        emitter.emit('end', {
          success: false,
          message: message
        })
      } else {
        emitter.emit('ready', {
          success: true
        });
      }
    },
    verify: function (previous, emitter) {
      app.models.user.passwordResetVerify({
        userID: params.url.id,
        verificationCode: params.url.code
      }, emitter);
    },
    updatePassword: function (previous, emitter) {
      if ( previous.verify ) {
        app.models.user.updatePassword({
          userID: params.url.id,
          password: params.form.password
        }, emitter);
      } else {
        emitter.emit('ready', false);
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.validateForm.success ) {
        if ( output.verify && output.updatePassword ) {
          emitter.emit('ready', {
            redirect: app.config.comitium.basePath + 'password-reset/action/resetConfirmation'
          });
        } else {
          emitter.emit('ready', {
            view: 'invalid'
          });
        }
      } else {
        emitter.emit('ready', {
          view: 'reset',
          content: {
            reset: {
              message: output.validateForm.message
            }
          }
        });
      }
      
    } else {
      emitter.emit('error', output.listen);
    }
  });
  
}



function resetConfirmation(params, context, emitter) {
  emitter.emit('ready', {
    view: 'reset-confirmation',
    include: {
      'sign-in': {
        controller: 'sign-in'
      }
    }
  });
}
