// private topics model

'use strict'

module.exports = {
  topics      : topics,
  unread      : unread,
  breadcrumbs : breadcrumbs,
  metaData    : metaData
}


async function unread(args) {
  // See if already cached
  let cacheKey = 'private-topics-unread',
      scope = 'private-topics-' + args.userID,
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'private_topics_unread',
        text: 'select p."topicID" from posts p join "topicInvitations" ti on ti."userID" = $1 and ti."left" = false and p."topicID" = ti."topicID" and p.id = ( select id from posts where "topicID" = ti."topicID" and "userID" <> $1 order by created desc limit 1 ) left join "topicViews" tv on ti."topicID" = tv."topicID" and tv."userID" = $1 where tv.time < p.created or tv.time is null;',
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
      scope = 'private-topics-' + args.userID,
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
        name: 'private_topics_topics',
        text: 'select count(*) over() as full_count, t.id, t."sticky", t."replies", t."titleHtml", ti.accepted, ti.left, p."created" as "postDate", p2.id as "lastPostID", p2."created" as "lastPostCreated", u."id" as "topicStarterID", u."username" as "topicStarter", u."groupID" as "topicStarterGroupID", u."url" as "topicStarterUrl", u2."id" as "lastPostAuthorID", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
        'from topics t ' +
        'join "topicInvitations" ti on ti."userID" = $1 ' +
        'and ti.left = false ' +
        'join posts p on p."topicID" = ti."topicID" ' +
        'and p."id" = ( select id from posts where "topicID" = t.id and draft = false order by created asc limit 1 ) ' +
        'join users u on u.id = p."userID" ' +
        'join posts p2 on p2."topicID" = ti."topicID" ' +
        'and p2."id" = ( select id from posts where "topicID" = t.id and draft = false order by created desc limit 1 ) ' +
        'join users u2 on u2.id = p2."userID" ' +
        'and t.draft = false and t.private = true ' +
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
    },
    b: {
      name: 'Discussion Categories',
      url: 'discussions'
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
