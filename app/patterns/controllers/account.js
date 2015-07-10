// account controller

'use strict';

var Remarkable = require('remarkable');

module.exports = {
  handler: handler,
  generalForm: generalForm
};


// default action
function handler(params, context, emitter) {

  if ( params.session.authenticated ) {
    params.form.email = params.session.email;
    params.form.password = '';
    params.form.signature = params.session.signatureMarkdown;
    params.form.timezone = params.session.timezone;
    params.form.dateFormat = params.session.dateFormat;
    params.form.theme = params.session.theme;
    params.form.privateTopicEmailNotification = params.session.privateTopicEmailNotification;

    emitter.emit('ready', {
      content: {
        timezones: app.toolbox.moment.tz.names(),
        themes: app.config.comitium.themes
      }
    });
  } else {
    emitter.emit('ready', {
      redirect: params.session.userID ? app.config.comitium.basePath + 'sign-in/password/true' : app.config.comitium.basePath + 'sign-in'
    });
  }

}



function generalForm(params, context, emitter) {
  var email = '',
      password = '',
      signatureMarkdown = '',
      signatureHtml = '',
      markdown = new Remarkable({
        breaks: true,
        linkify: true
      }),
      methods = {},
      update = true,
      messages = {};

  if ( params.session.authenticated ) {
    if ( params.request.method === 'POST' ) {

      email = params.form.email.trim();
      password = params.form.password.trim();
      signatureMarkdown = params.form.signature.trim();

      app.listen('waterfall', {
        emailCheck: function (emitter) {
          if ( email.length && email !== params.session.email ) {
            if ( app.toolbox.validate.email(email) ) {
              emitter.emit('ready');
            } else {
              update = false;
              messages.email = 'The e-mail address you provided isn\'t valid.';
              emitter.emit('end');
            }
          } else {
            emitter.emit('end');
          }
        },
        emailExists: function (previous, emitter) {
          app.models.user.emailExists({
            email: email
          }, emitter);
        },
        createMethod: function (previous, emitter) {
          if ( previous.emailExists === false ) {
            methods.updateEmail = function (emitter) {
              app.models.user.updateEmail({
                userID: params.session.userID,
                email: email,
                deactivateUser: true
              }, emitter);
            };
            emitter.emit('ready');
          } else {
            update = false;
            messages.email = 'The e-mail address you provided is already in use.';
            emitter.emit('end');
          }
        }
      }, function (output) {

        if ( output.listen.success ) {
          if ( password.length ) {
            if ( app.toolbox.validate.password(password) ) {
              methods.updatePassword = function (emitter) {
                app.models.user.updatePassword({
                  userID: params.session.userID,
                  password: password
                }, emitter);
              };
            } else {
              update = false;
              messages.password = 'The password you entered doesn\'t meet the minimum requirements. It must be at least 8 characters long and may contain any characters except for spaces.';
            }
          }

          if ( update ) {

            if ( signatureMarkdown.length ) {
              signatureHtml = markdown.render(signatureMarkdown);
            }

            methods.updateSettings = function (emitter) {
              app.models.user.updateSettings({
                userID: params.session.userID,
                signatureMarkdown: signatureMarkdown,
                signatureHtml: signatureHtml,
                timezone: params.form.timezone,
                theme: params.form.theme,
                privateTopicEmailNotification: params.form.privateTopicEmailNotification || false
              }, emitter);
            };

            app.listen(methods, function (output) {
              if ( output.listen.success ) {
                if ( output.updateEmail ) {

                  app.mail.sendMail({
                    from: app.config.comitium.email,
                    to: email,
                    subject: 'Forum registration confirmation',
                    text: '<a href="' + params.route.parsed.protocol + app.config.comitium.baseUrl + 'user/action/activate/id/' + params.session.userID + '/activationCode/' + output.updateEmail.activationCode + '">Click here to activate your account</a>'
                  });

                  emitter.emit('ready', {
                    redirect: app.config.comitium.basePath + 'sign-out/reason/reactivation-required'
                  });
                } else {

                  app.listen({
                    user: function (emitter) {
                      app.models.user.info({
                        userID: params.session.userID
                      }, emitter);
                    }
                  }, function (output) {
                    var user = output.user;

                    if ( output.listen.success ) {
                      user.userID = output.user.id;
                      delete user.id;

                      emitter.emit('ready', {
                        // Update the user's session with their new settings
                        session: user,
                        content: {
                          general: {
                            messages: {
                              success: 'Your changes were saved.'
                            }
                          },
                          timezones: app.toolbox.moment.tz.names(),
                          themes: app.config.comitium.themes
                        }
                      });
                    } else {
                      emitter.emit('error', output.listen);
                    }

                  });

                }
              } else {
                emitter.emit('error', output.listen);
              }
            });
          } else {
            emitter.emit('ready', {
              content: {
                general: {
                  messages: messages
                },
                timezones: app.toolbox.moment.tz.names(),
                themes: app.config.comitium.themes
              }
            });
          }
        } else {
          emitter.emit('error', output.listen);
        }

      });

    // If it's a GET, fall back to the default topic start action
    } else {
      handler(params, context, emitter);
    }
  } else {
    emitter.emit('ready', {
      redirect: app.config.comitium.basePath + 'sign-in/authenticate/true'
    });
  }

}
