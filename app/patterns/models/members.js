// members model

'use strict'

module.exports = {
  all: all,
  breadcrumbs: breadcrumbs,
  group: group,
  groupCount: groupCount,
  groups: groups,
  metaData: metaData,
  search: search
}


function all(args, emitter) {
  var start = args.start || 0,
      end = args.end || 25,
      sortBy = '',
      cacheKey,
      scope = 'members',
      cached
  
  switch ( args.sort ) {
    case 'username':
      sortBy = 'username ' + ( args.sort || 'asc' )
      break
    case 'join-date':
      sortBy = 'joined ' + ( args.sort || 'desc' )
      break
    case 'last-active':
      sortBy = '"lastActivity" ' + ( args.sort || 'desc' )
      break
    default:
      sortBy = 'username asc'
  }

  cacheKey = 'all-' + '-' + start + '-' + end + '-' + sortBy.replace(' ', '-')
  cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached)
  // If it's not cached, retrieve the user count and cache it
  } else {
    app.toolbox.dbPool.connect(function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err)
      } else {
        client.query({
          name: 'members_all_' + sortBy.replace(' ', '_'),
          text: 'select u.id, u.username, u.url, u.joined, u."lastActivity", g.name, g.url from users u join groups g on u."groupID" = g.id order by ' + sortBy + ' limit $1 offset $2;',
          values: [ end - start, start ]
        }, function (err, result) {
          done()
          if ( err ) {
            emitter.emit('error', err)
          } else {
            result.rows.forEach( function (item) {
              item['joinedFormatted'] = app.toolbox.moment.tz(item['joined'], 'America/New_York').format('D-MMM-YYYY')
              // item['createdFormatted'] = item['createdFormatted'].replace(/ (AM|PM)/, '&nbsp;$1')
              item['lastActivityFormatted'] = app.toolbox.moment.tz(item['lastActivity'], 'America/New_York').format('D-MMM-YYYY')
              // item['modifiedFormatted'] = item['modifiedFormatted'].replace(/ (AM|PM)/, '&nbsp;$1')
            })

            if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
              app.cache.set({
                scope: scope,
                key: cacheKey,
                value: result.rows
              })
            }

            emitter.emit('ready', result.rows)
          }
        })
      }
    })
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


function group(args, emitter) {
  var start = args.start || 0,
      end = args.end || 25,
      sortBy = '',
      cacheKey,
      scope = 'members',
      cached
  
  switch ( args.sort ) {
    case 'username':
      sortBy = 'username ' + ( args.sort || 'asc' )
      break
    case 'join-date':
      sortBy = 'joined ' + ( args.sort || 'desc' )
      break
    case 'last-active':
      sortBy = '"lastActivity" ' + ( args.sort || 'desc' )
      break
    default:
      sortBy = 'username asc'
  }

  cacheKey = 'group-' + args.group + '-' + start + '-' + end + '-' + sortBy.replace(' ', '-')
  cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached)
  // If it's not cached, retrieve the user count and cache it
  } else {
    app.toolbox.dbPool.connect(function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err)
      } else {
        client.query({
          name: 'members_group_' + sortBy.replace(' ', '_'),
          text: 'select u.id, u.username, u.url, u.joined, u."lastActivity", g.name, g.url from users u join groups g on u."groupID" = g.id where g.id = $1 order by ' + sortBy + ' limit $2 offset $3;',
          values: [ args.group, end - start, start ]
        }, function (err, result) {
          done()
          if ( err ) {
            emitter.emit('error', err)
          } else {
            result.rows.forEach( function (item) {
              item['joinedFormatted'] = app.toolbox.moment.tz(item['joined'], 'America/New_York').format('D-MMM-YYYY')
              // item['createdFormatted'] = item['createdFormatted'].replace(/ (AM|PM)/, '&nbsp;$1')
              item['lastActivityFormatted'] = app.toolbox.moment.tz(item['lastActivity'], 'America/New_York').format('D-MMM-YYYY')
              // item['modifiedFormatted'] = item['modifiedFormatted'].replace(/ (AM|PM)/, '&nbsp;$1')
            })

            if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
              app.cache.set({
                scope: scope,
                key: cacheKey,
                value: result.rows
              })
            }

            emitter.emit('ready', result.rows)
          }
        })
      }
    })
  }
}


