// topic model

'use strict'

module.exports = {
  acceptInvitation: acceptInvitation,
  announcementView: announcementView,
  announcementReply: announcementReply,
  edit: edit,
  exists: exists,
  firstUnreadPost: firstUnreadPost,
  invitee: invitee,
  invitees: invitees,
  info: info,
  insert: insert,
  posts: posts,
  newPosts: newPosts,
  leave: leave,
  lock: lock,
  unlock: unlock,
  move: move,
  reply: reply,
  subscriptionExists: subscriptionExists,
  subscribers: subscribers,
  subscribersToUpdate: subscribersToUpdate,
  subscriptionNotificationSentUpdate: subscriptionNotificationSentUpdate,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  viewTimeUpdate: viewTimeUpdate,
  breadcrumbs: breadcrumbs,
  metaData: metaData
}


async function acceptInvitation(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'topic_acceptInvitation',
      text: 'update topic_invitations set accepted = true where user_id = $1 and topic_id = $2;',
      values: [ args.userID, args.topicID ]
    })

    // Clear related caches
    app.cache.clear({ scope: 'topic-' + args.topicID })
    app.cache.clear({ scope: 'private-topics-' + args.userID })
  } finally {
    client.release()
  }
}


async function announcementView(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'topic_announcementView',
      text: 'select dp.discussion_id from discussion_permissions dp join announcements a on dp.discussion_id = a.discussion_id where dp.group_id = $1 and a.topic_id = $2 and dp.read = true;',
      values: [ args.groupID, args.topicID ]
    })

    if ( result.rows.length ) {
      return true
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


async function announcementReply(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'topic_announcementReply',
      text: 'select dp.discussion_id from discussion_permissions dp join announcements a on dp.discussion_id = a.discussion_id where dp.group_id = $1 and a.topic_id = $2 and dp.reply = true;',
      values: [ args.groupID, args.topicID ]
    })

    if ( result.rows.length ) {
      return true
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


async function edit(args) {
  if ( !args.title.length || !args.text.length ) {
    return {
      success: false,
      reason: 'requiredFieldsEmpty',
      message: 'The topic title and content are both required.'
    }
  } else {
    const client = await app.toolbox.dbPool.connect()
  
    try {
      await client.query('begin')
      await client.query(
        'update posts set text = $1, html = $2, editor_id = $3, edit_reason = $4, modified = $5 where id = $6;',
        [ args.text, args.html, args.editorID, args.reason, args.time, args.postID ])
      await client.query(
        'insert into post_history ( post_id, editor_id, edit_reason, text, html, time ) values ( $1, $2, $3, $4, $5, $6 );',
        [ args.postID, !args.currentPost.editorID ? args.currentPost.authorID : args.currentPost.editorID, args.currentPost.editReason, args.currentPost.text, args.currentPost.html, args.currentPost.modified || args.currentPost.created ])
      await client.query(
        'update topics set title = $1, title_html = $2, url = $3, edited_by_id = $4, edit_reason = $5 where id = $6;',
        [ args.title, args.titleHtml, args.url, args.editorID, args.reason, args.topicID ])
      await client.query('commit')

      // Clear the topic cache
      app.cache.clear({ scope: 'topic-' + args.currentPost.topicID })
      app.cache.clear({ scope: 'discussion-' + args.discussionID })
      if ( args.discussionID === 2 ) {
        app.cache.clear({ scope: 'announcements' })
      }

      return {
        success: true
      }
    } catch (err) {
      await client.query('rollback')
      throw err
    } finally {
      client.release()
    }
  }
}


function exists(topicID, emitter) {
  app.listen({
    exists: function (emitter) {
      app.toolbox.dbPool.connect(function (err, client, done) {
        if ( err ) {
          emitter.emit('error', err)
        } else {
          client.query(
            'select id from topics where id = $1;',
            [ topicID ],
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

    if ( output.listen.success ) {
      emitter.emit('ready', output.exists)
    } else {
      emitter.emit('error', output.listen)
    }

  })
}


async function newPosts(args) {
  // See if already cached
  let cacheKey = 'key',
      scope = 'scope',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'topic_newPosts',
        text: 'select id from posts where topic_id = $1 and draft = false and created > $2 order by created asc;',
        values: [ args.topicID, args.time ]
      })

      return {
        post: result.rows[0],
        page: Math.ceil(( args.replies + 1.5 - result.rows.length ) / 25)
      }
    } finally {
      client.release()
    }
  }
}


async function firstUnreadPost(args) {
  let viewTime = args.userID ? await app.models.user.topicViewTimes({ userID: args.userID, topicID: args.topicID }) : [ { time: args.viewTime } ]

  if ( viewTime ) {
    let topic = await this.info(args.topicID)

    if ( app.toolbox.moment(topic.lastPostCreated).isAfter(viewTime[0].time) ) {
      return await this.newPosts({ topicID: args.topicID, time: viewTime[0].time, replies: topic.replies })
    } else {
      return false
    }
  } else {
    return false
  }
}


async function invitee(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'topic_invitee',
      text: 'select topic_id, accepted, left from topic_invitations where topic_id = $1 and user_id = $2;',
      values: [ args.topicID, args.userID ]
    })

    if ( result.rows.length ) {
      return result.rows[0]
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


async function invitees(args) {
  args.left = args.left || false
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'topic_invitees',
      text: 'select ti.topic_id, ti.accepted, ti.left, u.id, u.username, u.url from topic_invitations ti join users u on ti.user_id = u.id where topic_id = $1 and ti.left = $2 order by u.username asc;',
      values: [ args.topicID, args.left ]
    })

    return result.rows
  } finally {
    client.release()
  }
}


