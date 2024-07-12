// members model

export const all = async (args) => {
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
      orderSort = 'last_activity ' + ( args.sort || 'desc' )
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
    const client = await app.helpers.dbPool.connect()

    try {
      const result = await client.query({
        name: 'members_all_' + orderSort.replace(' ', '_'),
        text: 'select count(*) OVER() AS full_count, u.id, u.username, u.url, u.joined, u.last_activity, g.name, g.url from users u join groups g on u.group_id = g.id where u.activated = true order by ' + orderSort + ' limit $1 offset $2;',
        values: [ end - start, start ]
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
      name: 'Member List',
      url: 'members'
    }
  }
}


export const group = async (args) => {
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
      orderSort = 'last_activity ' + ( args.sort || 'desc' )
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
    const client = await app.helpers.dbPool.connect()

    try {
      const result = await client.query({
        name: 'members_group_' + orderSort.replace(' ', '_'),
        text: 'select count(*) OVER() AS full_count, u.id, u.username, u.url, u.joined, u.last_activity, g.name, g.url as group_url from users u join groups g on u.group_id = g.id where g.id = $1 and u.activated = true order by ' + orderSort + ' limit $2 offset $3;',
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
    } finally {
      client.release()
    }
  }
}


export const groups = async () => {
  // See if already cached
  let cacheKey = 'groups',
      scope = 'members',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.helpers.dbPool.connect()

    try {
      const result = await client.query({
        name: 'members_groups',
        text: 'select * from groups g where g.id <> 1 and ( select count(*) from users where group_id = g.id and activated = true ) > 0 order by g.id asc'
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


export const metaData = () => {
  return {
    title: 'Member List - Original Trilogy',
    description: 'List of forum members at originaltrilogy.com',
    keywords: ''
  }
}


export const search = async (args) => {
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
    case 'group':
      orderSort = 'name ' + ( args.sort || 'asc' )
      break
    case 'join-date':
      orderSort = 'joined ' + ( args.sort || 'desc' )
      break
    case 'last-active':
      orderSort = 'last_activity ' + ( args.sort || 'desc' )
      break
    // Protect against bad URL parameters
    default:
      orderSort = 'username asc'
  }

  // See if already cached
  let cacheKey = 'search-' + args.term + '-' + start + '-' + end + '-' + orderSort.replace(' ', '-') + '-groupID-' + args.groupID,
      scope = 'members',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.helpers.dbPool.connect()

    try {
      let result
      if ( args.groupID ) {
        result = await client.query({
          name: 'members_search_group' + orderSort.replace(' ', '_'),
          text: 'select count(*) OVER() AS full_count, u.id, u.username, u.url, u.joined, u.last_activity, g.name, g.url as group_url from users u join groups g on u.group_id = g.id and u.activated = true and u.username ilike \'%\' || $2 || \'%\' where u.group_id = $1 order by ' + orderSort + ' limit $3 offset $4;',
          values: [ args.groupID, decodeURI(args.term), end - start, start ]
        })
      } else {
        result = await client.query({
          name: 'members_search_' + orderSort.replace(' ', '_'),
          text: 'select count(*) OVER() AS full_count, u.id, u.username, u.url, u.joined, u.last_activity, g.name, g.url as group_url from users u join groups g on u.group_id = g.id and u.activated = true and u.username ilike \'%\' || $1 || \'%\' order by ' + orderSort + ' limit $2 offset $3;',
          values: [ decodeURI(args.term), end - start, start ]
        })
      }
      
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
