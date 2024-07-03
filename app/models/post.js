// post model

export const edit = async (args) => {
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
        'update posts set text = $1, html = $2, editor_id = $3, edit_reason = $4, modified = $5 where id = $6',
        [ args.text, args.html, args.editorID, args.reason, args.time, args.id ])
      await client.query(
        'insert into post_history ( post_id, editor_id, edit_reason, text, html, time ) values ( $1, $2, $3, $4, $5, $6 ) returning id',
        [ args.id, args.currentPost.editor_id || args.currentPost.author_id, args.currentPost.edit_reason, args.currentPost.text, args.currentPost.html, args.currentPost.modified || args.currentPost.created ])
      await client.query('COMMIT')

      // Clear the topic cache
      app.cache.clear({ scope: 'topic-' + args.currentPost.topic_id })

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


export const info = async (postID) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'post_info',
      text: 'select p.id, p.user_id, p.topic_id, p.text, p.html, p.created, p.modified, p.draft, p.editor_id, p.edit_reason, p.locked_by_id, p.lock_reason, t.discussion_id, t.title as topic_title, t.title_html as topic_title_html, t.url as topic_url, t.replies as topic_replies, d.url as discussion_url, u.id as author_id, u.username as author, u.url as author_url, u2.username as editor, u2.url as editor_url from posts p join users u on p.user_id = u.id left join users u2 on p.editor_id = u2.id join topics t on p.topic_id = t.id left join discussions d on t.discussion_id = d.id where p.id = $1;',
      values: [ postID ]
    })

    if ( result.rows.length ) {
      result.rows[0].created_formatted = app.toolbox.moment.tz(result.rows[0].created, 'America/New_York').format('D-MMM-YYYY, h:mm A')
      if ( result.rows[0].modified ) {
        result.rows[0].modified_formatted = app.toolbox.moment.tz(result.rows[0].modified, 'America/New_York').format('D-MMM-YYYY, h:mm A')
      }
      return result.rows[0]
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


export const lock = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'post_lock',
      text: 'update posts set locked_by_id = $1, lock_reason = $2 where id = $3',
      values: [ args.lockedByID, args.lockReason, args.postID ]
    })

    // Clear the cache for this topic
    app.cache.clear({ scope: 'topic-' + args.topicID })
  } finally {
    client.release()
  }
}


export const unlock = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'post_unlock',
      text: 'update posts set locked_by_id = 0, lock_reason = null where id = $1',
      values: [ args.postID ]
    })

    // Clear the cache for this topic
    app.cache.clear({ scope: 'topic-' + args.topicID })
  } finally {
    client.release()
  }
}


export const page = async (postID) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'post_page',
      text: 'select ceiling(row_number::real/25::real) as page from ( select id, row_number() over (order by created asc) from posts where topic_id = ( select topic_id from posts where id = $1 ) and draft = false ) posts where posts.id = $1;',
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


export const saveReport = async (args) => {
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
        text: 'insert into post_reports ( post_id, reported_by_id, reason ) values ( $1, $2, $3 ) returning id;',
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


export const trash = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query('BEGIN')
    await client.query(
      'insert into post_trash ( id, topic_id, user_id, html, text, created, modified, draft, editor_id, edit_reason, locked_by_id, lock_reason, deleted_by_id, delete_reason ) select id, topic_id, user_id, html, text, created, modified, draft, editor_id, edit_reason, locked_by_id, lock_reason, $2, $3 from posts where id = $1;',
      [ args.postID, args.deletedByID, args.deleteReason ])
    await client.query(
      'delete from posts where id = $1;',
      [ args.postID ])
    let lastPostDate = await client.query(
      'select max(created) as last_post_date from posts where topic_id = $1 and draft = false;',
      [ args.topicID ])
    let currentSticky = await client.query(
      'select sticky from topics where id = $1;',
      [ args.topicID ])
    let sticky
    if ( app.toolbox.moment(currentSticky.rows[0].sticky).isAfter(app.toolbox.moment().utc().valueOf()) ) {
      sticky = currentSticky.rows[0].sticky
    } else {
      sticky = lastPostDate.rows[0].last_post_date
    }
    await client.query(
      'update topics set sticky = $2 where id = $1',
      [ args.topicID, sticky ])
    await client.query(
      'update discussions set last_post_id = ( select posts.id from posts join topics on posts.topic_id = topics.id where topics.discussion_id = $1 and topics.draft = false and posts.draft = false order by posts.created desc limit 1 ) where id = $1',
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
