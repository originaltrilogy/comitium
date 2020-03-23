// session events

'use strict'

module.exports = {
  start : start
}


async function start(params) {
  let cookie    = {},
      session   = {},
      active    ,
      ip        = app.toolbox.helpers.ip(params.request),
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
        user.userID = authenticate.user.id
        user.ip = ip
        delete user.id

        app.models.user.log({
          userID: user.userID,
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
            groupID: 1,
            theme: 'Default'
          }
        }
      }
    } else {
      session.groupID = 1
      session.ip = ip
      session.theme = 'Default'
      active = app.toolbox.helpers.isoDate()
      cookie.comitium_active = {
        value: active,
        expires: 'never'
      }

      if ( params.cookie.comitium_active ) {
        session.lastActivity = params.cookie.comitium_active
      } else {
        session.lastActivity = active
      }

      return {
        cookie: cookie,
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
