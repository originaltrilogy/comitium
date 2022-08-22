// _header controller

export const handler = async (params) => {
  if ( !params.session.username ) {
    return {
      public: {
        logo: app.resources.images.logoHorizontal
      }
    }
  } else {
    let [
      unreadTopics,
      unreadPrivateTopics
    ] = await Promise.all([
      app.models.subscriptions.unread({ userID: params.session.user_id }),
      app.models['private-topics'].unread({ userID: params.session.user_id })
    ])

    return {
      public: {
        unread: {
          topics: unreadTopics,
          privateTopics: unreadPrivateTopics
        },
        logo: app.resources.images.logoHorizontal
      }
    }
  }
}
