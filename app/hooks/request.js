// request event hooks


export const start = (params) => {
  switch ( app.config.comitium.mode.status ) {
    // If full access is enabled, send the user on their way
    case 'online':
      return
    // If the forum is offline, check the user's permissions
    case 'offline':
      // If moderators are allowed to bypass the offline mode, check permissions
      if ( app.config.comitium.mode.moderatorBypass ) {
        if ( params.session.authenticated ) {
          if ( params.session.moderateDiscussions ) {
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
