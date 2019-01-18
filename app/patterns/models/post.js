// post model

'use strict'

module.exports = {
  edit          : edit,
  info          : info,
  lock          : lock,
  unlock        : unlock,
  page          : page,
  saveBookmark  : saveBookmark,
  saveReport    : saveReport,
  trash         : trash
}


async function edit(args) {
  if ( !args.text.length ) {
    return {
      success: false,
      reason: 'requiredFieldsEmpty',
      message: 'Posts can\'t be empty.'
    }
  } else {
    const client = await app.toolbox.dbPool.connect()
  
    try {
      await client.query('BEGIN')
      await client.query(
        'update "posts" set "text" = $1, "html" = $2, "editorID" = $3, "editReason" = $4, "modified" = $5 where "id" = $6',
        [ args.text, args.html, args.editorID, args.reason, args.time, args.id ])
      await client.query(
        'insert into "postHistory" ( "postID", "editorID", "editReason", "text", "html", "time" ) values ( $1, $2, $3, $4, $5, $6 ) returning id',
        [ args.id, !args.currentPost.editorID ? args.currentPost.authorID : args.currentPost.editorID, args.currentPost.editReason, args.currentPost.text, args.currentPost.html, args.currentPost.modified || args.currentPost.created ])
      await client.query('COMMIT')

      // Clear the topic cache
      app.cache.clear({ scope: 'topic-' + args.currentPost.topicID })

      return {
        success: true
      }
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}


async function info(postID) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'post_info',
      text: 'select p.id, p."userID", p."topicID", p.text, p.html, p."created", p."modified", p.draft, p."editorID", p."editReason", p."lockedByID", p."lockReason", t."discussionID", t."title" as "topicTitle", t."titleHtml" as "topicTitle", t.url as "topicUrl", t.replies as "topicReplies", d."url" as "discussionUrl", u.id as "authorID", u.username as author, u.url as "authorUrl", u2.username as editor, u2.url as "editorUrl" from posts p join users u on p."userID" = u.id left join users u2 on p."editorID" = u2.id join topics t on p."topicID" = t.id left join discussions d on t."discussionID" = d."id" where p.id = $1;',
      values: [ postID ]
    })

    if ( result.rows.length ) {
      result.rows[0].createdFormatted = app.toolbox.moment.tz(result.rows[0].created, 'America/New_York').format('D-MMM-YYYY, h:mm A')
      if ( result.rows[0].modified ) {
        result.rows[0].modifiedFormatted = app.toolbox.moment.tz(result.rows[0].modified, 'America/New_York').format('D-MMM-YYYY, h:mm A')
      }
      return result.rows[0]
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


async function lock(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'post_lock',
      text: 'update "posts" set "lockedByID" = $1, "lockReason" = $2 where "id" = $3',
      values: [ args.lockedByID, args.lockReason, args.postID ]
    })

    // Clear the cache for this topic
    app.cache.clear({ scope: 'topic-' + args.topicID })
  } finally {
    client.release()
  }
}


async function unlock(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'post_unlock',
      text: 'update "posts" set "lockedByID" = 0, "lockReason" = null where "id" = $1',
      values: [ args.postID ]
    })

    // Clear the cache for this topic
    app.cache.clear({ scope: 'topic-' + args.topicID })
  } finally {
    client.release()
  }
}


async function page(postID) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'modelName_methodName',
      text: 'select ceiling(row_number::real/25::real) as page from ( select id, row_number() over (order by created asc) from posts where "topicID" = ( select "topicID" from posts where id = $1 ) and draft = false ) posts where posts.id = $1;',
      values: [ postID ]
    })

    if ( result.rows.length ) {
      return result.rows[0].page
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


function saveBookmark(args, emitter) {
  app.listen({
    bookmarkExists: function (emitter) {
      app.toolbox.dbPool.connect(function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err)
        } else {
          client.query(
            'select "userID" from "bookmarks" where "userID" = $1 and "postID" = $2;',
            [ args.userID, args.postID ],
            function (err, result) {
              done()
              if ( err ) {
                emitter.emit('error', err)
              } else {
                if ( result.rows.length ) {
                  emitter.emit('ready', true)
                } else {
                  emitter.emit('ready', false)
                }
              }
            }
          )
        }
      })
    }
  }, function (output) {
    if ( output.bookmarkExists ) {
      emitter.emit('ready', {
        success: true
      })
    } else {
      app.listen({
        bookmarkInsert: function (emitter) {
          app.toolbox.dbPool.connect(function (err, client, done) {
            if ( err ) {
              emitter.emit('error', err)
            } else {
              client.query(
                'insert into "bookmarks" ( "userID", "postID", "notes" ) values ( $1, $2, $3 );',
                [ args.userID, args.postID, args.notes ],
                function (err, result) {
                  done()
                  if ( err ) {
                    emitter.emit('error', err)
                  } else {
                    emitter.emit('ready', {
                      success: true
                    })
                  }
                }
              )
            }
          })
        }
      }, function (output) {
        emitter.emit('ready', {
          success: output.listen.success
        })
      })
    }
  })
}


async function saveReport(args) {
  if ( !args.reason.length ) {
    return {
      success: false,
      message: 'You have to provide a reason for the report.'
    }
  } else {
    const client = await app.toolbox.dbPool.connect()
  
    try {
      await client.query({
        name: 'post_saveReport',
        text: 'insert into "postReports" ( "postID", "reportedByID", "reason" ) values ( $1, $2, $3 ) returning id;',
        values: [ args.postID, args.userID, args.reason ]
      })
  
      return {
        success: true
      }
    } finally {
      client.release()
    }
  }
}


async function trash(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query('BEGIN')
    await client.query(
      'insert into "postTrash" ( "id", "topicID", "userID", "html", "text", "created", "modified", "draft", "editorID", "editReason", "lockedByID", "lockReason", "deletedByID", "deleteReason" ) select "id", "topicID", "userID", "html", "text", "created", "modified", "draft", "editorID", "editReason", "lockedByID", "lockReason", $2, $3 from "posts" where id = $1;',
      [ args.postID, args.deletedByID, args.deleteReason ])
    await client.query(
      'delete from "posts" where "id" = $1;',
      [ args.postID ])
    let lastPostDate = await client.query(
      'select max(created) as "lastPostDate" from posts where "topicID" = $1 and draft = false;',
      [ args.topicID ])
    let currentSticky = await client.query(
      'select sticky from topics where id = $1;',
      [ args.topicID ])
    let sticky
    if ( app.toolbox.moment(currentSticky.rows[0].sticky).isAfter(app.toolbox.moment().utc().valueOf()) ) {
      sticky = currentSticky.rows[0].sticky
    } else {
      sticky = lastPostDate.rows[0].lastPostDate
    }
    await client.query(
      'update "topics" set sticky = $2 where "id" = $1',
      [ args.topicID, sticky ])
    await client.query(
      'update "discussions" set last_post_id = ( select posts.id from posts join topics on posts."topicID" = topics.id where topics."discussionID" = $1 and topics.draft = false and posts.draft = false order by posts.created desc limit 1 ) where "id" = $1',
      [ args.discussionID ])
    await client.query('COMMIT')

    // Clear the topic and user caches
    app.cache.clear({ scope: 'topic-' + args.topicID })
    app.cache.clear({ scope: 'discussion-' + args.discussionID })
    app.cache.clear({ scope: 'categories_discussions' })
    app.cache.clear({ scope: 'user-' + args.authorID })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
