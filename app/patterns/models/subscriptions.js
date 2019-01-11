// subscriptions model

'use strict'

module.exports = {
  stats       : stats,
  topics      : topics,
  unread      : unread,
  breadcrumbs : breadcrumbs,
  metaData    : metaData
}


async function stats(userID) {
  // See if already cached
  let cacheKey = 'models-subscriptions-stats',
      scope = 'subscriptions-' + userID,
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'subscriptions_stats',
        text: 'select count("topicID") as "topics" from "topicSubscriptions" where "userID" = $1;',
        values: [ userID ]
      })

      result.rows[0]['topicsFormatted'] = app.toolbox.numeral(result.rows[0]['topics']).format('0,0')

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
        text: 'select p."topicID" from posts p join "topicSubscriptions" ts on ts."userID" = $1 and p."topicID" = ts."topicID" and p.id = ( select id from posts where "topicID" = ts."topicID" and "userID" <> $1 order by created desc limit 1 ) left join "topicViews" tv on ts."topicID" = tv."topicID" and tv."userID" = $1 where tv.time < p.created or tv.time is null;',
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
      const result = await client.query({
        name: 'subscriptions_topics',
        text: 'select t.id, t."discussionID", t."sticky", t."replies", t."titleHtml", t.url, p."created" as "postDate", p2.id as "lastPostID", p2."created" as "lastPostCreated", u."id" as "topicStarterID", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."id" as "lastPostAuthorID", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
        'from topics t ' +
        'join "topicSubscriptions" ts on ts."userID" = $1 ' +
        'join posts p on p."topicID" = ts."topicID" ' +
        'and p."id" = ( select id from posts where "topicID" = t.id and draft = false order by created asc limit 1 ) ' +
        'join users u on u.id = p."userID" ' +
        'join posts p2 on p2."topicID" = ts."topicID" ' +
        'and p2."id" = ( select id from posts where "topicID" = t.id and draft = false order by created desc limit 1 ) ' +
        'join users u2 on u2.id = p2."userID" ' +
        // Don't show topics that have been moved to the trash. If they're permanently deleted, the subscription will be also.
        'and t.draft = false and t."discussionID" <> 1 ' +
        'order by p2.created desc ' +
        'limit $2 offset $3;',
        values: [ args.userID, end - start, start ]
      })

      result.rows.forEach( function (item) {
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
