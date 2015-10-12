// sign in controller

'use strict';

module.exports = {
  handler: handler,
  submit: submit
};


function handler(params, context, emitter) {
  params.form.forwardToUrl = params.form.forwardToUrl || params.session.ctzn_referer || params.request.headers.referer || app.config.comitium.baseUrl;
  params.form.loginReferrer = params.request.headers.referer || app.config.comitium.baseUrl;
  params.form.email = '';
  params.form.password = '';
  params.form.remember = false;

  if (
       // If the referrer isn't local...
       params.form.forwardToUrl.search(app.config.comitium.baseUrl) < 0 ||
       // ...or the referrer is one of these...
       params.form.forwardToUrl.search(app.config.comitium.baseUrl + 'sign-in') >= 0 ||
       params.form.forwardToUrl.search(app.config.comitium.baseUrl + 'sign-out') >= 0 ||
       params.form.forwardToUrl.search(app.config.comitium.baseUrl + 'register') >= 0 ||
       params.form.forwardToUrl.search(app.config.comitium.baseUrl + 'user/action/activate') >= 0 ||
       params.form.forwardToUrl.search(app.config.comitium.baseUrl + 'password-reset') >= 0 ||
       params.form.forwardToUrl.search(app.config.comitium.baseUrl + 'offline') >= 0
     ) {
    // ...forward the user to the forum home page after logging in.
    params.form.forwardToUrl = app.config.comitium.baseUrl;
  }

  // If the referrer only requires password authentication because the user has
  // the comitium_id cookie, render the authenticate view.
  emitter.emit('ready', {
    view: params.url.password ? 'password' : 'sign-in'
  });

}


function submit(params, context, emitter) {

  // If it's a POST, authenticate the user
  if ( params.request.method === 'POST' ) {

    app.listen({
      authenticate: function (emitter) {
        app.models.user.authenticate({
          email: params.form.email || params.session.email,
          password: params.form.password
        }, emitter);
      }
    }, function (output) {
      var user = output.authenticate.user,
          cookieExpires = 'session';

      if ( output.listen.success ) {

        if ( output.authenticate.success ) {
          user.userID = output.authenticate.user.id;
          delete user.id;

          if ( params.form.remember ) {
            cookieExpires = 'never';
          }

          app.models.user.log({
            userID: user.userID,
            action: 'Sign in',
            ip: app.toolbox.helpers.ip(params.request)
          });

          emitter.emit('ready', {
            cookie: {
              comitium_id: {
                value: output.authenticate.user.usernameHash,
                expires: cookieExpires
              },
              comitium_active: {
                expires: 'now'
              }
            },
            session: app.extend(user, { authenticated: true, loginReferrer: params.form.loginReferrer }),
            redirect: {
              url: params.form.forwardToUrl
            }
          });
        } else {
          emitter.emit('ready', {
            view: params.form.authenticationMethod || 'sign-in',
            content: {
              authenticate: output.authenticate
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
