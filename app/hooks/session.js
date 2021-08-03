// session events

'use strict'

module.exports = {
  start : start
}


async function start(params, request) {
  let cookies   = {},
      session   = {},
      active    ,
      ip        = app.toolbox.helpers.ip(request),
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
      let authenticate  = await app.models.user.authenticate({ usernameHash: params.cookie.comitium_id }),
          user          = authenticate.user

      if ( authenticate.success ) {
        user.user_id = authenticate.user.id
        user.ip = ip
        delete user.id

        app.models.user.log({
          userID: user.user_id,
          action: 'Session start (cookied)',
          ip: ip
        })

        return {
          cookies: {
            comitium_active: {
              expires: 'now'
            }
          },
          session: user
        }
      } else {
        return {
          cookies: {
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
      active = app.toolbox.helpers.isoDate()
      cookies.comitium_active = {
        value: active,
        expires: 'never'
      }

      if ( params.cookie.comitium_active ) {
        session.last_activity = params.cookie.comitium_active
      } else {
        session.last_activity = active
      }

      return {
        cookies: cookies,
        session: session
      }
    }
  // Throw an exception if the remote IP is banned
  // TODO: Create a banned
  } else {
    let err = new Error('Your IP address (' + bannedIP + ') has been banned.')
    err.statusCode = 403
    throw err
  }
}
