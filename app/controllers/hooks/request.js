// request event hooks


export const start = async (params) => {
  switch ( app.config.comitium.mode.status ) {
    // If full access is enabled, send the user on their way
    case 'online':
      // Check if url.id or url.page is a valid value when provided, throw a 404 if invalid
      if ( ( params.url.id && !app.helpers.validate.positiveInteger(params.url.id) ) || ( params.url.page && !app.helpers.validate.positiveInteger(params.url.page) ) ) {
        let err = new Error()
        err.statusCode = 404
        throw err
      }

      return
    // If the forum is offline, check the user's permissions
    case 'offline':
      // If moderators are allowed to bypass the offline mode, check permissions
      if ( app.config.comitium.mode.moderatorBypass ) {
        if ( params.session.authenticated ) {
          if ( params.session.moderate_discussions ) {
            return
          } else {
            return {
              redirect: params.route.controller === 'offline' ? {} : 'offline'
            }
          }
        } else {
          return {
            redirect: params.route.controller === 'sign-in' ? {} : 'sign-in'
          }
        }
      } else {
        return {
          redirect: params.route.controller === 'offline' ? {} : 'offline'
        }
      }
  }
}
