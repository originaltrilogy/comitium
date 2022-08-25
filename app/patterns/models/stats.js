// statistics model

export const firstPost = async () => {
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
        text: 'select min(created) as created from posts where draft = false;'
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


export const posts = async () => {
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
        text: 'select count(p.id) as post_count from posts p join topics t on p.topic_id = t.id where t.discussion_id <> 0 and t.discussion_id <> 1 and t.draft = false and p.draft = false;'
      })

      // Cache the categories object for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: result.rows[0].post_count
        })
      }
      return result.rows[0].post_count
    } finally {
      client.release()
    }
  }
}


export const topics = async () => {
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
        text: 'select count(id) as topic_count from topics where discussion_id <> 0 and discussion_id <> 1 and draft = false;'
      })

      // Cache the categories object for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: result.rows[0].topic_count
        })
      }
      return result.rows[0].topic_count
    } finally {
      client.release()
    }
  }
}


export const users = async () => {
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
        text: 'select count(id) as user_count from users where activated = true;'
      })

      // Cache the categories object for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: result.rows[0].user_count
        })
      }
      return result.rows[0].user_count
    } finally {
      client.release()
    }
  }
}
