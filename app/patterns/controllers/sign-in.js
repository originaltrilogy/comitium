// sign in controller

'use strict'

module.exports = {
  handler : handler,
  submit  : submit
}


function handler(params) {
  params.form.forwardToUrl = params.form.forwardToUrl || params.session.ctzn_referer || params.request.headers.referer || app.config.comitium.baseUrl
  params.form.loginReferrer = params.request.headers.referer || app.config.comitium.baseUrl
  params.form.email = ''
  params.form.password = ''
  params.form.remember = false

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
    params.form.forwardToUrl = app.config.comitium.baseUrl
  }

  // If the referrer only requires password authentication because the user has
  // the comitium_id cookie, render the authenticate view.
  return {
    view: params.url.password ? 'password' : 'sign-in'
  }
}


async function submit(params, context) {
  // If it's a POST, authenticate the user
  if ( params.request.method === 'POST' ) {
    let authenticate = await app.models.user.authenticate({ email: params.form.email || params.session.email, password: params.form.password }),
        user = authenticate.user,
        cookie = {}

    if ( authenticate.success ) {
      user.userID = authenticate.user.id
      user.authenticated = true
      user.loginReferrer = params.form.loginReferrer
      delete user.id

      if ( !params.cookie.comitium_id ) {
        cookie.comitium_id = {
          value: authenticate.user.usernameHash,
          expires: params.form.remember ? 'never' : 'session'
        }
      }
      
      // This cookie is only necessary for guests
      cookie.comitium_active = {
        expires: 'now'
      }

      app.models.user.log({
        userID: user.userID,
        action: 'Sign in',
        ip: app.toolbox.helpers.ip(params.request)
      })

      return {
        cookie: cookie,
        session: user,
        redirect: params.form.forwardToUrl
      }
    } else {
      return {
        view: params.form.authenticationMethod || 'sign-in',
        content: {
          authenticate: authenticate
        }
      }
    }
  // If it's a GET, fall back to the default action
  } else {
    return handler(params, context)
  }
}
