// group model

'use strict'

module.exports = {
  discussionPermissions : discussionPermissions
}


async function discussionPermissions(discussionID, groupID) {
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
        text: 'select "groupID", "discussionID", "read", "post", "reply" from "discussionPermissions" where "groupID" = $1 and "discussionID" = $2;',
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
