// topic controller

'use strict'

module.exports = {
  handler               : handler,
  head                  : head,
  notifySubscribers     : notifySubscribers,
  start                 : start,
  startForm             : startForm,
  startAnnouncement     : startAnnouncement,
  startAnnouncementForm : startAnnouncementForm,
  startPrivate          : startPrivate,
  startPrivateForm      : startPrivateForm,
  reply                 : reply,
  replyForm             : replyForm,
  subscribe             : subscribe,
  unsubscribe           : unsubscribe,
  leave                 : leave,
  leaveForm             : leaveForm,
  lock                  : lock,
  lockForm              : lockForm,
  unlock                : unlock,
  edit                  : edit,
  editForm              : editForm,
  // merge: merge,
  // mergeForm: mergeForm,
  move                  : move,
  moveForm              : moveForm,
  trash                 : trash,
  trashForm             : trashForm
}


async function handler(params) {
  // Verify the user's group has read access to the topic's parent discussion
  let access = await app.toolbox.access.topicView({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let [
      topic,
      firstUnreadPost
    ] = await Promise.all([
      app.models.topic.info(params.url.id),
      ( async () => {
        if ( !params.url.page ) {
          return await app.models.topic.firstUnreadPost({
            topicID: params.url.id,
            userID: params.session.userID,
            viewTime: params.session.lastActivity
          })
        } else {
          return false
        }
      })()
    ])

    let page = parseInt(params.url.page, 10) || 1,
        type,
        url

    switch ( topic.discussionID ) {
      case 0:
        type = 'private-topic'
        break
      case 2:
        type = 'announcement'
        break
      default:
        type = 'topic'
        break
    }

    url = topic.private ? 'topic' : type + '/' + topic.url

    // If there are unread posts, the first unread post isn't the first post in the topic,
    // and a specific page hasn't been requested, redirect the user to the first unread post.
    if ( firstUnreadPost && firstUnreadPost.post.id !== topic.firstPostID ) {
      return {
        redirect: app.config.comitium.baseUrl + url + '/id/' + topic.id + '/page/' + firstUnreadPost.page + '#' + firstUnreadPost.post.id
      }
    } else if ( params.route.descriptor === topic.url || topic.private ) {
      let [
        posts,
        subscriptionExists,
        userCanReply
      ] = await Promise.all([
        // posts
        ( async () => {
          var start = ( page - 1 ) * 25,
              end = start + 25

          return await app.models.topic.posts({
            topicID: topic.id,
            start: start,
            end: end
          })
        })(),
        // subscriptionExists
        ( async () => {
          if ( params.session.userID ) {
            return await app.models.topic.subscriptionExists({
              userID: params.session.userID,
              topicID: topic.id
            })
          } else {
            return false
          }
        })(),
        // userCanReply
        app.toolbox.access.topicReply({
          topicID: topic.id,
          user: params.session,
          response: 'boolean'
        }),
        // viewTimeUpdate
        ( async () => {
          if ( params.session.userID ) {
            return await app.models.topic.viewTimeUpdate({
              userID: params.session.userID,
              topic: topic,
              time: app.toolbox.helpers.isoDate()
            })
          } else {
            return false
          }
        })()
      ])

      let left, participants

      if ( topic.private ) {
        [
          participants,
          left
        ] = await Promise.all([
          // participants
          app.models.topic.invitees({
            topicID: topic.id
          }),
          // left
          app.models.topic.invitees({
            topicID: topic.id,
            left: true
          }),
          // acceptInvitation
          ( async () => {
            if ( params.url.accept ) {
              await app.models.topic.acceptInvitation({
                userID: params.session.userID,
                topicID: topic.id
              })
            }
          })()
        ])
      }

      let firstPost = []
      if ( page === 1 ) {
        firstPost[0] = posts.shift()
      }

      return {
        view: type,
        content: {
          topic: topic,
          firstPost: firstPost,
          posts: posts,
          page: page,
          participants: participants,
          left: left,
          userIsSubscribed: subscriptionExists,
          userCanEdit: ( ( !topic.lockedByID && params.session.userID === topic.authorID ) || params.session.moderateDiscussions ) && topic.discussionID !== 1,
          userCanReply: userCanReply,
          pagination: app.toolbox.helpers.paginate(url + '/id/' + topic.id, page, topic.replies + 1),
          previousAndNext: app.toolbox.helpers.previousAndNext(url + '/id/' + topic.id, page, topic.replies + 1),
          breadcrumbs: app.models.topic.breadcrumbs(topic)
        }
      }
    } else {
      return {
        redirect: {
          url: app.config.comitium.baseUrl + url + '/id/' + topic.id + ( params.url.page ? '/page/' + params.url.page : '' ),
          statusCode: 301
        }
      }
    }
  } else {
    return access
  }
}


async function head(params) {
  return await app.models.topic.metaData({ topicID: params.url.id })
}


async function start(params) {
  let access = await app.toolbox.access.discussionPost({ discussionID: params.url.id, user: params.session })

  if ( access === true ) {
    let discussion = await app.models.discussion.info(params.url.id)

    params.form.title = ''
    params.form.content = app.config.comitium.editorIntro
    params.form.subscribe = true

    return {
      view: 'start',
      content: {
        discussion: discussion,
        breadcrumbs: app.models.topic.breadcrumbs({
          discussionTitle : discussion.title,
          discussionUrl   : discussion.url,
          discussionID    : discussion.id
        })
      }
    }
  } else {
    return access
  }
}


async function startForm(params, context) {
  if ( params.request.method === 'POST' ) {
    let access = await app.toolbox.access.discussionPost({ discussionID: params.url.id, user: params.session })

    if ( access === true ) {
      let discussion = await app.models.discussion.info(params.url.id),
          parsedTitle = app.toolbox.markdown.title(params.form.title),
          parsedContent = app.toolbox.markdown.content(params.form.content),
          url = app.toolbox.slug(params.form.title),
          draft = false,
          time = app.toolbox.helpers.isoDate(),
          saveTopic
      
      url = url.length ? url : 'untitled'

      switch ( params.form.formAction ) {
        default:
          throw new Error('No valid form action received')
        case 'Preview post':
          return {
            view: 'start',
            content: {
              preview: {
                title: parsedTitle,
                content: parsedContent
              },
              discussion: discussion,
              breadcrumbs: app.models.topic.breadcrumbs({
                discussionTitle: discussion.title,
                discussionUrl: discussion.url,
                discussionID: discussion.id
              })
            }
          }
        case 'Save as draft':
        case 'Post your topic':
          if ( params.form.formAction === 'Save as draft' ) {
            draft = true
          }

          saveTopic = await app.models.topic.insert({
            discussionID: discussion.id,
            userID: params.session.userID,
            title: params.form.title,
            titleHtml: parsedTitle,
            url: url,
            text: params.form.content,
            html: parsedContent,
            draft: draft,
            private: false,
            time: time
          })

          if ( saveTopic.success ) {
            if ( params.form.subscribe ) {
              app.models.topic.subscribe({
                userID: params.session.userID,
                topicID: saveTopic.id,
                time: time
              })
            }

            return {
              redirect: draft ? app.config.comitium.baseUrl + 'drafts' : app.config.comitium.baseUrl + 'topic/' + url + '/id/' + saveTopic.id
            }
          } else {
            return {
              view: 'start',
              content: {
                topic: saveTopic,
                discussion: discussion,
                breadcrumbs: app.models.topic.breadcrumbs(discussion.title, discussion.url, discussion.id)
              }
            }
          }
      }
    } else {
      return access
    }
  // If it's a GET, fall back to the default topic start action
  } else {
    return start(params, context)
  }
}


async function startAnnouncement(params) {
  let access = await app.toolbox.access.discussionPost({ discussionID: 2, user: params.session })

  if ( access === true ) {
    let categories = await app.models.discussions.categoriesPost(params.session.groupID)

    params.form.title = ''
    params.form.content = app.config.comitium.editorIntro
    params.form.displayDiscussions = 'none'
    params.form.discussions = []
    params.form.subscribe = true

    return {
      view: 'start-announcement',
      content: {
        categories: categories,
        breadcrumbs: app.models.topic.breadcrumbs({
          discussionTitle: 'Announcements',
          discussionUrl: 'announcements',
          discussionID: 2
        })
      }
    }
  } else {
    return access
  }
}


async function startAnnouncementForm(params, context) {
  if ( params.request.method === 'POST' ) {
    let access = await app.toolbox.access.discussionPost({ discussionID: 2, user: params.session })

    if ( access === true ) {
      params.form.subscribe = params.form.subscribe || false
      params.form.displayDiscussions = params.form.displayDiscussions || 'none'
      params.form.discussions = params.form.discussions || []
      let discussions = []
      params.form.discussions.forEach( function (item) {
        discussions.push(item)
      })

      let categories = await app.models.discussions.categoriesPost(params.session.groupID),
          parsedTitle = app.toolbox.markdown.title(params.form.title),
          parsedContent = app.toolbox.markdown.content(params.form.content),
          url = app.toolbox.slug(params.form.title),
          draft = false,
          time = app.toolbox.helpers.isoDate(),
          saveTopic

      url = url.length ? url : 'untitled'

      switch ( params.form.formAction ) {
        default:
          throw new Error('No valid form action received')
        case 'Preview post':
          return {
            view: 'start-announcement',
            content: {
              preview: {
                title: parsedTitle,
                content: parsedContent
              },
              categories: categories,
              breadcrumbs: app.models.topic.breadcrumbs({
                discussionTitle: 'Announcements',
                discussionUrl: 'announcements',
                discussionID: 2
              })
            }
          }
        case 'Save as draft':
        case 'Post your announcement':
          if ( params.form.formAction === 'Save as draft' ) {
            draft = true
          }

          switch ( params.form.displayDiscussions ) {
            case 'none':
              discussions = [ 2 ]
              break
            case 'all':
              categories.forEach( function (item) {
                item.subcategories.forEach( function (item) {
                  discussions.push(item.discussionID)
                })
              })
              break
          }

          saveTopic = await app.models.topic.insert({
            announcement: true,
            discussionID: 2,
            discussions: discussions,
            userID: params.session.userID,
            title: params.form.title,
            titleHtml: parsedTitle,
            url: url,
            text: params.form.content,
            html: parsedContent,
            draft: draft,
            private: false,
            time: time
          })

          if ( saveTopic.success ) {
            if ( params.form.subscribe ) {
              app.models.topic.subscribe({
                userID: params.session.userID,
                topicID: saveTopic.id,
                time: time
              })
            }

            return {
              redirect: draft ? app.config.comitium.baseUrl + 'drafts' : app.config.comitium.baseUrl + 'announcement/' + url + '/id/' + saveTopic.id
            }
          } else {
            return {
              view: 'start-announcement',
              content: {
                topic: saveTopic,
                categories: categories,
                breadcrumbs: app.models.topic.breadcrumbs({
                  discussionTitle: 'Announcements',
                  discussionUrl: 'announcements',
                  discussionID: 2
                })
              }
            }
          }
      }
    } else {
      return access
    }
  // If it's a GET, fall back to the default announcement start action
  } else {
    return start(params, context)
  }
}


async function startPrivate(params) {
  let invitees = await ( async () => {
    let inviteesArray = []

    if ( params.url.invitee ) {
      let inviteesArray = await app.models.user.info({ userID: params.url.invitee })
      inviteesArray = [ inviteesArray.username ]

      return inviteesArray
    } else if ( params.form.invitees ) {
      inviteesArray = params.form.invitees.split(',')

      for ( var i = 0; i < inviteesArray.length; i += 1 ) {
        inviteesArray[i] = inviteesArray[i].trim()
      }
      return inviteesArray
    } else {
      return false
    }
  })()

  let access = await app.toolbox.access.privateTopicStart({ user: params.session })

  if ( access === true ) {
    params.form.invitees = invitees ? invitees.join(', ') : ''
    params.form.title = ''
    params.form.content = app.config.comitium.editorIntro
    params.form.subscribe = true

    return {
      view: 'start-private',
      content: {
        invitees: invitees
      }
    }
  } else {
    return access
  }
}


async function startPrivateForm(params, context) {
  if ( params.request.method === 'POST' ) {
    let access = await app.toolbox.access.privateTopicStart({ user: params.session })

    if ( access === true ) {
      let url = app.toolbox.slug(params.form.title),
          draft = false,
          time = app.toolbox.helpers.isoDate(),
          parsedTitle = app.toolbox.markdown.title(params.form.title),
          parsedContent = app.toolbox.markdown.content(params.form.content),
          saveTopic

      url = url.length ? url : 'untitled'

      switch ( params.form.formAction ) {
        default:
          return {
            message: 'No valid form action received'
          }
        case 'Preview post':
          return {
            view: 'start-private',
            content: {
              preview: {
                title: parsedTitle,
                content: parsedContent
              }
            }
          }
        case 'Save as draft':
        case 'Post your topic':
          if ( params.form.formAction === 'Save as draft' ) {
            draft = true
          }

          saveTopic = await app.models.topic.insert({
            private: true,
            invitees: params.form.invitees,
            userID: params.session.userID,
            username: params.session.username,
            discussionID: 0,
            title: params.form.title,
            titleHtml: parsedTitle,
            url: url,
            text: params.form.content,
            html: parsedContent,
            draft: draft,
            time: time
          })

          if ( saveTopic.success ) {
            if ( !draft ) {
              let mail = await app.models.content.mail({
                template: 'Topic Invitation',
                replace: {
                  topicUrl: app.config.comitium.baseUrl + 'topic/id/' + saveTopic.id + '/accept/true',
                  author: params.session.username
                }
              })

              saveTopic.invited.forEach(item => {
                if ( item.privateTopicEmailNotification ) {
                  app.toolbox.mail.sendMail({
                    from    : app.config.comitium.email,
                    to      : item.email,
                    subject : mail.subject,
                    text    : mail.text
                  })
                }
              })
            }

            if ( params.form.subscribe ) {
              app.models.topic.subscribe({
                userID: params.session.userID,
                topicID: saveTopic.id,
                time: time
              })
            }

            return {
              redirect: draft ? app.config.comitium.baseUrl + 'drafts' : app.config.comitium.baseUrl + 'topic/id/' + saveTopic.id
            }
          } else {
            return {
              view: 'start-private',
              content: {
                topic: saveTopic
              }
            }
          }
      }
    } else {
      return access
    }
  // If it's a GET, fall back to the default topic start action
  } else {
    return startPrivate(params, context)
  }
}


async function reply(params) {
  let access = await app.toolbox.access.topicReply({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let [
      topic,
      quote
    ] = await Promise.all([
      app.models.topic.info(params.url.id),
      ( async () => {
        if ( params.url.quote && app.isNumeric(params.url.quote) ) {
          return await app.models.post.info(params.url.quote)
        } else {
          return false
        }
      })()
    ])

    params.form.content = app.config.comitium.editorIntro
    let message

    // If the quoted post exists and its topic ID matches this topic ID, add the
    // quote to the post content (this is a security measure, don't remove it).
    if ( quote && quote.topicID === topic.id && quote.text ) {
      params.form.content = '> [**' + quote.author + '** said:](post/id/' + quote.id + ')\n>\n> ' + quote.text.replace(/\n/g, '\n> ') + '\n>\n\n'
    } else if ( params.url.quote && !quote ) {
      message = 'We couldn\'t find the post you\'d like to quote. It may have been deleted.'
    }

    return {
      view: 'reply',
      content: {
        topic: topic,
        message: message
      }
    }
  } else {
    return access
  }
}


async function replyForm(params, context) {
  if ( params.request.method === 'POST' ) {
    let access = await app.toolbox.access.topicReply({ topicID: params.url.id, user: params.session })

    if ( access === true ) {
      let topic         = await app.models.topic.info(params.url.id),
          parsedContent = app.toolbox.markdown.content(params.form.content),
          draft         = false,
          time          = app.toolbox.helpers.isoDate(),
          reply, page, pageParameter, controller, urlTitle, replyUrl, forwardToUrl

      switch ( params.form.formAction ) {
        default:
          throw new Error('No valid form action received')
        case 'Preview post':
          return {
            view: 'reply',
            content: {
              preview: {
                content: parsedContent
              },
              topic: topic
            }
          }
        case 'Save as draft':
        case 'Submit your reply':
          if ( params.form.formAction === 'Save as draft' ) {
            draft = true
          }

          if ( !params.form.content.trim().length ) {
            return {
              view: 'reply',
              content: {
                message: 'All fields are required.',
                topic: topic
              }
            }
          }

          reply = await app.models.topic.reply({
            topicID: topic.id,
            discussionID: topic.discussionID,
            userID: params.session.userID,
            html: parsedContent,
            text: params.form.content,
            draft: draft,
            private: topic.private,
            time: time
          })

          page = Math.ceil( ( topic.replies + 2 ) / 25 ),
          pageParameter = page === 1 ? '' : '/page/' + page,
          controller = topic.discussionID === 2 ? 'announcement' : 'topic',
          urlTitle = topic.private ? '' : '/' + topic.url,
          replyUrl = app.config.comitium.baseUrl + controller + urlTitle + '/id/' + topic.id + pageParameter + '#' + reply.id,
          forwardToUrl = draft ? app.config.comitium.baseUrl + '/drafts' : replyUrl

          if ( params.form.subscribe ) {
            await app.models.topic.subscribe({
              userID: params.session.userID,
              topicID: topic.id,
              time: time
            })
          }

          // If it's not a draft post, notify the topic subscribers
          if ( !draft ) {
            notifySubscribers({
              topicID: topic.id,
              scope: 'updates',
              skip: [ params.session.userID ],
              time: time,
              template: 'Topic Reply',
              replace: {
                replyAuthor: params.session.username,
                replyUrl: replyUrl,
                topicTitle: topic.private ? 'Private Topic (title withheld for your privacy)' : topic.title,
                unsubscribeUrl: app.config.comitium.baseUrl + 'topic/action/unsubscribe/id/' + topic.id
              }
            })
          }

          return {
            content: reply,
            redirect: forwardToUrl
          }
      }
    }
  // If it's a GET, fall back to the default topic reply action
  } else {
    return reply(params, context)
  }
}


async function notifySubscribers(args) {
  let subscribersToNotify = await app.models.topic.subscribersToUpdate({ topicID: args.topicID, skip: args.skip })

  if ( subscribersToNotify.length ) {
    let mail = await app.models.content.mail({ template: args.template, replace: args.replace })

    for ( var i = 0; i < subscribersToNotify.length; i++ ) {
      app.toolbox.mail.sendMail({
        from: app.config.comitium.email,
        to: subscribersToNotify[i].email,
        subject: mail.subject,
        text: mail.text
      })
    }
    if ( args.scope === 'updates' ) {
      app.models.topic.subscriptionNotificationSentUpdate({ topicID: args.topicID, time: args.time })
    }
  }
}


async function subscribe(params) {
  let access = await app.toolbox.access.topicSubscribe({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let [
      topic
    ] = await Promise.all([
      app.models.topic.info(params.url.id),
      app.models.topic.subscribe({
        userID: params.session.userID,
        topicID: params.url.id,
        time: app.toolbox.helpers.isoDate()
      })
    ])

    return {
      redirect: app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + params.route.controller + '/' + topic.url + '/id/' + topic.id)
    }
  } else {
    return access
  }
}


async function unsubscribe(params) {
  let access = await app.toolbox.access.topicSubscribe({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    await Promise.all([
      app.models.topic.info(params.url.id),
      app.models.topic.unsubscribe({
        userID: params.session.userID,
        topicID: params.url.id
      })
    ])

    return {
      redirect: app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + 'subscriptions')
    }
  } else {
    return access
  }
}


async function leave(params) {
  let access = await app.toolbox.access.topicView({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    params.form.forwardToUrl = app.config.comitium.baseUrl + 'private-topics'
    let topic = await app.models.topic.info(params.url.id)

    return {
      view: 'leave',
      content: {
        topic: topic
      }
    }
  } else {
    return access
  }
}


async function leaveForm(params, context) {
  if ( params.request.method === 'POST' ) {
    let access = await app.toolbox.access.topicView({ topicID: params.form.topicID, user: params.session })

    if ( access === true ) {
      await app.models.topic.leave({ topicID: params.form.topicID, userID: params.session.userID })
      return {
        redirect: params.form.forwardToUrl
      }
    } else {
      return access
    }
  // If it's a GET, fall back to the default leave action
  } else {
    return leave(params, context)
  }
}


async function lock(params) {
  let access = await app.toolbox.access.topicLock({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let topic = await app.models.topic.info(params.url.id)

    params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + params.route.controller + '/' + topic.url + '/id/' + topic.id)
    params.form.reason = ''

    return {
      view: 'lock',
      content: {
        topic: topic
      }
    }
  } else {
    return access
  }
}


async function lockForm(params, context) {
  if ( params.request.method === 'POST' ) {
    let access = await app.toolbox.access.topicLock({ topicID: params.url.id, user: params.session })

    if ( access === true ) {
      let topic = await app.models.topic.info(params.url.id)

      await app.models.topic.lock({
        topicID: topic.id,
        lockedByID: params.session.userID,
        lockReason: app.toolbox.markdown.inline(params.form.reason)
      })

      if ( params.form.notify ) {
        notifySubscribers({
          topicID: topic.id,
          template: 'Topic Lock',
          replace: {
            topicTitle: topic.title,
            topicUrl: app.config.comitium.baseUrl + 'topic/' + topic.url + '/id/' + topic.id,
            reason: params.form.reason
          }
        })
      }

      return {
        redirect: params.form.forwardToUrl
      }
    } else {
      return access
    }
  } else {
    return lock(params, context)
  }
}


async function unlock(params) {
  let access = await app.toolbox.access.topicLock({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    await app.models.topic.unlock({ topicID: params.url.id })

    return {
      redirect: params.request.headers.referer
    }
  } else {
    return access
  }
}


async function edit(params) {
  let access = await app.toolbox.access.topicEdit({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let topic = await app.models.topic.info(params.url.id)

    params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + '/topic/' + topic.id + '/' + topic.url)
    params.form.title = topic.title
    params.form.content = topic.text

    return {
      view: 'edit',
      content: {
        topic: topic
      }
    }
  } else {
    return access
  }
}


async function editForm(params, context) {
  if ( params.request.method === 'POST' ) {
    let access = await app.toolbox.access.topicEdit({ topicID: params.url.id, user: params.session })

    if ( access === true ) {
      let topic         = await app.models.topic.info(params.url.id),
          firstPost     = await app.models.post.info(topic.firstPostID),
          announcement  = topic.discussionID === 2 ? true : false,
          parsedTitle   = app.toolbox.markdown.title(params.form.title),
          parsedContent = app.toolbox.markdown.content(params.form.content),
          parsedReason  = app.toolbox.markdown.inline(params.form.reason),
          time          = app.toolbox.helpers.isoDate(),
          url           = app.toolbox.slug(params.form.title),
          edit, err
          
      url = url.length ? url : 'untitled'

      switch ( params.form.formAction ) {
        default:
          err = new Error('No valid form action received')
          throw err
        case 'Preview changes':
          return {
            view: 'edit',
            content: {
              preview: {
                title: parsedTitle,
                content: parsedContent
              },
              topic: topic
            }
          }
        case 'Save changes':
          edit = await app.models.topic.edit({
            topicID: topic.id,
            discussionID: topic.discussionID,
            postID: topic.firstPostID,
            editorID: params.session.userID,
            currentPost: firstPost,
            title: params.form.title,
            titleHtml: parsedTitle,
            url: url,
            text: params.form.content,
            html: parsedContent,
            reason: parsedReason,
            time: time
          })

          if ( edit.success ) {
            return {
              redirect: announcement ? app.config.comitium.baseUrl + 'announcement/' + url + '/id/' + topic.id : app.config.comitium.baseUrl + 'topic/' + url + '/id/' + topic.id
            }
          } else {
            return {
              view: 'edit',
              content: {
                topic: edit
              }
            }
          }
      }
    } else {
      return access
    }
  } else {
    return edit(params, context)
  } 
}


async function move(params) {
  let access = await app.toolbox.access.topicMove({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let [
      topic,
      categories
    ] = await Promise.all([
      app.models.topic.info(params.url.id),
      app.models.discussions.categories(params.session.groupID)
    ])

    params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + 'topic/action/move/id/' + topic.id)

    return {
      view: 'move',
      content: {
        topic: topic,
        categories: categories
      }
    }
  } else {
    return access
  }
}


async function moveForm(params, context) {
  if ( params.request.method === 'POST' ) {
    let access = await app.toolbox.access.topicMoveForm({
          topicID: params.url.id,
          newDiscussionID: params.form.destination,
          user: params.session
        })

    if ( access === true ) {
      let topic         = await app.models.topic.info(params.url.id),
          newDiscussion = await app.models.discussion.info(params.form.destination)

      await app.models.topic.move({
              topicID: topic.id,
              topicUrl: topic.url,
              discussionID: topic.discussionID,
              discussionUrl: topic.discussionUrl,
              newDiscussionID: newDiscussion.id
            })
      
      if ( params.form.notify ) {
        notifySubscribers({
          topicID: topic.id,
          template: 'Topic Move',
          replace: {
            topicTitle: topic.title,
            topicUrl: app.config.comitium.baseUrl + 'topic/' + topic.url + '/id/' + topic.id,
            oldDiscussionTitle: topic.discussionTitle,
            newDiscussionTitle: newDiscussion.title
          }
        })
      }

      return {
        redirect: params.form.forwardToUrl
      }
    } else {
      return access
    }
  } else {
    return move(params, context)
  }
}


async function trash(params) {
  let access = await app.toolbox.access.topicTrash({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let topic = await app.models.topic.info(params.url.id)

    params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + 'topic/action/trash/id/' + topic.id)
    params.form.reason = ''

    return {
      view: 'trash',
      content: {
        topic: topic
      }
    }
  } else {
    return access
  }
}


async function trashForm(params, context) {
  if ( params.request.method === 'POST' ) {
    let access = await app.toolbox.access.topicTrash({ topicID: params.url.id, user: params.session })

    if ( access === true ) {
      let topic = await app.models.topic.info(params.url.id)

      await app.models.topic.move({
        topicID: topic.id,
        discussionID: topic.discussionID,
        newDiscussionID: 1
      })

      if ( params.form.notify ) {
        notifySubscribers({
          topicID: topic.id,
          template: 'Topic Delete',
          replace: {
            topicTitle: topic.title,
            reason: params.form.reason
          }
        })
      }

      return {
        redirect: params.form.forwardToUrl
      }
    } else {
      return access
    }
  } else {
    return trash(params, context)
  }
}
