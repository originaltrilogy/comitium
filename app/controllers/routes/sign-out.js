// sign out controller

export const handler = (params, request) => {

  if ( params.session.user_id ) {
    app.models.user.log({
      userID: params.session.user_id,
      action: 'Sign out',
      ip: app.toolbox.helpers.ip(request)
    })
  }

  return {
    view: params.url.reason || 'sign-out',
    cookies: {
      comitium_id: {
        expires: 'now'
      }
    },
    session: {
      expires: 'now'
    }
  }
}
