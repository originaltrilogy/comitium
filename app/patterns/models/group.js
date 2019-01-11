// group model

'use strict'

module.exports = {
  discussionPermissions : discussionPermissions,
  info                  : info,
  memberCount           : memberCount
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
    } catch (err) {
      throw err
    } finally {
      client.release()
    }
  }
}


async function info(groupID) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'group_info',
      text: 'select id, name, url, description, login, post, reply, "talkPrivately", "moderateDiscussions", "administrateDiscussions", "moderateUsers", "administrateUsers", "administrateApp", "bypassLockdown", system, locked from groups where id = $1;',
      values: [ groupID ]
    })

    return result.rows[0]
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}


async function memberCount(groupID) {
  // See if already cached
  let cacheKey = 'memberCount-' + groupID,
      scope = 'group',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'group_memberCount',
        text: 'select count(id) as count from users where "groupID" = $1 and activated = true;',
        values: [ groupID ]
      })

      // Cache the result for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: result.rows[0].count
        })
      }

      return result.rows[0].count
    } catch (err) {
      throw err
    } finally {
      client.release()
    }
  }
}
