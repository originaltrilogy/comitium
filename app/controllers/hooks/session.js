// session event hooks


export const start = async (params, request) => {
  let cookie   = {},
      session   = {},
      active    ,
      ip        = app.helpers.util.ip(request.remoteAddress),
      bannedIP  = false

  // Check banned IP addresses
  let bannedIPs = await app.models.user.bannedIPs()

  // Check remote IP against banned IPs
  if ( bannedIPs.indexOf(ip) >= 0 ) {
    bannedIP = ip
  }

  // Proceed if IP isn't banned
  if ( !bannedIP ) {
    // If the user has cookies from a previous session, authenticate and start a new session.
    if ( params.cookie.comitium_id ) {
      let authenticate = await app.models.user.authenticate({ usernameHash: params.cookie.comitium_id })

      if ( authenticate.success ) {
        let user = await app.helpers.access.newMemberUpgrade(authenticate.user)

        user.user_id = user.id
        delete user.id
        user.ip = ip
        user.themePath = app.config.comitium.themes[user.theme] ? app.config.comitium.themes[user.theme].path : app.config.comitium.themes[Object.keys(app.config.comitium.themes)[0]].path

        app.models.user.log({
          userID: user.user_id,
          action: 'Session start (cookied)',
          ip: ip
        })

        return {
          cookie: {
            comitium_active: {
              expires: 'now'
            }
          },
          session: user
        }
      } else {
        return {
          cookie: {
            comitium_id: {
              expires: 'now'
            },
            comitium_active: {
              expires: 'now'
            }
          },
          session: {
            group_id: 1
          }
        }
      }
    } else {
      session.group_id = 1
      session.ip = ip
      session.themePath = app.config.comitium.themes[Object.keys(app.config.comitium.themes)[0]].path
      active = app.helpers.util.isoDate()
      cookie.comitium_active = {
        value: active,
        expires: 'never'
      }

      if ( params.cookie.comitium_active ) {
        session.last_activity = params.cookie.comitium_active
      } else {
        session.last_activity = active
      }

      session.date_format = 'MMMM D, YYYY'

      return {
        cookie: cookie,
        session: session
      }
    }
  // Throw an exception if the remote IP is banned
  // TODO: Create a banned IP view
  } else {
    let err = new Error('Your IP address (' + bannedIP + ') has been banned.')
    err.statusCode = 403
    throw err
  }
}
