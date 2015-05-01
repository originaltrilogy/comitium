// sign in controller

'use strict';

module.exports = {
  handler: handler,
  submit: submit
};


function handler(params, context, emitter) {
  params.form.forwardToUrl = params.form.forwardToUrl || params.session.ctzn_referer || params.request.headers.referer || app.config.main.baseUrl;
  params.form.loginReferrer = params.request.headers.referer || app.config.main.baseUrl;
  params.form.username = '';
  params.form.password = '';
  params.form.remember = false;

  if (
       // If the referrer isn't local...
       params.form.forwardToUrl.search(app.config.main.baseUrl) < 0 ||
       // ...or the referrer is one of these...
       params.form.forwardToUrl.search(app.config.main.baseUrl + '/sign-in') >= 0 ||
       params.form.forwardToUrl.search(app.config.main.baseUrl + '/sign-out') >= 0 ||
       params.form.forwardToUrl.search(app.config.main.baseUrl + '/register') >= 0 ||
       params.form.forwardToUrl.search(app.config.main.baseUrl + '/user/action/activate') >= 0
     ) {
    // ...forward the user to the forum home page after logging in.
    params.form.forwardToUrl = app.config.main.baseUrl;
  }

  emitter.emit('ready', {
    handoff: {
      controller: '+_layout'
    }
  });
}


function submit(params, context, emitter) {

  // If it's a POST, authenticate the user
  if ( params.request.method === 'POST' ) {

    app.listen({
      authenticate: function (emitter) {
        app.models.user.authenticate(params.form, emitter);
      }
    }, function (output) {
      var cookieExpires = 'session';

      if ( output.listen.success ) {

        if ( output.authenticate.success ) {
          if ( params.form.remember ) {
            cookieExpires = 'never';
          }
          emitter.emit('ready', {
            cookie: {
              comitium_username: {
                value: output.authenticate.user.username,
                expires: cookieExpires
              },
              comitium_password: {
                value: output.authenticate.user.passwordHash,
                expires: cookieExpires
              }
            },
            session: app.extend(output.authenticate.user, { loginReferrer: params.form.loginReferrer }),
            redirect: {
              url: params.form.forwardToUrl
            }
          });
        } else {
          emitter.emit('ready', {
            content: {
              authenticate: output.authenticate
            },
            handoff: {
              controller: '+_layout'
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
