// topic controller

export const handler = async (params, request, response, context) => {
  // Use topic info handed off from the post controller if it exists
  if ( context.topic ) {
    params.url.id   = context.topic.id
    params.url.page = context.topic.page
  }
  // Verify the user's group has read access to the topic's parent discussion
  let access = await app.helpers.access.topicView({ topicID: params.url.id, user: params.session })

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
            userID: params.session.user_id,
            viewTime: params.session.last_activity
          })
        } else {
          return false
        }
      })()
    ])

    let page = parseInt(params.url.page, 10) || 1,
        type,
        url

    switch ( topic.discussion_id ) {
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
    if ( firstUnreadPost && firstUnreadPost.post.id !== topic.first_post_id ) {
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
          if ( params.session.user_id ) {
            return await app.models.topic.subscriptionExists({
              userID: params.session.user_id,
              topicID: topic.id
            })
          } else {
            return false
          }
        })(),
        // userCanReply
        app.helpers.access.topicReply({
          topicID: topic.id,
          user: params.session,
          response: 'boolean'
        }),
        // viewTimeUpdate
        ( async () => {
          if ( params.session.user_id ) {
            return await app.models.topic.viewTimeUpdate({
              userID: params.session.user_id,
              topic: topic,
              time: app.helpers.util.isoDate()
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
                userID: params.session.user_id,
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
        local: {
          topic: topic,
          firstPost: firstPost,
          posts: posts,
          page: page,
          participants: participants,
          left: left,
          userIsSubscribed: subscriptionExists,
          userCanEdit: ( ( !topic.locked_by_id && params.session.user_id === topic.author_id ) || params.session.moderate_discussions ) && topic.discussion_id !== 1,
          userCanReply: userCanReply,
          pagination: app.helpers.util.paginate(url + '/id/' + topic.id, page, topic.replies + 1),
          previousAndNext: app.helpers.util.previousAndNext(url + '/id/' + topic.id, page, topic.replies + 1),
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


export const head = async (params) => {
  return await app.models.topic.metaData({ topicID: params.url.id })
}


export const start = async (params) => {
  let access = await app.helpers.access.discussionPost({ discussionID: params.url.id, user: params.session })

  if ( access === true ) {
    let discussion = await app.models.discussion.info(params.url.id)

    params.form.title = ''
    params.form.content = app.config.comitium.copy.editorIntro
    params.form.subscribe = true

    return {
      view: 'start',
      local: {
        discussion: discussion,
        breadcrumbs: app.models.topic.breadcrumbs({
          discussion_title : discussion.title,
          discussion_url   : discussion.url,
          discussion_id    : discussion.id
        })
      }
    }
  } else {
    return access
  }
}


export const startForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    let access = await app.helpers.access.discussionPost({ discussionID: params.url.id, user: params.session })

    if ( access === true ) {
      let discussion = await app.models.discussion.info(params.url.id),
          parsedTitle = app.helpers.markdown.title(params.form.title),
          parsedContent = app.helpers.markdown.content(params.form.content),
          url = app.helpers.slug(params.form.title),
          draft = false,
          time = app.helpers.util.isoDate(),
          saveTopic
      
      url = url.length ? url : 'untitled'

      switch ( params.form.formAction ) {
        default:
          throw new Error('No valid form action received')
        case 'Preview post':
          return {
            view: 'start',
            local: {
              preview: {
                title: parsedTitle,
                content: parsedContent
              },
              discussion: discussion,
              breadcrumbs: app.models.topic.breadcrumbs({
                discussion_title: discussion.title,
                discussion_url: discussion.url,
                discussion_id: discussion.id
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
            user: params.session,
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
                userID: params.session.user_id,
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
              local: {
                topic: saveTopic,
                discussion: discussion,
                breadcrumbs: app.models.topic.breadcrumbs({
                  discussion_title: discussion.title,
                  discussion_url: discussion.url,
                  discussion_id: discussion.id
                })
              }
            }
          }
      }
    } else {
      return access
    }
  // If it's a GET, fall back to the default topic start action
  } else {
    return start(params)
  }
}


export const startAnnouncement = async (params) => {
  let access = await app.helpers.access.discussionPost({ discussionID: 2, user: params.session })

  if ( access === true ) {
    let categories = await app.models.discussions.categoriesPost(params.session.group_id)

    params.form.title = ''
    params.form.content = app.config.comitium.copy.editorIntro
    params.form.displayDiscussions = 'none'
    params.form.discussions = []
    params.form.subscribe = true

    return {
      view: 'start-announcement',
      local: {
        categories: categories,
        breadcrumbs: app.models.topic.breadcrumbs({
          discussion_title: 'Announcements',
          discussion_url: 'announcements',
          discussion_id: 2
        })
      }
    }
  } else {
    return access
  }
}


export const startAnnouncementForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    let access = await app.helpers.access.discussionPost({ discussionID: 2, user: params.session })

    if ( access === true ) {
      params.form.subscribe = params.form.subscribe || false
      params.form.displayDiscussions = params.form.displayDiscussions || 'none'
      params.form.discussions = params.form.discussions || []
      let discussions = []
      
      if ( Array.isArray(params.form.discussions) ) {
        discussions = params.form.discussions
      } else {
        discussions.push(params.form.discussions)
      }

      let categories = await app.models.discussions.categoriesPost(params.session.group_id),
          parsedTitle = app.helpers.markdown.title(params.form.title),
          parsedContent = app.helpers.markdown.content(params.form.content),
          url = app.helpers.slug(params.form.title),
          draft = false,
          time = app.helpers.util.isoDate(),
          saveTopic

      url = url.length ? url : 'untitled'

      switch ( params.form.formAction ) {
        default:
          throw new Error('No valid form action received')
        case 'Preview post':
          return {
            view: 'start-announcement',
            local: {
              preview: {
                title: parsedTitle,
                content: parsedContent
              },
              categories: categories,
              breadcrumbs: app.models.topic.breadcrumbs({
                discussion_title: 'Announcements',
                discussion_url: 'announcements',
                discussion_id: 2
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
                  discussions.push(item.discussion_id)
                })
              })
              break
          }

          saveTopic = await app.models.topic.insert({
            announcement: true,
            discussionID: 2,
            discussions: discussions,
            user: params.session,
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
                userID: params.session.user_id,
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
              local: {
                topic: saveTopic,
                categories: categories,
                breadcrumbs: app.models.topic.breadcrumbs({
                  discussion_title: 'Announcements',
                  discussion_url: 'announcements',
                  discussion_id: 2
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
    return startAnnouncement(params)
  }
}


export const startPrivate = async (params) => {
  let invitees = await ( async () => {
    let inviteesArray = []

    if ( params.url.id ) {
      let inviteesArray = await app.models.user.info({ userID: params.url.id })
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

  let access = await app.helpers.access.privateTopicStart({ user: params.session })

  if ( access === true ) {
    params.form.invitees = invitees ? invitees.join(', ') : ''
    params.form.title = ''
    params.form.content = app.config.comitium.copy.editorIntro
    params.form.subscribe = true

    return {
      view: 'start-private',
      local: {
        invitees: invitees
      }
    }
  } else {
    return access
  }
}


export const startPrivateForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    let access = await app.helpers.access.privateTopicStart({ user: params.session })

    if ( access === true ) {
      let url = app.helpers.slug(params.form.title),
          draft = false,
          time = app.helpers.util.isoDate(),
          parsedTitle = app.helpers.markdown.title(params.form.title),
          parsedContent = app.helpers.markdown.content(params.form.content),
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
            local: {
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
            user: params.session,
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
                if ( item.private_topic_email_notification ) {
                  app.helpers.mail.sendMail({
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
                userID: params.session.user_id,
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
              local: {
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
    return startPrivate(params)
  }
}


export const reply = async (params) => {
  let access = await app.helpers.access.topicReply({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let [
      topic,
      quote
    ] = await Promise.all([
      app.models.topic.info(params.url.id),
      ( async () => {
        if ( params.url.quote ) {
          return await app.models.post.info(params.url.quote)
        } else {
          return false
        }
      })()
    ])

    params.form.content = app.config.comitium.copy.editorIntro
    let message

    // If the quoted post exists and its topic ID matches this topic ID, add the
    // quote to the post content (this is a security measure, don't remove it).
    if ( quote && quote.topic_id === topic.id && quote.text ) {
      params.form.content = '> [**' + quote.author + '** said:](post/id/' + quote.id + ')\n>\n> ' + quote.text.replace(/\n/g, '\n> ') + '\n>\n\n'
    } else if ( params.url.quote && !quote ) {
      message = 'We couldn\'t find the post you\'d like to quote. It may have been deleted.'
    }

    return {
      view: 'reply',
      local: {
        topic: topic,
        message: message
      }
    }
  } else {
    return access
  }
}


export const replyForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    let access = await app.helpers.access.topicReply({ topicID: params.url.id, user: params.session })

    if ( access === true ) {
      let topic             = await app.models.topic.info(params.url.id),
          parsedContent     = app.helpers.markdown.content(params.form.content),
          draft             = false,
          time              = app.helpers.util.isoDate(),
          reply, page, pageParameter, controller, urlTitle, replyUrl, forwardToUrl

      switch ( params.form.formAction ) {
        default:
          throw new Error('No valid form action received')
        case 'Preview post':
          return {
            view: 'reply',
            local: {
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
              local: {
                message: 'All fields are required.',
                topic: topic
              }
            }
          }

          reply = await app.models.topic.reply({
            topicID: topic.id,
            discussionID: topic.discussion_id,
            user: params.session,
            html: parsedContent,
            text: params.form.content,
            draft: draft,
            private: topic.private,
            time: time
          })

          if ( reply.success ) {
            page = Math.ceil( ( topic.replies + 2 ) / 25 ),
            pageParameter = page === 1 ? '' : '/page/' + page,
            controller = topic.discussion_id === 2 ? 'announcement' : 'topic',
            urlTitle = topic.private ? '' : '/' + topic.url,
            replyUrl = app.config.comitium.baseUrl + controller + urlTitle + '/id/' + topic.id + pageParameter + '#' + reply.id,
            forwardToUrl = draft ? app.config.comitium.baseUrl + '/drafts' : replyUrl
  
            if ( params.form.subscribe ) {
              await app.models.topic.subscribe({
                userID: params.session.user_id,
                topicID: topic.id,
                time: time
              })
            }
  
            // If it's not a draft post, notify the topic subscribers
            if ( !draft ) {
              notifySubscribers({
                topicID: topic.id,
                scope: 'updates',
                skip: [ params.session.user_id ],
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
              local: reply,
              redirect: forwardToUrl
            }
          } else {
            return {
              view: 'reply',
              local: {
                topic: reply
              }
            }
          }
      }
    } else {
      return access
    }
  // If it's a GET, fall back to the default topic reply action
  } else {
    return reply(params)
  }
}


export const notifySubscribers = async (args) => {
  let subscribersToNotify
  if ( args.scope === 'updates' ) {
    subscribersToNotify = await app.models.topic.subscribersToUpdate({ topicID: args.topicID, skip: args.skip })
  } else {
    subscribersToNotify = await app.models.topic.subscribers({ topicID: args.topicID, skip: args.skip })
  }

  if ( subscribersToNotify.length ) {
    let mail = await app.models.content.mail({ template: args.template, replace: args.replace })

    for ( var i = 0; i < subscribersToNotify.length; i++ ) {
      app.helpers.mail.sendMail({
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


export const subscribe = async (params, request) => {
  let access = await app.helpers.access.topicSubscribe({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let [
      topic
    ] = await Promise.all([
      app.models.topic.info(params.url.id),
      app.models.topic.subscribe({
        userID: params.session.user_id,
        topicID: params.url.id,
        time: app.helpers.util.isoDate()
      })
    ])

    return {
      redirect: app.helpers.access.signInRedirect(request, app.config.comitium.baseUrl + params.route.controller + '/' + topic.url + '/id/' + topic.id)
    }
  } else {
    return access
  }
}


export const unsubscribe = async (params, request) => {
  let access = await app.helpers.access.topicSubscribe({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    await Promise.all([
      app.models.topic.info(params.url.id),
      app.models.topic.unsubscribe({
        userID: params.session.user_id,
        topicID: params.url.id
      })
    ])

    return {
      redirect: app.helpers.access.signInRedirect(request, app.config.comitium.baseUrl + 'subscriptions')
    }
  } else {
    return access
  }
}


export const leave = async (params) => {
  let access = await app.helpers.access.topicView({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    params.form.forwardToUrl = app.config.comitium.baseUrl + 'private-topics'
    let topic = await app.models.topic.info(params.url.id)

    return {
      view: 'leave',
      local: {
        topic: topic
      }
    }
  } else {
    return access
  }
}


export const leaveForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    let access = await app.helpers.access.topicView({ topicID: params.form.topicID, user: params.session })

    if ( access === true ) {
      await app.models.topic.leave({ topicID: params.form.topicID, userID: params.session.user_id })
      return {
        redirect: params.form.forwardToUrl
      }
    } else {
      return access
    }
  // If it's a GET, fall back to the default leave action
  } else {
    return leave(params)
  }
}


export const lock = async (params, request) => {
  let access = await app.helpers.access.topicLock({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let topic = await app.models.topic.info(params.url.id)

    params.form.forwardToUrl = app.helpers.access.signInRedirect(request, app.config.comitium.baseUrl + params.route.controller + '/' + topic.url + '/id/' + topic.id)
    params.form.reason = ''

    return {
      view: 'lock',
      local: {
        topic: topic
      }
    }
  } else {
    return access
  }
}


export const lockForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    let access = await app.helpers.access.topicLock({ topicID: params.url.id, user: params.session })

    if ( access === true ) {
      let topic = await app.models.topic.info(params.url.id)

      await app.models.topic.lock({
        topicID: topic.id,
        lockedByID: params.session.user_id,
        lockReason: app.helpers.markdown.inline(params.form.reason)
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
    return lock(params, request)
  }
}


export const unlock = async (params, request) => {
  let access = await app.helpers.access.topicLock({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    await app.models.topic.unlock({ topicID: params.url.id })

    return {
      redirect: request.headers.referer
    }
  } else {
    return access
  }
}


export const edit = async (params, request) => {
  let access = await app.helpers.access.topicEdit({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let topic = await app.models.topic.info(params.url.id)

    params.form.forwardToUrl = app.helpers.access.signInRedirect(request, app.config.comitium.baseUrl + '/topic/action/edit/id/' + topic.id)
    params.form.title = topic.title
    params.form.content = topic.text

    return {
      view: 'edit',
      local: {
        topic: topic
      }
    }
  } else {
    return access
  }
}


export const editForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    let access = await app.helpers.access.topicEdit({ topicID: params.url.id, user: params.session })

    if ( access === true ) {
      let topic             = await app.models.topic.info(params.url.id),
          firstPost         = await app.models.post.info(topic.first_post_id),
          announcement      = topic.discussion_id === 2 ? true : false,
          parsedTitle       = app.helpers.markdown.title(params.form.title),
          parsedContent     = app.helpers.markdown.content(params.form.content),
          parsedReason      = app.helpers.markdown.inline(params.form.reason),
          time              = app.helpers.util.isoDate(),
          url               = app.helpers.slug(params.form.title),
          edit, err
          
      url = url.length ? url : 'untitled'

      switch ( params.form.formAction ) {
        default:
          err = new Error('No valid form action received')
          throw err
        case 'Preview changes':
          return {
            view: 'edit',
            local: {
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
            discussionID: topic.discussion_id,
            postID: topic.first_post_id,
            user: params.session,
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
              local: {
                topic: edit
              }
            }
          }
      }
    } else {
      return access
    }
  } else {
    return edit(params, request)
  } 
}


export const merge = async (params, request) => {
  let access = await app.helpers.access.topicMerge({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let topic = await app.models.topic.info(params.url.id),
        topics = await app.models.discussion.topics({
          discussionID: topic.discussion_id,
          end: 150
        })

    params.form.title = topic.title
    params.form.forwardToUrl = app.helpers.access.signInRedirect(request, app.config.comitium.baseUrl + '/topic/' + topic.url + '/id/' + topic.id)

    return {
      view: 'merge',
      local: {
        topic: topic,
        topics: topics
      }
    }
  } else {
    return access
  }
}


export const mergeForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    params.form.topicID = params.form.topicID.filter( item => {
      return item.length
    })

    let access = await app.helpers.access.topicMergeForm({
          topicID: params.form.topicID,
          user: params.session
        })

    if ( access === true ) {
      let mergedTopic = await app.models.topic.merge({
                          time       : app.helpers.util.isoDate(),
                          topicID    : params.form.topicID,
                          lockedByID : params.session.user_id
                        })

      if ( mergedTopic.success ) {
        if ( params.form.notify ) {
          notifySubscribers({
            topicID: mergedTopic.id,
            template: 'Topic Merge',
            replace: {
              topicTitle: mergedTopic.title,
              topicUrl: app.config.comitium.baseUrl + 'topic/' + mergedTopic.url + '/id/' + mergedTopic.id,
              unsubscribeUrl: app.config.comitium.baseUrl + 'topic/action/unsubscribe/id/' + mergedTopic.id
            }
          })
        }
        
        return {
          redirect: app.config.comitium.baseUrl + 'topic/' + mergedTopic.url + '/id/' + mergedTopic.id
        }
      } else {
        let topic = await app.models.topic.info(params.url.id),
            topics = await app.models.discussion.topics({
              discussionID: topic.discussion_id,
              end: 50
            })

        return {
          view: 'merge',
          local: {
            topic: topic,
            topics: topics,
            error: mergedTopic
          }
        }
      }
    } else {
      return access
    }
  } else {
    return merge(params, request)
  }
}


export const move = async (params, request) => {
  let access = await app.helpers.access.topicMove({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let [
      topic,
      categories
    ] = await Promise.all([
      app.models.topic.info(params.url.id),
      app.models.discussions.categories(params.session.group_id)
    ])

    params.form.forwardToUrl = app.helpers.access.signInRedirect(request, app.config.comitium.baseUrl + 'topic/' + topic.url + '/id/' + topic.id)

    return {
      view: 'move',
      local: {
        topic: topic,
        categories: categories
      }
    }
  } else {
    return access
  }
}


export const moveForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    let access = await app.helpers.access.topicMoveForm({
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
              discussionID: topic.discussion_id,
              discussionUrl: topic.discussion_url,
              newDiscussionID: newDiscussion.id
            })
      
      if ( params.form.notify ) {
        notifySubscribers({
          topicID: topic.id,
          template: 'Topic Move',
          replace: {
            topicTitle: topic.title,
            topicUrl: app.config.comitium.baseUrl + 'topic/' + topic.url + '/id/' + topic.id,
            oldDiscussionTitle: topic.discussion_title,
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
    return move(params, request)
  }
}


export const trash = async (params, request) => {
  let access = await app.helpers.access.topicTrash({ topicID: params.url.id, user: params.session })

  if ( access === true ) {
    let topic = await app.models.topic.info(params.url.id)

    params.form.forwardToUrl = app.helpers.access.signInRedirect(request, app.config.comitium.baseUrl + 'topic/action/trash/id/' + topic.id)
    params.form.reason = ''

    return {
      view: 'trash',
      local: {
        topic: topic
      }
    }
  } else {
    return access
  }
}


export const trashForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    let access = await app.helpers.access.topicTrash({ topicID: params.url.id, user: params.session })

    if ( access === true ) {
      let topic = await app.models.topic.info(params.url.id)

      await app.models.topic.move({
        topicID: topic.id,
        discussionID: topic.discussion_id,
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
    return trash(params, request)
  }
}
