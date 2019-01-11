// announcements model

'use strict';

module.exports = {
  info: info,
  topics: topics,
  breadcrumbs: breadcrumbs,
  metaData: metaData
};



async function info(discussionID) {
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
        text: 'select c.id as "categoryID", c."title" as "categoryTitle", c."description" as "categoryDescription", d.id, d."title", d."url", d."description", d."topics", d."posts" from discussions d left join categories c on d."categoryID" = c.id where d."id" = $1;',
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



async function topics(args) {
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
        text: 'select distinct t."id", t."titleHtml", t."url", t."sticky", t."replies", p."id" as "firstPostID", p2."id" as "lastPostID", t."titleHtml", t."url", p."created" as "postDate", p2."created" as "lastPostCreated", u."id" as "topicStarterID", u."username" as "topicStarter", u."url" as "topicStarterUrl", u2."id" as "lastPostAuthorID", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
        'from topics t ' +
        'join announcements a on t."id" = a."topicID" ' +
        'join "discussionPermissions" dp on dp."discussionID" = a."discussionID" ' +
        'join posts p on p."id" = ( select id from posts where "topicID" = t.id and draft = false order by created asc limit 1 ) ' +
        'join users u on u."id" = p."userID" ' +
        'join posts p2 on p2."id" = ( select id from posts where "topicID" = t.id and draft = false order by created desc limit 1 ) ' +
        'join users u2 on u2."id" = p2."userID" ' +
        'where dp."groupID" = $1 and dp."read" = true and t."draft" = false and t.private = false ' +
        'order by t."sticky" desc ' +
        'limit $2 offset $3;',
        values: [ args.groupID, end - start, start ]
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



function breadcrumbs(discussionTitle) {
  return {
    a: {
      name: 'Home',
      url: app.config.comitium.basePath
    },
    b: {
      name: 'Discussion Categories',
      url: app.config.comitium.basePath + 'discussions'
    }
  };
}



function metaData() {
  return {
    title: 'Original Trilogy - Discussion Forum: Announcements',
    description: 'Important news and updates for the Original Trilogy community.',
    keywords: 'news, announcements'
  };
}
