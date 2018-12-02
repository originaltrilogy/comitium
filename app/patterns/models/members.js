// members model

'use strict'

module.exports = {
  all: all,
  breadcrumbs: breadcrumbs,
  metaData: metaData,
  search: search
}


function all(args, emitter) {
  var start = args.start || 0,
      end = args.end || 25,
      orderBy,
      cacheKey = 'all-' + args.sort + '-' + start + '-' + end,
      scope = 'members',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached)
  // If it's not cached, retrieve the user count and cache it
  } else {
    switch ( args.sort ) {
      case 'username-asc':
        orderBy = 'username asc'
        break
      case 'username-desc':
        orderBy = 'username desc'
        break
      case 'joined-asc':
        orderBy = 'joined asc'
        break
      case 'joined-desc':
        orderBy = 'joined desc'
        break
      default:
        orderBy = 'joined desc'
    }

    app.toolbox.dbPool.connect(function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err)
      } else {
        client.query({
          name: 'members_' + args.sort,
          text: 'select id, username, url, joined, "lastActivity" from users order by ' + orderBy + ' limit $1 offset $2;',
          values: [ end - start, start ]
        }, function (err, result) {
          done()
          if ( err ) {
            emitter.emit('error', err)
          } else {
            result.rows.forEach( function (item) {
              item['joinedFormatted'] = app.toolbox.moment.tz(item['joined'], 'America/New_York').format('D-MMM-YYYY h:mm A')
              // item['createdFormatted'] = item['createdFormatted'].replace(/ (AM|PM)/, '&nbsp;$1')
              item['lastActivityFormatted'] = app.toolbox.moment.tz(item['lastActivity'], 'America/New_York').format('D-MMM-YYYY h:mm A')
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
      name: 'Members',
      url: 'members'
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


function search(member, emitter) {
  var cacheKey = 'search-' + member,
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
          name: 'topicPosts',
          text: 'select p."id", p."html", p."created", p."modified", p."editorID", p."lockedByID", p."lockReason", u."id" as "authorID", u."groupID" as "authorGroupID", u."username" as "author", u."url" as "authorUrl", u."signatureHtml" as "authorSignature" ' +
          'from posts p ' +
          'join users u on p."userID" = u.id ' +
          'where p."topicID" = $1 and p.draft = false ' +
          'order by p."created" asc ' +
          'limit $2 offset $3',
          values: [ args.topicID, end - start, start ]
        }, function (err, result) {
          done()
          if ( err ) {
            emitter.emit('error', err)
          } else {
            emitter.emit('ready', result.rows)
          }
        })
      }
    })
  }
}
