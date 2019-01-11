// _header controller

'use strict'

module.exports = {
  handler : handler
}


async function handler(params) {
  if ( !params.session.username ) {
    return {
      content: {
        logo: app.resources.images.logoHorizontal
      }
    }
  } else {
    let [
      unreadTopics,
      unreadPrivateTopics
    ] = await Promise.all([
      app.models.subscriptions.unread({ userID: params.session.userID }),
      app.models['private-topics'].unread({ userID: params.session.userID })
    ])

    return {
      content: {
        unread: {
          topics: unreadTopics,
          privateTopics: unreadPrivateTopics
        },
        logo: app.resources.images.logoHorizontal
      }
    }
  }
}