async function info(topicID) {
  // See if already cached
  let cacheKey = 'info',
      scope = 'topic-' + topicID,
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'topic_info',
        text: 'select t.id, t.discussion_id, t.title, t.title_html, t.url, t.created, t.modified, ( select count(*) from posts where topic_id = t.id and draft = false ) - 1 as replies, t.draft, t.private, t.locked_by_id, t.lock_reason, d.title as discussion_title, d.url as discussion_url, p.id as first_post_id, p.user_id as authorID, p.text, u.group_id as authorGroupID, u.username as author, u.url as author_url, p2.id as last_post_id, p2.created as last_post_created from topics t left join discussions d on t.discussion_id = d.id join posts p on p.id = ( select id from posts where topic_id = t.id order by created asc limit 1 ) join users u on u.id = p.user_id join posts p2 on p2.id = ( select id from posts where topic_id = t.id and draft = false order by created desc limit 1 ) where t.id = $1;',
        values: [ topicID ]
      })

      if ( result.rows.length ) {
        result.rows[0].replies = parseInt(result.rows[0].replies, 10)
        result.rows[0].created_formatted = app.toolbox.moment.tz(result.rows[0].created, 'America/New_York').format('D-MMM-YYYY, h:mm A')
        result.rows[0].replies_formatted = app.toolbox.numeral(result.rows[0].replies).format('0,0')

        // Cache the topic info object for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            scope: scope,
            key: cacheKey,
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


async function insert(args) {
  let title   = args.title.trim() || '',
      content = args.text.trim() || ''

  if ( !title.length || !content.length || ( args.private && !args.invitees.length ) ) {
    return {
      success: false,
      reason: 'requiredFieldsEmpty',
      message: 'All fields are required.'
    }
  } else if ( title.length > 120 ) {
    return {
      success: false,
      reason: 'titleLength',
      message: 'Topic titles can\'t be longer than 120 characters.'
    }
  } else {
    const client = await app.toolbox.dbPool.connect()
  
    try {
      await client.query('BEGIN')
      const insertTopic = await client.query(
        'insert into topics ( discussion_id, title, title_html, url, created, sticky, draft, private ) values ( $1, $2, $3, $4, $5, $5, $6, $7 ) returning id;',
        [ args.discussionID, args.title, args.titleHtml, args.url, args.time, args.draft, args.private ])
      const insertPost = await client.query(
        'insert into posts ( topic_id, user_id, text, html, created, draft ) values ( $1, $2, $3, $4, $5, $6 ) returning id;',
        [ insertTopic.rows[0].id, args.userID, args.text, args.html, args.time, args.draft ])
      
      let invited = []
      if ( args.private && args.invitees ) {
        let invitees = [],
            inviteesList = args.invitees.replace(/(^[,\s]+)|([,\s]+$)/g, '')

        if ( inviteesList.length ) {
          invitees = inviteesList.split(',')

          for ( let i = 0; i < invitees.length; i += 1 ) {
            invitees[i] = invitees[i].trim()
          }
        }

        let invitations = []
        invitees.forEach((item, index, array) => {
          invitations.push(
            ( async () => {
              const invitee = await client.query('select id, email, private_topic_email_notification from users where lower(username) = lower($1)', [ item ])
              if ( !invitee.rowCount ) {
                throw new Error(item + ' isn\'t a member.')
              }
              if ( array.length === 1 && invitee.rows[0].id === args.userID ) {
                throw new Error('You don\'t need to invite yourself, but you do need to invite at least one other person.')
              }
              await client.query('insert into topic_invitations ( topic_id, user_id, accepted ) values ( $1, $2, false );',
              [ insertTopic.rows[0].id, invitee.rows[0].id ])
              invited.push(invitee.rows[0])
            })()
          )
        })

        invitations.push(
          client.query(
            'insert into topic_invitations ( topic_id, user_id, accepted ) values ( $1, $2, true );',
            [ insertTopic.rows[0].id, args.userID ])
        )

        await Promise.all(invitations)
      }

      if ( args.announcement ) {
        let announcements = []
        args.discussions.forEach((item) => {
          announcements.push(
            client.query(
              'insert into announcements ( discussion_id, topic_id ) values ( $1, $2 );',
              [ item, insertTopic.rows[0].id ])
          )
        })

        await Promise.all(announcements)
      }

      await client.query(
        'update discussions set last_post_id = $2 where id = $1;',
        [ args.discussionID, insertPost.rows[0].id ])
      await client.query(
        'update users set last_activity = $1 where id = $2;',
        [ args.time, args.userID ])
      await client.query('COMMIT')

      if ( !args.draft ) {
        if ( args.private ) {
          invited.forEach( function (item) {
            app.cache.clear({ scope: 'private-topics-' + item.id })
          })
        } else if ( args.announcement ) {
          app.cache.clear({ scope: 'discussion-2' })
          args.discussions.forEach( function (item) {
            app.cache.clear({ scope: 'announcements', key: 'discussion-' + item })
          })
        } else {
          app.cache.clear({ scope: 'discussion-' + args.discussionID })
          app.cache.clear({ scope: 'categories_discussions' })
        }
      }

      return {
        success: true,
        id: insertTopic.rows[0].id,
        invited: invited
      }
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}



async function posts(args) {
  // See if this post subset is already cached
  let start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'posts-' + start + '-' + end,
      scope = 'topic-' + args.topicID,
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    return cached
  // If it's not cached, retrieve the subset and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()
    
    try {
      const result = await client.query({
        name: 'topic_posts',
        text: 'select p.id, p.html, p.created, p.modified, p.editor_id, p.locked_by_id, p.lock_reason, u.id as authorID, u.group_id as authorGroupID, u.username as author, u.url as author_url, u.signature_html as author_signature ' +
        'from posts p ' +
        'join users u on p.user_id = u.id ' +
        'where p.topic_id = $1 and p.draft = false ' +
        'order by p.created asc ' +
        'limit $2 offset $3;',
        values: [ args.topicID, end - start, start ]
      })

      result.rows.forEach( function (item) {
        item.created_formatted  = app.toolbox.moment.tz(item.created, 'America/New_York').format('D-MMM-YYYY h:mm A')
        item.created_formatted  = item.created_formatted.replace(/ (AM|PM)/, '&nbsp;$1')
        item.modified_formatted = app.toolbox.moment.tz(item.modified, 'America/New_York').format('D-MMM-YYYY h:mm A')
        item.modified_formatted = item.modified_formatted.replace(/ (AM|PM)/, '&nbsp;$1')
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


async function leave(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query('BEGIN')
    await client.query('update topic_invitations set left = true where user_id = $1 and topic_id = $2;', [ args.userID, args.topicID ])
    await client.query('delete from topic_subscriptions where user_id = $1 and topic_id = $2;', [ args.userID, args.topicID ])
    await client.query('COMMIT')

    app.cache.clear({ scope: 'topic-' + args.topicID })
    app.cache.clear({ scope: 'subscriptions-' + args.userID })
    app.cache.clear({ scope: 'private-topics-' + args.userID })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}


async function lock(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'topic_lock',
      text: 'update topics set locked_by_id = $1, lock_reason = $2 where id = $3',
      values: [ args.lockedByID, args.lockReason, args.topicID ]
    })

    // Clear the cache for this topic
    app.cache.clear({ scope: 'topic-' + args.topicID })
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}


async function unlock(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'topic_unlock',
      text: 'update topics set locked_by_id = null, lock_reason = null where id = $1',
      values: [ args.topicID ]
    })

    // Clear the cache for this topic
    app.cache.clear({ scope: 'topic-' + args.topicID })
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}


async function move(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query('begin')
    await client.query('update topics set discussion_id = $1 where id = $2;', [ args.newDiscussionID, args.topicID ])
    await client.query('delete from announcements where topic_id = $1;', [ args.topicID ])
    await client.query(
      'update discussions set last_post_id = ( select posts.id from posts join topics on posts.topic_id = topics.id where topics.discussion_id = $1 and topics.draft = false and posts.draft = false order by posts.created desc limit 1 ) where id = $1',
      [ args.discussionID ])
    await client.query(
      'update discussions set last_post_id = ( select posts.id from posts join topics on posts.topic_id = topics.id where topics.discussion_id = $1 and topics.draft = false and posts.draft = false order by posts.created desc limit 1 ) where id = $1',
      [ args.newDiscussionID ])
    await client.query('commit')

    // Clear the cache
    app.cache.clear({ scope: 'topic-' + args.topicID })
    app.cache.clear({ scope: 'discussion-' + args.discussionID })
    app.cache.clear({ scope: 'discussion-' + args.newDiscussionID })
    app.cache.clear({ scope: 'categories_discussions' })
    if ( args.discussionID === 2 ) {
      app.cache.clear({ scope: 'announcements' })
    }
  } catch (err) {
    await client.query('rollback')
    throw err
  } finally {
    client.release()
  }
}


async function reply(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    let sticky = await client.query('select sticky from topics where id = $1;', [ args.topicID ])
    if ( sticky.rows[0].sticky > args.time ) {
      sticky = sticky.rows[0].sticky
    } else {
      sticky = args.time
    }
    await client.query('BEGIN')
    // Insert the new post
    const post = await client.query('insert into posts ( topic_id, user_id, text, html, created, draft ) values ( $1, $2, $3, $4, $5, $6 ) returning id;', [ args.topicID, args.userID, args.text, args.html, args.time, args.draft ])
    // Update topic stats
    await client.query('update topics set replies = ( select count(id) from posts where topic_id = $1 and draft = false ) - 1, sticky = $2 where id = $1;', [ args.topicID, sticky ])
    // Update discussion stats
    await client.query('update discussions set last_post_id = $2 where id = $1', [ args.discussionID, post.rows[0].id ])
    // Update user stats
    await client.query('update users set last_activity = $1 where id = $2;', [ args.time, args.userID ])
    await client.query('COMMIT')

    if ( !args.draft ) {
      // Clear the cache for this topic and discussion
      app.cache.clear({ scope: 'topic-' + args.topicID })

      if ( args.private ) {
        const invitees = await this.invitees({ topicID: args.topicID })
        invitees.forEach( function (item) {
          app.cache.clear({ scope: 'private-topics-' + item.id })
        })
      } else {
        app.cache.clear({ scope: 'discussion-' + args.discussionID })
        app.cache.clear({ scope: 'categories_discussions' })
        if ( args.discussionID === 2 ) {
          app.cache.clear({ scope: 'announcements' })
        }
      }

      const subscribers = await this.subscribers({ topicID: args.topicID })
      subscribers.forEach( function (item) {
        app.cache.clear({ scope: 'subscriptions-' + item.id })
      })
    }

    return {
      success: true,
      id: post.rows[0].id
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}


async function subscriptionExists(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'topic_subscriptionExists',
      text: 'select user_id from topic_subscriptions where user_id = $1 and topic_id = $2;',
      values: [ args.userID, args.topicID ]
    })

    if ( result.rows.length ) {
      return true
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


async function subscribers(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'topic_subscribers',
      text: 'select u.id, u.email from users u join topic_subscriptions s on u.id = s.user_id where s.topic_id = $1;',
      values: [ args.topicID ]
    })

    return result.rows
  } finally {
    client.release()
  }
}


