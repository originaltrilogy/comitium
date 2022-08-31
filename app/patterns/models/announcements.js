// announcements model

export const info = async (discussionID) => {
  // See if this discussion info is already cached
  var cacheKey = 'info',
      scope = 'discussion-' + discussionID,
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    return cached
    // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'announcements_info',
        text: 'select c.id as category_id, c.title as category_title, c.description as category_description, d.id, d.title, d.url, d.description,  ( select count(*) from topics t where discussion_id = d.id and t.draft = false ) as topics, ( select count(*) from posts p join topics t on p.topic_id = t.id and t.draft = false where t.discussion_id = d.id ) as posts from discussions d left join categories c on d.category_id = c.id where d.id = $1;',
        values: [ discussionID ]
      })

      // Cache the categories object for future requests
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


export const topics = async (args) => {
  // See if already cached
  var start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'group-' + args.groupID + '-' + start + '-' + end,
      scope = 'discussion-2',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'announcements_topics',
        text: 'select distinct t.id, t.title_html, t.url, t.sticky, ( select count(*) from posts where topic_id = t.id ) - 1 as replies, p.id as first_post_id, p2.id as last_post_id, t.title_html, t.url, p.created as post_date, p2.created as last_post_created, u.id as topic_starter_id, u.username as topic_starter, u.url as topic_starter_url, u2.id as last_post_author_id, u2.username as last_post_author, u2.url as last_post_author_url ' +
        'from topics t ' +
        'join announcements a on t.id = a.topic_id ' +
        'join discussion_permissions dp on dp.discussion_id = a.discussion_id ' +
        'join posts p on p.id = ( select id from posts where topic_id = t.id and draft = false order by created asc limit 1 ) ' +
        'join users u on u.id = p.user_id ' +
        'join posts p2 on p2.id = ( select id from posts where topic_id = t.id and draft = false order by created desc limit 1 ) ' +
        'join users u2 on u2.id = p2.user_id ' +
        'where dp.group_id = $1 and dp.read = true and t.draft = false and t.private = false ' +
        'order by t.sticky desc ' +
        'limit $2 offset $3;',
        values: [ args.groupID, end - start, start ]
      })

      result.rows.forEach( function (item) {
        item.replies_formatted            = app.toolbox.numeral(item.replies).format('0,0')
        item.post_date_formatted          = app.toolbox.moment.tz(item.post_date, 'America/New_York').format('D-MMM-YYYY')
        item.last_post_created_formatted  = app.toolbox.moment.tz(item.last_post_created, 'America/New_York').format('D-MMM-YYYY')
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
      url: app.config.comitium.basePath + 'discussions'
    }
  }
}


export const metaData = () => {
  return {
    title: 'Announcements - Original Trilogy',
    description: 'Important news and updates for the Original Trilogy community.',
    keywords: 'news, announcements'
  }
}
