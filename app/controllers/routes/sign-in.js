// sign in controller

export const handler = async (params, request) => {
  params.form.forwardToUrl = params.form.forwardToUrl || params.session.ctzn_referer || request.headers.referer || app.config.comitium.baseUrl
  params.form.loginReferrer = request.headers.referer || app.config.comitium.baseUrl
  params.form.email = ''
  params.form.password = ''
  params.form.remember = false

  if (
    // If the referrer isn't local...
    params.form.forwardToUrl.search(app.config.comitium.baseUrl) < 0 ||
    // ...or the referrer is one of these...
    params.form.forwardToUrl.search(app.config.comitium.baseUrl + 'offline') >= 0 ||
    params.form.forwardToUrl.search(app.config.comitium.baseUrl + 'password-reset') >= 0 ||
    params.form.forwardToUrl.search(app.config.comitium.baseUrl + 'register') >= 0 ||
    params.form.forwardToUrl.search(app.config.comitium.baseUrl + 'resend-activation') >= 0 ||
    params.form.forwardToUrl.search(app.config.comitium.baseUrl + 'sign-in') >= 0 ||
    params.form.forwardToUrl.search(app.config.comitium.baseUrl + 'sign-out') >= 0 ||
    params.form.forwardToUrl.search(app.config.comitium.baseUrl + 'user/action/activate') >= 0
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


export const submit = async (params, request) => {
  // If it's a POST, authenticate the user
  if ( request.method === 'POST' ) {
    let authenticate = await app.models.user.authenticate({ email: params.form.email || params.session.email, password: params.form.password }),
        user = authenticate.user,
        cookie = {}

    if ( authenticate.success ) {
      user.user_id = authenticate.user.id
      delete user.id
      user.authenticated = true
      user.login_referrer = params.form.loginReferrer
      user.themePath = app.config.comitium.themes[user.theme] ? app.config.comitium.themes[user.theme].path : app.config.comitium.themes[Object.keys(app.config.comitium.themes)[0]].path

      if ( !params.cookie.comitium_id ) {
        cookie.comitium_id = {
          value: authenticate.user.username_hash,
          expires: params.form.remember ? 'never' : 'session'
        }
      }
      
      // This cookie is only necessary for guests
      cookie.comitium_active = {
        expires: 'now'
      }

      app.models.user.log({
        userID: user.user_id,
        action: 'Sign in',
        ip: app.helpers.util.ip(request.remoteAddress)
      })

      return {
        cookie: cookie,
        session: user,
        redirect: params.form.forwardToUrl
      }
    } else {
      return {
        view: params.form.authenticationMethod || 'sign-in',
        local: {
          authenticate: authenticate
        }
      }
    }
  // If it's a GET, redirect to the default action
  } else {
    return { redirect: '/sign-in' }
  }
}
