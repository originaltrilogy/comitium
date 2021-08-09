// group model

export const discussionPermissions = async (discussionID, groupID) => {
  // See if already cached
  let cacheKey  = 'models-group-discussionPermissions-' + discussionID,
      scope     = 'group-' + groupID,
      cached    = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'group_discussionPermissions',
        text: 'select group_id, discussion_id, read, post, reply from discussion_permissions where group_id = $1 and discussion_id = $2;',
        values: [ groupID, discussionID ]
      })

      // Cache the result for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: result.rows[0]
        })
      }

      return result.rows[0]
    } finally {
      client.release()
    }
  }
}


export const info = async (groupID) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'group_info',
      text: 'select id, name, url, description, login, post, reply, talk_privately, moderate_discussions, administrate_discussions, moderate_users, administrate_users, administrate_app, bypass_lockdown, system, locked from groups where id = $1;',
      values: [ groupID ]
    })

    return result.rows[0]
  } finally {
    client.release()
  }
}