function groupCount(groupID, emitter) {
  var cacheKey = 'count-' + groupID,
      scope = 'members',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached)
  // If it's not cached, retrieve the user count and cache it
  } else {
    app.toolbox.dbPool.connect(function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err)
      } else {
        client.query({
          name: 'members_groupCount',
          text: 'select count(id) as count from users where "groupID" = $1;',
          values: [ groupID ]
        }, function (err, result) {
          done()
          if ( err ) {
            emitter.emit('error', err)
          } else {
            if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
              app.cache.set({
                scope: scope,
                key: cacheKey,
                value: result.rows[0].count
              })
            }
            emitter.emit('ready', result.rows[0].count)
          }
        })
      }
    })
  }
}


function groups(emitter) {
  var cacheKey = 'groups',
      scope = 'members',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached)
  // If it's not cached, retrieve the user count and cache it
  } else {
    app.toolbox.dbPool.connect(function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err)
      } else {
        client.query({
          name: 'members_groups',
          text: 'select * from groups where id <> 1 order by id asc',
        }, function (err, result) {
          done()
          if ( err ) {
            emitter.emit('error', err)
          } else {
            if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
              app.cache.set({
                scope: scope,
                key: cacheKey,
                value: result.rows
              })
            }
            emitter.emit('ready', result.rows)
          }
        })
      }
    })
  }
}


function metaData() {
  return {
    title: 'Member List - Original Trilogy',
    description: 'List of forum members at originaltrilogy.com',
    keywords: ''
  }
}


function search(args, emitter) {
  var start = args.start || 0,
      end = args.end || 25,
      sortBy = '',
      cacheKey,
      scope = 'members',
      cached
  
  switch ( args.sort ) {
    case 'username':
      sortBy = 'username ' + ( args.sort || 'asc' )
      break
    case 'join-date':
      sortBy = 'joined ' + ( args.sort || 'desc' )
      break
    case 'last-active':
      sortBy = '"lastActivity" ' + ( args.sort || 'desc' )
      break
    default:
      sortBy = 'username asc'
  }

  cacheKey = 'all-' + '-' + start + '-' + end + '-' + sortBy.replace(' ', '-')
  cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached)
  // If it's not cached, retrieve the user count and cache it
  } else {
    app.toolbox.dbPool.connect(function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err)
      } else {
        client.query({
          name: 'members_all_' + sortBy.replace(' ', '_'),
          text: 'select u.id, u.username, u.url, u.joined, u."lastActivity", g.name, g.url from users u join groups g on u."groupID" = g.id order by ' + sortBy + ' limit $1 offset $2;',
          values: [ end - start, start ]
        }, function (err, result) {
          done()
          if ( err ) {
            emitter.emit('error', err)
          } else {
            result.rows.forEach( function (item) {
              item['joinedFormatted'] = app.toolbox.moment.tz(item['joined'], 'America/New_York').format('D-MMM-YYYY')
              // item['createdFormatted'] = item['createdFormatted'].replace(/ (AM|PM)/, '&nbsp;$1')
              item['lastActivityFormatted'] = app.toolbox.moment.tz(item['lastActivity'], 'America/New_York').format('D-MMM-YYYY')
              // item['modifiedFormatted'] = item['modifiedFormatted'].replace(/ (AM|PM)/, '&nbsp;$1')
            })

            if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
              app.cache.set({
                scope: scope,
                key: cacheKey,
                value: result.rows
              })
            }

            emitter.emit('ready', result.rows)
          }
        })
      }
    })
  }
}
