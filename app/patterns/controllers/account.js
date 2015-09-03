// account controller

'use strict';

var // path = require('path'),
    gm = require('gm'),
    Markdown = require('markdown-it');

module.exports = {
  handler: handler,
  generalForm: generalForm,
  avatarForm: avatarForm
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
      markdown = new Markdown({
        breaks: true,
        linkify: true,
        typographer: true
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
              messages.password = 'Your password doesn\'t meet the minimum requirements (between 8 and 50 characters, anything but spaces).';
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
                            success: true,
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
      redirect: params.session.userID ? app.config.comitium.basePath + 'sign-in/password/true' : app.config.comitium.basePath + 'sign-in'
    });
  }

}



function avatarForm(params, context, emitter) {
  // For now, all avatars are converted to JPEG. Storing custom avatars has many complications
  // (topic caches, static file caches, etc.).

  // var extension, newExtension;

  if ( params.session.authenticated ) {
    if ( params.request.method === 'POST' ) {
      params.form.email = params.session.email;
      params.form.password = '';
      params.form.signature = params.session.signatureMarkdown;
      params.form.timezone = params.session.timezone;
      params.form.dateFormat = params.session.dateFormat;
      params.form.theme = params.session.theme;
      params.form.privateTopicEmailNotification = params.session.privateTopicEmailNotification;

      if ( params.form.avatar && params.form.avatar.size ) {
        // extension = path.extname(params.form.avatar.path).toLowerCase();
        // newExtension = extension === '.jpg' || extension === '.jpeg' || extension === '.png' || extension === '.gif' ? extension : '.jpg';

        gm(params.form.avatar.path).identify( function (err, stats) {
          var width, height,
              writeFile = app.config.citizen.directories.web + '/avatars/' + params.session.userID + '.jpg';

          if ( !stats ) {
            emitter.emit('ready', {
              content: {
                avatarForm: {
                  message: 'There was a problem with your upload, possibly because the file is corrupt.'
                }
              }
            });
          } else {
            width = stats.size.width;
            height = stats.size.height;

            if ( stats.format === 'GIF' && stats.Scene ) {
              emitter.emit('ready', {
                content: {
                  avatarForm: {
                    message: 'Animated GIFs aren\'t allowed.'
                  },
                  timezones: app.toolbox.moment.tz.names(),
                  themes: app.config.comitium.themes
                }
              });
            } else {
              if ( stats.size.width !== stats.size.height ) {
                if ( stats.size.width > stats.size.height ) {
                  width = stats.size.height;
                } else {
                  height = stats.size.width;
                }
              }

              gm(params.form.avatar.path)
                .gravity('Center')
                .crop(width, height)
                .resize(200, 200)
                .sharpen(10)
                .autoOrient()
                .noProfile()
                // .write(app.config.citizen.directories.web + '/avatars/' + params.session.userID + newExtension, function (err) {
                .write(writeFile, function (err) {
                  if ( err ) {
                    emitter.emit('error', err);
                  } else {
                    app.cache.clear({ file: writeFile });

                    emitter.emit('ready', {
                      content: {
                        avatarForm: {
                          success: true,
                          message: 'Your avatar was saved successfully!'
                        },
                        timezones: app.toolbox.moment.tz.names(),
                        themes: app.config.comitium.themes
                      }
                    });
                  }
                });
            }
          }
        });
      } else {
        emitter.emit('ready', {
          content: {
            avatarForm: {
              message: 'You need to specify a file to upload.'
            },
            timezones: app.toolbox.moment.tz.names(),
            themes: app.config.comitium.themes
          }
        });
      }
    } else {
      handler(params, context, emitter);
    }
  } else {
    emitter.emit('ready', {
      redirect: params.session.userID ? app.config.comitium.basePath + 'sign-in/password/true' : app.config.comitium.basePath + 'sign-in'
    });
  }
}
