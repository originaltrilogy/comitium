// post controller

export const handler = async (params) => {
  let access = await app.helpers.access.postView({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    let post  = await app.models.post.info(params.url.id),
        topic = await app.models.topic.info(post.topic_id),
        topicController = topic.discussion_id !== 2 ? 'topic' : 'announcement',
        topicUrlTitle = topic.private ? '' : '/' + topic.url

    topic.url = topicController + topicUrlTitle + '/id/' + post.topic_id,
    post.url = 'post/id/' + post.id + '/action/topic#' + post.id

    return {
      local: {
        post: post,
        topic: topic
      }
    }
  } else {
    return access
  }
}


export const edit = async (params, request) => {
  let access = await app.helpers.access.postEdit({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    let post = await app.models.post.info(params.url.id)

    params.form.forwardToUrl = app.helpers.access.signInRedirect(request, app.config.comitium.baseUrl + '/post/' + post.id)
    params.form.content = post.text
    params.form.reason = ''

    return {
      view: 'edit',
      local: {
        post: post
      }
    }
  } else {
    return access
  }
}


export const editForm = async (params, request) => {
  let access = await app.helpers.access.postEdit({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    if ( request.method === 'POST' ) {
      let post = await app.models.post.info(params.url.id),
          postEdit,
          parsedContent = app.helpers.markdown.content(params.form.content),
          parsedReason = app.helpers.markdown.inline(params.form.reason),
          draft = false,
          time = app.helpers.util.isoDate(),
          forwardToUrl
  
      switch ( params.form.formAction ) {
        default:
          throw new Error('No valid form action received')
        case 'Preview post':
          return {
            local: {
              preview: {
                content: parsedContent
              },
              post: post
            },
            view: 'edit'
          }
        case 'Save as draft':
        case 'Save changes':
          if ( params.form.formAction === 'Save as draft' ) {
            draft = true
          }
  
          postEdit = await app.models.post.edit({
            id: post.id,
            editorID: params.session.user_id,
            text: params.form.content,
            html: parsedContent,
            reason: parsedReason,
            currentPost: post,
            draft: draft,
            time: time
          })
  
          forwardToUrl = draft ? app.config.comitium.baseUrl + '/drafts' : params.form.forwardToUrl
  
          if ( postEdit.success ) {
            return {
              redirect: forwardToUrl.indexOf('/topic/') >= 0 ? forwardToUrl + '#' + post.id : forwardToUrl
            }
          } else {
            return {
              local: {
                post: post,
                message: postEdit.message
              },
              view: 'edit'
            }
          }
      }
    } else {
      return edit(params, request)
    }
  } else {
    return access
  }
}


export const lock = async (params, request) => {
  let access = await app.helpers.access.postLock({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    let post = await app.models.post.info(params.url.id)
    
    params.form.forwardToUrl = app.helpers.access.signInRedirect(request, app.config.comitium.baseUrl + '/post/id/' + post.id)
    params.form.reason = ''

    return {
      view: 'lock',
      local: {
        post: post
      },
      include: {
        post: '/post/id/' + post.id
      }
    }
  } else {
    return access
  }
}


export const lockForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    let access = await app.helpers.access.postLock({ postID: params.url.id, user: params.session })

    if ( access === true ) {
      let post = await app.models.post.info(params.url.id)
      
      await app.models.post.lock({
        postID: post.id,
        topicID: post.topic_id,
        lockedByID: params.session.user_id,
        lockReason: app.helpers.markdown.inline(params.form.reason)
      })

      if ( params.form.notify ) {
        let [
          user,
          mail
        ] = await Promise.all([
          app.models.user.info({ userID: post.author_id }),
          app.models.content.mail({
            template: 'Post Lock',
            replace: {
              postUrl: app.config.comitium.baseUrl + 'post/id/' + post.id,
              postText: post.text,
              topicTitle: post.topic_title,
              topicUrl: app.config.comitium.baseUrl + 'topic/' + post.topic_url + '/id/' + post.topic_id,
              reason: params.form.reason
            }
          })
        ])

        app.helpers.mail.sendMail({
          from: app.config.comitium.email,
          to: user.email,
          subject: mail.subject,
          text: mail.text
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


export const report = async (params, request) => {
  let access = await app.helpers.access.postReport({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    let post = await app.models.post.info(params.url.id)

    params.form.forwardToUrl = app.helpers.access.signInRedirect(request, app.config.comitium.baseUrl + '/post/id/' + post.id)
    params.form.reason = ''

    return {
      view: 'report',
      local: {
        post: post
      },
      include: {
        post: '/post/id/' + post.id
      }
    }
  } else {
    return access
  }
}


export const reportForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    let access = await app.helpers.access.postReport({ postID: params.url.id, user: params.session })
  
    if ( access === true ) {
      let post = await app.models.post.info(params.url.id),
          saveReport = await app.models.post.saveReport({
            userID: params.session.user_id,
            postID: params.url.id,
            reason: app.helpers.markdown.inline(params.form.reason)
          })

      if ( saveReport.success ) {
        let mail = await app.models.content.mail({
          template: 'Post Report',
          replace: {
            reporter: params.session.username,
            postUrl: app.config.comitium.baseUrl + 'post/id/' + post.id,
            postText: post.text,
            topicTitle: post.topic_title,
            topicUrl: app.config.comitium.baseUrl + 'topic/' + post.topic_url + '/id/' + post.topic_id,
            reason: params.form.reason
          }
        })

        app.helpers.mail.sendMail({
          from: app.config.comitium.email,
          to: app.config.comitium.reportEmail, // remove when post report UI is complete
          subject: mail.subject,
          text: mail.text
        })
    
        return {
          redirect: params.form.forwardToUrl
        }
      } else {
        return {
          view: 'report',
          local: {
            message: saveReport.message,
            post: post
          },
          include: {
            post: '/post/id/' + post.id
          }
        }
      }
    } else {
      return access
    }
  } else {
    return report(params, request)
  }
}


export const topic = async (params) => {
  let [
    post,
    page
  ] = await Promise.all([
    app.models.post.info(params.url.id),
    app.models.post.page(params.url.id)
  ])

  if ( post ) {
    params.url.id = post.topic_id
    params.url.page = page

    return {
      next: {
        controller: 'topic'
      },
      topic: {
        id: post.topic_id,
        page: page
      },
      view: false
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


export const trash = async (params, request) => {
  let access = await app.helpers.access.postTrash({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    let post = await app.models.post.info(params.url.id)

    params.form.forwardToUrl = app.helpers.access.signInRedirect(request, app.config.comitium.baseUrl + '/post/id/' + post.id)
    params.form.reason = ''

    return {
      view: 'trash',
      local: {
        post: post
      },
      include: {
        post: '/post/id/' + post.id
      }
    }
  } else {
    return access
  }
}


export const trashForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    let access = await app.helpers.access.postTrash({ postID: params.url.id, user: params.session })

    if ( access === true ) {
      let post = await app.models.post.info(params.url.id)

      await app.models.post.trash({
        postID: post.id,
        topicID: post.topic_id,
        discussionID: post.discussion_id,
        authorID: post.userID,
        deletedByID: params.session.user_id,
        deleteReason: app.helpers.markdown.inline(params.form.reason)
      })

      if ( params.form.notify ) {
        let [
          user,
          mail
        ] = await Promise.all([
          app.models.user.info({ userID: post.author_id }),
          app.models.content.mail({
            template: 'Post Delete',
            replace: {
              postID: post.id,
              postText: post.text,
              topicTitle: post.topic_title,
              topicUrl: app.config.comitium.baseUrl + 'topic/' + post.topic_url + '/id/' + post.topic_id,
              reason: params.form.reason
            }
          })
        ])

        app.helpers.mail.sendMail({
          from: app.config.comitium.email,
          to: user.email,
          subject: mail.subject,
          text: mail.text
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


export const unlock = async (params, request) => {
  let access = await app.helpers.access.postLock({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    let post = await app.models.post.info(params.url.id)

    await app.models.post.unlock({ postID: post.id, topicID: post.topic_id })

    return {
      redirect: request.headers.referer
    }
  } else {
    return access
  }
}
