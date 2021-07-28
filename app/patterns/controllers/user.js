// user controller

'use strict'

module.exports = {
  handler   : handler,
  activate  : activate,
  ban       : ban,
  banIP     : banIP,
  head      : head,
  liftBan   : liftBan
}


async function handler(params) {
  params.url.page = params.url.page || 1

  let user = await app.models.user.profileByID({ userID: params.url.id, visitorGroupID: params.session.groupID })

  if ( user ) {
    let posts = await ( async () => {
      var start = ( params.url.page - 1 ) * 25,
            end = start + 25
      return await app.models.user.posts({
        userID: params.url.id,
        visitorGroupID: params.session.groupID,
        start: start,
        end: end
      })
    })()

    let ipHistory, matchingUsersByIP

    if ( params.url.id !== params.session.userID && params.session.moderateUsers ) {
      [
        ipHistory,
        matchingUsersByIP
      ] = await Promise.all([
        app.models.user.ipHistory({ userID: params.url.id }),
        ( async () => {
          if ( params.url.logID ) {
            return await app.models.user.matchingUsersByIP({ logID: params.url.logID })
          } else {
            return false
          }
        })()
      ])
    }

    return {
      public: {
        talkPrivately: params.session.talkPrivately && user.id !== params.session.userID,
        editProfile: user.id === params.session.userID,
        moderateUser: params.url.id !== params.session.userID && params.session.moderateUsers,
        user: user,
        posts: posts,
        ipHistory: ipHistory,
        matchingUsersByIP: matchingUsersByIP,
        pagination: app.toolbox.helpers.paginate(app.config.comitium.basePath + 'user/' + user.url + '/id/' + user.id, params.url.page, user.postCount)
      }
    }
  } else {
    let err = new Error
    err.statusCode = 404
    throw err
  }
}


async function activate(params) {
  let activate = await app.models.user.activate({
    id: params.url.id || false,
    activationCode: params.url.activationCode || false,
    reactivation: params.url.reactivation || false
  })

  if ( activate.success || ( !activate.success && activate.reason === 'accountAlreadyActivated' ) ) {
    return {
      view: 'activate',
      public: {
        activate: activate
      },
      include: {
        'sign-in': {
          controller: 'sign-in',
          view: 'sign-in-partial'
        }
      }
    }
  } else {
    return {
      view: 'activate',
      public: {
        activate: activate
      }
    }
  }
}


async function ban(params, request) {
  let access = await app.toolbox.access.userBan({ userID: params.url.id, user: params.session })

  if ( access === true ) {
    await app.models.user.ban({ userID: params.url.id })
    // End the banned user's session immediately
    app.session.end('userID', +params.url.id) // URL params are always strings, so cast to number
    return {
      redirect: request.headers.referer
    }
  } else {
    return access
  }
}


async function head(params) {
  return await app.models.user.metaData({ userID: params.url.id })
}


async function liftBan(params, request) {
  let access = await app.toolbox.access.userBan({ userID: params.url.id, user: params.session })

  if ( access === true ) {
    await app.models.user.liftBan({ userID: params.url.id })
    // End the user's session immediately
    app.session.end('userID', +params.url.id) // URL params are always strings, so cast to number
    return {
      redirect: request.headers.referer
    }
  } else {
    return access
  }
}


async function banIP(params, request) {
  let access = await app.toolbox.access.userIPBan({ user: params.session })

  if ( access === true ) {
    let log = await app.models.user.logByID({ logID: params.url.logID })

    await app.models.user.banIP({
      ip: log.ip,
      adminUserID: params.session.userID,
      time: app.toolbox.helpers.isoDate()
    })

    // End all active sessions with matching IPs
    app.session.end('ip', log.ip.replace('/32', ''))

    return {
      redirect: request.headers.referer
    }
  } else {
    return access
  }
}
