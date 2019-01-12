// members model

'use strict'

module.exports = {
  all         : all,
  breadcrumbs : breadcrumbs,
  group       : group,
  groupCount  : groupCount,
  groups      : groups,
  metaData    : metaData,
  search      : search
}


async function all(args) {
  let start = args.start || 0,
      end = args.end || 25,
      orderSort = ''
  
  // Protect against bad URL parameters
  if ( args.sort !== 'asc' && args.sort !== 'desc' ) {
    args.sort = 'asc'
  }
  
  switch ( args.order ) {
    case 'username':
      orderSort = 'username ' + ( args.sort || 'asc' )
      break
    case 'join-date':
      orderSort = 'joined ' + ( args.sort || 'desc' )
      break
    case 'last-active':
      orderSort = '"lastActivity" ' + ( args.sort || 'desc' )
      break
    // Protect against bad URL parameters
    default:
      orderSort = 'username asc'
  }

  // See if already cached
  let cacheKey = 'all-' + start + '-' + end + '-' + orderSort.replace(' ', '-'),
      scope = 'members',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'members_all_' + orderSort.replace(' ', '_'),
        text: 'select count(*) OVER() AS full_count, u.id, u.username, u.url, u.joined, u."lastActivity", g.name, g.url from users u join groups g on u."groupID" = g.id where u.activated = true order by ' + orderSort + ' limit $1 offset $2;',
        values: [ end - start, start ]
      })

      result.rows.forEach( function (item) {
        item['joinedFormatted'] = app.toolbox.moment.tz(item['joined'], 'America/New_York').format('D-MMM-YYYY')
        // item['createdFormatted'] = item['createdFormatted'].replace(/ (AM|PM)/, '&nbsp;$1')
        item['lastActivityFormatted'] = app.toolbox.moment.tz(item['lastActivity'], 'America/New_York').format('D-MMM-YYYY')
        // item['modifiedFormatted'] = item['modifiedFormatted'].replace(/ (AM|PM)/, '&nbsp;$1')
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
    } catch (err) {
      throw err
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
      name: 'Member List',
      url: 'members'
    }
  }
}


async function group(args) {
  let start = args.start || 0,
      end = args.end || 25,
      orderSort = ''
  
  // Protect against bad URL parameters
  if ( args.sort !== 'asc' && args.sort !== 'desc' ) {
    args.sort = 'asc'
  }
  
  switch ( args.order ) {
    case 'username':
      orderSort = 'username ' + ( args.sort || 'asc' )
      break
    case 'join-date':
      orderSort = 'joined ' + ( args.sort || 'desc' )
      break
    case 'last-active':
      orderSort = '"lastActivity" ' + ( args.sort || 'desc' )
      break
    // Protect against bad URL parameters
    default:
      orderSort = 'username asc'
  }

  // See if already cached
  let cacheKey = 'group-' + args.group + '-' + start + '-' + end + '-' + orderSort.replace(' ', '-'),
      scope = 'members',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'members_group_' + orderSort.replace(' ', '_'),
        text: 'select count(*) OVER() AS full_count, u.id, u.username, u.url, u.joined, u."lastActivity", g.name, g.url from users u join groups g on u."groupID" = g.id where g.id = $1 and u.activated = true order by ' + orderSort + ' limit $2 offset $3;',
        values: [ args.group, end - start, start ]
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
    } catch (err) {
      throw err
    } finally {
      client.release()
    }
  }
}


async function groupCount(groupID) {
  // See if already cached
  let cacheKey = 'count-' + groupID,
      scope = 'members',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'members_groupCount',
        text: 'select count(id) as count from users where "groupID" = $1;',
        values: [ groupID ]
      })

      // Cache the result for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: result.rows[0].count
        })
      }

      return result.rows[0].count
    } catch (err) {
      throw err
    } finally {
      client.release()
    }
  }
}


async function groups() {
  // See if already cached
  let cacheKey = 'groups',
      scope = 'members',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'members_groups',
        text: 'select * from groups where id <> 1 order by id asc'
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
    } catch (err) {
      throw err
    } finally {
      client.release()
    }
  }
}


function metaData() {
  return {
    title: 'Member List - Original Trilogy',
    description: 'List of forum members at originaltrilogy.com',
    keywords: ''
  }
}


async function search(args) {
  let start = args.start || 0,
      end = args.end || 25,
      orderSort = ''
  
  // Protect against bad URL parameters
  if ( args.sort !== 'asc' && args.sort !== 'desc' ) {
    args.sort = 'asc'
  }
  
  switch ( args.order ) {
    case 'username':
      orderSort = 'username ' + ( args.sort || 'asc' )
      break
    case 'join-date':
      orderSort = 'joined ' + ( args.sort || 'desc' )
      break
    case 'last-active':
      orderSort = '"lastActivity" ' + ( args.sort || 'desc' )
      break
    // Protect against bad URL parameters
    default:
      orderSort = 'username asc'
  }

  // // See if already cached
  // let cacheKey = 'search-' + '-' + start + '-' + end + '-' + orderSort.replace(' ', '-'),
  //     scope = 'members',
  //     cached = app.cache.get({ scope: scope, key: cacheKey })

  // // If it's cached, return the cache item
  // if ( cached ) {
  //   return cached
  // // If it's not cached, retrieve it from the database and cache it
  // } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'members_search_' + orderSort.replace(' ', '_'),
        text: 'select count(*) OVER() AS full_count, u.id, u.username, u.url, u.joined, u."lastActivity", g.name, g.url from users u join groups g on u."groupID" = g.id and u.activated = true and u.username ilike \'%\' || $1 || \'%\' order by ' + orderSort + ' limit $2 offset $3;',
        values: [ args.term, end - start, start ]
      })

      // // Cache the result for future requests
      // if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
      //   app.cache.set({
      //     key: cacheKey,
      //     scope: scope,
      //     value: result.rows
      //   })
      // }

      return result.rows
    } catch (err) {
      throw err
    } finally {
      client.release()
    }
  // }
}
