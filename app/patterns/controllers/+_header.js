// _header controller

export const handler = async (params) => {
  let unreadTopics, unreadPrivateTopics

  if ( params.session.username ) {
    [
      unreadTopics,
      unreadPrivateTopics
    ] = await Promise.all([
      app.models.subscriptions.unread({ userID: params.session.user_id }),
      app.models['private-topics'].unread({ userID: params.session.user_id })
    ])
  }

  return {
    public: {
      unread: {
        topics: unreadTopics,
        privateTopics: unreadPrivateTopics
      }
    }
  }
}
