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
        if ( previous.validateForm.success ) {
          app.models.user.info({ email: params.form.email }, emitter);
        } else {
          emitter.emit('end');
        }
      },
      generateVerification: function (previous, emitter) {
        var ip = app.toolbox.helpers.ip(params.request);

        if ( previous.user ) {
          app.models.user.passwordResetInsert({
            userID: previous.user.id,
            ip: ip
          }, emitter);
        } else {
          emitter.emit('end', {
            success: false,
            message: 'The e-mail address you provided doesn\'t exist in our system. Please check it and try again.'
          });
        }
      },
      mail: function (previous, emitter) {
        if ( previous.generateVerification.success ) {
          app.models.content.mail({
            template: 'Password Reset',
            replace: {
              resetUrl: params.route.parsed.protocol + app.config.comitium.baseUrl + 'password-reset/action/reset/id/' + previous.user.id + '/code/' + previous.generateVerification.verificationCode
            }
          }, emitter);
        } else {
          emitter.emit('ready', false);
        }
      }
    }, function (output) {
      if ( output.listen.success ) {
        if ( output.validateForm.success ) {
          if ( output.generateVerification.success ) {
            if ( output.mail.success ) {
              app.toolbox.mail.sendMail({
                from: app.config.comitium.email,
                to: output.user.email,
                subject: output.mail.subject,
                text: output.mail.text
              });
            }

            emitter.emit('ready', {
              redirect: app.config.comitium.basePath + 'password-reset/action/confirmation'
            });
          } else {
            emitter.emit('ready', {
              content: {
                reset: {
                  message: output.generateVerification.message
                }
              }
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
    var view = 'reset';

    if ( output.verify ) {
      if ( app.toolbox.moment(Date.now()).diff(output.verify.timeRequested, 'hours') >= 24 ) {
        view = 'expired';
      }
    } else {
      view = 'invalid';
    }

    emitter.emit('ready', {
      view: view
    });
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
        message = 'Your password doesn\'t meet the minimum requirements (between 8 and 50 characters, anything but spaces).';
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
        controller: 'sign-in',
        view: 'sign-in-partial'
      }
    }
  });
}
