// statistics model

'use strict'

module.exports = {
  firstPost : firstPost,
  posts     : posts,
  topics    : topics,
  users     : users
}


async function firstPost() {
  let cacheKey  = 'firstPost',
      scope     = 'stats',
      cached    = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    return cached
  // If it's not cached, retrieve the topic count and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'stats_firstPost',
        text: 'select min("created") as "created" from "posts" where "draft" = false;'
      })

      // Cache the categories object for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: result.rows[0].created
        })
      }
      return result.rows[0].created
    } finally {
      client.release()
    }
  }
}


async function posts() {
  let cacheKey  = 'posts',
      scope     = 'stats',
      cached    = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    return cached
  // If it's not cached, retrieve the topic count and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'stats_posts',
        text: 'select count(p."id") as "postCount" from "posts" p join "topics" t on p."topicID" = t."id" where t."discussionID" <> 0 and t."discussionID" <> 1 and t."draft" = false and p."draft" = false;'
      })

      // Cache the categories object for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: result.rows[0].postCount
        })
      }
      return result.rows[0].postCount
    } finally {
      client.release()
    }
  }
}


async function topics() {
  let cacheKey = 'topics',
      scope = 'stats',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    return cached
  // If it's not cached, retrieve the topic count and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'stats_topics',
        text: 'select count("id") as "topicCount" from "topics" where "discussionID" <> 0 and "discussionID" <> 1 and "draft" = false;'
      })

      // Cache the categories object for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: result.rows[0].topicCount
        })
      }
      return result.rows[0].topicCount
    } finally {
      client.release()
    }
  }
}


async function users() {
  let cacheKey  = 'users',
      scope     = 'stats',
      cached    = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    return cached
  // If it's not cached, retrieve the topic count and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'stats_users',
        text: 'select count("id") as "userCount" from "users" where "activated" = true;'
      })

      // Cache the categories object for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: result.rows[0].userCount
        })
      }
      return result.rows[0].userCount
    } finally {
      client.release()
    }
  }
}
