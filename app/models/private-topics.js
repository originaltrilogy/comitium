// private topics model

export const unread = async (args) => {
  // See if already cached
  let cacheKey = 'private-topics-unread',
      scope = 'private-topics-' + args.userID,
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.helpers.dbPool.connect()

    try {
      const result = await client.query({
        name: 'private_topics_unread',
        text: 'select p.topic_id from posts p join topic_invitations ti on ti.user_id = $1 and ti.left_topic = false and p.topic_id = ti.topic_id and p.id = ( select id from posts where topic_id = ti.topic_id and user_id <> $1 order by created desc limit 1 ) left join topic_views tv on ti.topic_id = tv.topic_id and tv.user_id = $1 where tv.time < p.created or tv.time is null;',
        values: [ args.userID ]
      })

      if ( result.rows.length ) {
        // Cache the result for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: result.rows
          })
        }
        return result.rows
      } else {
        return false
      }
    } finally {
      client.release()
    }
  }
}


export const topics = async (args) => {
  // See if already cached
  let start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'topics-' + start + '-' + end,
      scope = 'private-topics-' + args.userID,
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.helpers.dbPool.connect()

    try {
      // Baffled as to why the query planner insists on a much slower sequence scan
      await client.query('SET enable_seqscan = OFF;')
      const result = await client.query({
        name: 'private_topics_topics',
        text: 'select count(*) over() as full_count, t.id, t.sticky, t.replies, t.title_html, ti.accepted, ti.left_topic, p.created as post_date, p2.id as last_post_id, p2.created as last_post_created, u.id as topic_starter_id, u.username as topic_starter, u.group_id as topic_starter_group_id, u.url as topic_starter_url, u2.id as last_post_author_id, u2.username as last_post_author, u2.url as last_post_author_url ' +
        'from topics t ' +
        'join topic_invitations ti on ti.user_id = $1 ' +
        'and ti.left_topic = false ' +
        'join posts p on p.topic_id = ti.topic_id ' +
        'and p.id = ( select id from posts where topic_id = t.id and draft = false order by created asc limit 1 ) ' +
        'join users u on u.id = p.user_id ' +
        'join posts p2 on p2.topic_id = ti.topic_id ' +
        'and p2.id = ( select id from posts where topic_id = t.id and draft = false order by created desc limit 1 ) ' +
        'join users u2 on u2.id = p2.user_id ' +
        'and t.draft = false and t.private = true ' +
        'order by p2.created desc ' +
        'limit $2 offset $3;',
        values: [ args.userID, end - start, start ]
      })
      await client.query('SET enable_seqscan = ON;')

      result.rows.forEach( function (item) {
        item.full_count_formatted         = app.helpers.numeral(item.full_count).format('0,0')
        item.replies_formatted            = app.helpers.numeral(item.replies).format('0,0')
        item.post_date_formatted          = app.helpers.moment.tz(item.post_date, 'America/New_York').format('D-MMM-YYYY')
        item.last_post_created_formatted  = app.helpers.moment.tz(item.last_post_created, 'America/New_York').format('D-MMM-YYYY')
      })

      // Cache the result for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: result.rows
        })
      }

      return result.rows
    } finally {
      client.release()
    }
  }
}


export const breadcrumbs = () => {
  return {
    a: {
      name: 'Home',
      url: app.config.comitium.basePath
    },
    b: {
      name: 'Discussion Categories',
      url: 'discussions'
    }
  }
}


export const metaData = () => {
  return {
    title: 'Discussion View',
    description: 'This is the discussion view template.',
    keywords: 'discussion, view'
  }
}
