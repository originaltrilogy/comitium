// discussion model

'use strict'

module.exports = {
  announcements : announcements,
  breadcrumbs   : breadcrumbs,
  info          : info,
  metaData      : metaData,
  topics        : topics
}


async function announcements(discussionID) {
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
        text: 'select t.id, t."sticky", ( select count(*) from posts where "topicID" = t."id" ) - 1 as replies, t."lockedByID", p.id as "firstPostID", p2.id as "lastPostID", t."titleHtml", t."url", p."created" as "postDate", p2."created" as "lastPostCreated", u."username" as "topicStarter", u."groupID" as "topicStarterGroupID", u."url" as "topicStarterUrl", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
        'from topics t ' +
        'join announcements a on t.id = a."topicID" and a."discussionID" = $1 ' +
        'join posts p on p.id = ( select id from posts where "topicID" = t.id and draft = false order by created asc limit 1 ) ' +
        'join users u on u.id = p."userID" ' +
        'join posts p2 on p2.id = ( select id from posts where "topicID" = t.id and draft = false order by created desc limit 1 ) ' +
        'join users u2 on u2.id = p2."userID" ' +
        'where t.draft = false ' +
        'order by t."sticky" desc;',
        values: [ discussionID ]
      })

      result.rows.forEach( function (item) {
        item['repliesFormatted'] = app.toolbox.numeral(item['replies']).format('0,0');
        item['postDateFormatted'] = app.toolbox.moment.tz(item['postDate'], 'America/New_York').format('D-MMM-YYYY');
        item['lastPostCreatedFormatted'] = app.toolbox.moment.tz(item['lastPostCreated'], 'America/New_York').format('D-MMM-YYYY');
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
      url: app.config.comitium.basePath + 'discussions'
    }
  }
}


async function info(discussionID) {
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
        text: 'select c.id as "categoryID", c."title" as "categoryTitle", c."description" as "categoryDescription", d.id, d."title", d."url", d."description", d."metaDescription", d."keywords", ( select count(*) from topics t where "discussionID" = d.id and t.draft = false ) as topics, ( select count(*) from posts p join topics t on p."topicID" = t.id and t.draft = false where t."discussionID" = d.id ) as posts from discussions d left join categories c on d."categoryID" = c.id where d."id" = $1;',
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


async function metaData(args) {
  let info = await this.info(args.discussionID)

  return {
    title       : info.title + ' - ' + info.categoryTitle + ' - Original Trilogy',
    description : info.metaDescription,
    keywords    : info.keywords
  }
}


async function topics(args) {
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
        text: 'select t."id", t."sticky", t."titleHtml", t."url", t."lockedByID", p."created" as "postDate", ( select count(*) from posts where "topicID" = t."id" ) - 1 as replies, p2.id as "lastPostID", p2."created" as "lastPostCreated", u."id" as "topicStarterID", u."groupID" as "topicStarterGroupID", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."id" as "lastPostAuthorID", u2."groupID" as "lastPostAuthorGroupID", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
        'from topics t ' +
        'join posts p on p."id" = ( select id from posts where "topicID" = t.id and draft = false order by created asc limit 1 ) ' +
        'join users u on u.id = p."userID" ' +
        'join posts p2 on p2."id" = ( select id from posts where "topicID" = t.id and draft = false order by created desc limit 1 ) ' +
        'join users u2 on u2.id = p2."userID" ' +
        'where t."discussionID" = $1 ' +
        'and t.draft = false and t.private = false ' +
        'order by t."sticky" desc ' +
        'limit $2 offset $3;',
        values: [ args.discussionID, end - start, start ]
      })

      result.rows.forEach( function (item) {
        item['repliesFormatted'] = app.toolbox.numeral(item['replies']).format('0,0')
        item['postDateFormatted'] = app.toolbox.moment.tz(item['postDate'], 'America/New_York').format('D-MMM-YYYY')
        item['lastPostCreatedFormatted'] = app.toolbox.moment.tz(item['lastPostCreated'], 'America/New_York').format('D-MMM-YYYY')
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