async function subscribersToUpdate(args) {
  const client = await app.toolbox.dbPool.connect()

  let name, sql
  if ( args.skip ) {
    name = 'topic_subscribersToUpdateSkip'
    sql = 'select u.email from users u join topic_subscriptions s on u.id = s.user_id and u.id not in ( ' + args.skip + ' ) and u.subscription_email_notification = true where s.topic_id = $1 and s.notification_sent <= ( select tv.time from topic_views tv where tv.user_id = s.user_id and tv.topic_id = s.topic_id );'
  } else {
    name = 'topic_subscribersToUpdate'
    sql = 'select u.email from users u join topic_subscriptions s on u.id = s.user_id and u.subscription_email_notification = true where s.topic_id = $1 and s.notification_sent <= ( select tv.time from topic_views tv where tv.user_id = s.user_id and tv.topic_id = s.topic_id );'
  }

  try {
    const result = await client.query({
      name: name,
      text: sql,
      values: [ args.topicID ]
    })

    return result.rows
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}


async function subscriptionNotificationSentUpdate(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'topic_subscriptionNotificationSentUpdate',
      text: 'update topic_subscriptions set notification_sent = $1 where topic_id = $2;',
      values: [ args.time, args.topicID ]
    })
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}


async function subscribe(args) {
  let subscriptionExists = await this.subscriptionExists(args)

  if ( !subscriptionExists ) {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'topic_subscribe',
        text: 'insert into topic_subscriptions ( user_id, topic_id, notification_sent ) values ( $1, $2, $3 );',
        values: [ args.userID, args.topicID, args.time ]
      })

      app.cache.clear({ scope: 'subscriptions-' + args.userID })
  
      return result.rows
    } finally {
      client.release()
    }
  } else {
    return true
  }
}


