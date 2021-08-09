// discussion model

export const announcements = async (discussionID) => {
  // See if already cached
  let cacheKey = 'discussion-' + discussionID,
      scope = 'announcements',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'discussion_announcements',
        text: 'select t.id, t.sticky, ( select count(*) from posts where topic_id = t.id ) - 1 as replies, t.locked_by_id, p.id as first_post_id, p2.id as last_post_id, t.title_html, t.url, p.created as post_date, p2.created as last_post_created, u.username as topic_starter, u.group_id as topic_starter_group_id, u.url as topic_starter_url, u2.username as last_post_author, u2.url as last_post_author_url ' +
        'from topics t ' +
        'join announcements a on t.id = a.topic_id and a.discussion_id = $1 ' +
        'join posts p on p.id = ( select id from posts where topic_id = t.id and draft = false order by created asc limit 1 ) ' +
        'join users u on u.id = p.user_id ' +
        'join posts p2 on p2.id = ( select id from posts where topic_id = t.id and draft = false order by created desc limit 1 ) ' +
        'join users u2 on u2.id = p2.user_id ' +
        'where t.draft = false ' +
        'order by t.sticky desc;',
        values: [ discussionID ]
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


export const info = async (discussionID) => {
  // See if already cached
  let cacheKey = 'info',
      scope = 'discussion-' + discussionID,
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'discussion_info',
        text: 'select c.id as category_id, c.title as category_title, c.description as category_description, d.id, d.title, d.url, d.description, d.meta_description, d.keywords, ( select count(*) from topics t where discussion_id = d.id and t.draft = false ) as topics, ( select count(*) from posts p join topics t on p.topic_id = t.id and t.draft = false where t.discussion_id = d.id ) as posts from discussions d left join categories c on d.category_id = c.id where d.id = $1;',
        values: [ discussionID ]
      })

      if ( result.rows.length ) {
        result.rows[0]['topicsFormatted'] = app.toolbox.numeral(result.rows[0].topics).format('0,0')

        // Cache the discussion info object for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: result.rows[0]
          })
        }

        return result.rows[0]
      } else {
        return false
      }
    } finally {
      client.release()
    }
  }
}


export const metaData = async (args) => {
  let discussionInfo = await info(args.discussionID)

  return {
    title       : discussionInfo.title + ' - ' + discussionInfo.categoryTitle + ' - Original Trilogy',
    description : discussionInfo.metaDescription,
    keywords    : discussionInfo.keywords
  }
}


export const topics = async (args) => {
  // See if already cached
  let start     = args.start || 0,
      end       = args.end || 25,
      cacheKey  = 'topics-' + start + '-' + end,
      scope     = 'discussion-' + args.discussionID,
      cached    = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'discussion_topics',
        text: 'select t.id, t.sticky, t.title_html, t.url, t.locked_by_id, p.created as post_date, ( select count(*) from posts where topic_id = t.id ) - 1 as replies, p2.id as last_post_id, p2.created as last_post_created, u.id as topic_starter_id, u.group_id as topic_starter_group_id, u.username as topic_starter, u.url as topic_starter_url, u2.id as last_post_author_id, u2.group_id as last_post_author_group_id, u2.username as last_post_author, u2.url as last_post_author_url ' +
        'from topics t ' +
        'join posts p on p.id = ( select id from posts where topic_id = t.id and draft = false order by created asc limit 1 ) ' +
        'join users u on u.id = p.user_id ' +
        'join posts p2 on p2.id = ( select id from posts where topic_id = t.id and draft = false order by created desc limit 1 ) ' +
        'join users u2 on u2.id = p2.user_id ' +
        'where t.discussion_id = $1 ' +
        'and t.draft = false and t.private = false ' +
        'order by t.sticky desc ' +
        'limit $2 offset $3;',
        values: [ args.discussionID, end - start, start ]
      })

      result.rows.forEach( function (item) {
        item.replies                      = parseInt(item.replies, 10)
        item.replies_formatted            = app.toolbox.numeral(item.replies).format('0,0')
        item.post_date_formatted          = app.toolbox.moment.tz(item.postDate, 'America/New_York').format('D-MMM-YYYY')
        item.last_post_created_formatted  = app.toolbox.moment.tz(item.lastPostCreated, 'America/New_York').format('D-MMM-YYYY')
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
