// subscriptions model

'use strict'

module.exports = {
  topics      : topics,
  unread      : unread,
  breadcrumbs : breadcrumbs,
  metaData    : metaData
}


async function unread(args) {
  // See if already cached
  let cacheKey = 'models-subscriptions-unread',
      scope = 'subscriptions-' + args.userID,
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'subscriptions_unread',
        text: 'select p.topic_id from posts p join topic_subscriptions ts on ts.user_id = $1 and p.topic_id = ts.topic_id and p.id = ( select id from posts where topic_id = ts.topic_id and user_id <> $1 order by created desc limit 1 ) left join topic_views tv on ts.topic_id = tv.topic_id and tv.user_id = $1 where tv.time < p.created or tv.time is null;',
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


async function topics(args) {
  // See if already cached
  let start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'topics-' + start + '-' + end,
      scope = 'subscriptions-' + args.userID,
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      // Baffled as to why the query planner insists on a much slower sequence scan
      await client.query('SET enable_seqscan = OFF;')
      const result = await client.query({
        name: 'subscriptions_topics',
        text: 'select count(*) over() as full_count, t.id, t.discussion_id, t.sticky, t.replies, t.title_html, t.url, p.created as "postDate", p2.id as "lastPostID", p2.created as "lastPostCreated", u.id as "topicStarterID", u.username as "topicStarter", u.url as "topicStarterUrl", u2.id as "lastPostAuthorID", u2.username as "lastPostAuthor", u2.url as "lastPostAuthorUrl" ' +
        'from topics t ' +
        'join topic_subscriptions ts on ts.user_id = $1 ' +
        'join posts p on p.topic_id = ts.topic_id ' +
        'and p.id = ( select id from posts where topic_id = t.id and draft = false order by created asc limit 1 ) ' +
        'join users u on u.id = p.user_id ' +
        'join posts p2 on p2.topic_id = ts.topic_id ' +
        'and p2.id = ( select id from posts where topic_id = t.id and draft = false order by created desc limit 1 ) ' +
        'join users u2 on u2.id = p2.user_id ' +
        // Don't show topics that have been moved to the trash. If they're permanently deleted, the subscription will be also.
        'and t.draft = false and t.discussion_id <> 1 ' +
        'order by p2.created desc ' +
        'limit $2 offset $3;',
        values: [ args.userID, end - start, start ]
      })
      await client.query('SET enable_seqscan = ON;')

      result.rows.forEach( function (item) {
        item['full_count_formatted']      = app.toolbox.numeral(item['full_count']).format('0,0')
        item['repliesFormatted']          = app.toolbox.numeral(item['replies']).format('0,0')
        item['postDateFormatted']         = app.toolbox.moment.tz(item['postDate'], 'America/New_York').format('D-MMM-YYYY')
        item['lastPostCreatedFormatted']  = app.toolbox.moment.tz(item['lastPostCreated'], 'America/New_York').format('D-MMM-YYYY')
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


function breadcrumbs() {
  return {
    a: {
      name: 'Home',
      url: app.config.comitium.basePath
    }
  }
}


function metaData() {
  return {
    title: 'Discussion View',
    description: 'This is the discussion view template.',
    keywords: 'discussion, view'
  }
}