async function unsubscribe(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'topic_unsubscribe',
      text: 'delete from topic_subscriptions where user_id = $1 and topic_id = $2;',
      values: [ args.userID, args.topicID ]
    })

    app.cache.clear({ scope: 'subscriptions-' + args.userID })

    return result.rows
  } finally {
    client.release()
  }
}


async function viewTimeUpdate(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query('BEGIN')
    const result = await client.query('update topic_views set time = $3 where user_id = $1 and topic_id = $2;', [ args.userID, args.topic.id, args.time ])
    if ( !result.rowCount ) {
      await client.query('insert into topic_views ( user_id, topic_id, time ) values ( $1, $2, $3 );', [ args.userID, args.topic.id, args.time ])
    }
    await client.query('COMMIT')

    app.cache.clear({ scope: 'subscriptions-' + args.userID, key: 'models-subscriptions-unread' })
    app.cache.clear({ scope: 'private-topics-' + args.userID, key: 'private-topics-unread' })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}


function breadcrumbs(topic) {
  var title, url

  switch ( topic.discussionID ) {
    case 0:
      return {
        a: {
          name: 'Home',
          url: app.config.comitium.basePath
        },
        c: {
          name: 'Private Topics',
          url: 'private-topics'
        }
      }
    case 2:
      title = 'Announcements'
      url = 'announcements'
      return {
        a: {
          name: 'Home',
          url: app.config.comitium.basePath
        },
        b: {
          name: 'Discussion Categories',
          url: 'discussions'
        },
        c: {
          name: 'Announcements',
          url: 'announcements'
        }
      }
    default:
      return {
        a: {
          name: 'Home',
          url: app.config.comitium.basePath
        },
        b: {
          name: 'Discussion Categories',
          url: 'discussions'
        },
        c: {
          name: topic.discussionTitle,
          url: 'discussion/' + topic.discussionUrl + '/id/' + topic.discussionID
        }
      }
  }
}


async function metaData(args) {
  let topic = await this.info(args.topicID)

  return {
    title: topic.title + ' - Original Trilogy',
    description: 'Posted by ' + topic.author + ' on ' + topic.time,
    keywords: ''
  }
}
