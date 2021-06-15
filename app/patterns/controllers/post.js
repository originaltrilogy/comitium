// post controller

'use strict'

module.exports = {
  handler       : handler,
  bookmark      : bookmark,
  edit          : edit,
  editForm      : editForm,
  lock          : lock,
  lockForm      : lockForm,
  report        : report,
  reportForm    : reportForm,
  topic         : topic,
  trash         : trash,
  trashForm     : trashForm,
  unlock        : unlock
}


// default action
async function handler(params) {
  let access = await app.toolbox.access.postView({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    let post  = await app.models.post.info(params.url.id),
        topic = await app.models.topic.info(post.topicID),
        topicController = topic.discussionID !== 2 ? 'topic' : 'announcement',
        topicUrlTitle = topic.private ? '' : '/' + topic.url

    topic.url = topicController + topicUrlTitle + '/id/' + post.topicID,
    post.url = 'post/id/' + post.id + '/action/topic#' + post.id

    return {
      public: {
        post: post,
        topic: topic
      }
    }
  } else {
    return access
  }
}


function bookmark(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.postView({
        postID: params.url.id,
        user: params.session
      }, emitter)
    },
    proceed: function (previous, emitter) {
      if ( previous.access === true ) {
        emitter.emit('ready', true)
      } else {
        emitter.emit('end', false)
      }
    },
    post: function (previous, emitter) {
      app.models.post.info(params.url.id, emitter)
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + 'bookmarks')
        params.form.notes = ''

        emitter.emit('ready', {
          view: 'bookmark',
          public: {
            post: output.post
          },
          include: {
            post: {
              route: '/post/id/' + output.post.id
            }
          }
        })
      } else {
        emitter.emit('ready', output.access)
      }
    } else {
      emitter.emit('error', output.listen)
    }
  })

}


async function edit(params) {
  let access = await app.toolbox.access.postEdit({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    let post = await app.models.post.info(params.url.id)

    params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + '/post/' + post.id)
    params.form.content = post.text
    params.form.reason = ''

    return {
      view: 'edit',
      public: {
        post: post
      }
    }
  } else {
    return access
  }
}


async function editForm(params, request, response, context) {
  let access = await app.toolbox.access.postEdit({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    if ( request.method === 'POST' ) {
      let post = await app.models.post.info(params.url.id),
          postEdit,
          parsedContent = app.toolbox.markdown.content(params.form.content),
          parsedReason = app.toolbox.markdown.inline(params.form.reason),
          draft = false,
          time = app.toolbox.helpers.isoDate(),
          forwardToUrl
  
      switch ( params.form.formAction ) {
        default:
          throw new Error('No valid form action received')
        case 'Preview post':
          return {
            public: {
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
            editorID: params.session.userID,
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
              public: {
                post: post,
                message: postEdit.message
              },
              view: 'edit'
            }
          }
      }
    } else {
      return edit(params, context)
    }
  } else {
    return access
  }
}


async function lock(params) {
  let access = await app.toolbox.access.postLock({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    let post = await app.models.post.info(params.url.id)
    
    params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + '/post/id/' + post.id)
    params.form.reason = ''

    return {
      view: 'lock',
      public: {
        post: post
      },
      include: {
        post: {
          route: '/post/id/' + post.id
        }
      }
    }
  } else {
    return access
  }
}


async function lockForm(params, request, response, context) {
  if ( request.method === 'POST' ) {
    let access = await app.toolbox.access.postLock({ postID: params.url.id, user: params.session })

    if ( access === true ) {
      let post = await app.models.post.info(params.url.id)
      
      await app.models.post.lock({
        postID: post.id,
        topicID: post.topicID,
        lockedByID: params.session.userID,
        lockReason: app.toolbox.markdown.inline(params.form.reason)
      })

      if ( params.form.notify ) {
        let [
          user,
          mail
        ] = await Promise.all([
          app.models.user.info({ userID: post.authorID }),
          app.models.content.mail({
            template: 'Post Lock',
            replace: {
              postUrl: app.config.comitium.baseUrl + 'post/id/' + post.id,
              postText: post.text,
              topicTitle: post.topicTitle,
              topicUrl: app.config.comitium.baseUrl + 'topic/' + post.topicUrl + '/id/' + post.topicID,
              reason: params.form.reason
            }
          })
        ])

        app.toolbox.mail.sendMail({
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
    return lock(params, context)
  }
}


async function report(params) {
  let access = await app.toolbox.access.postReport({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    let post = await app.models.post.info(params.url.id)

    params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + '/post/id/' + post.id)
    params.form.reason = ''

    return {
      view: 'report',
      public: {
        post: post
      },
      include: {
        post: {
          route: '/post/id/' + post.id
        }
      }
    }
  } else {
    return access
  }
}


async function reportForm(params, request, response, context) {
  if ( request.method === 'POST' ) {
    let access = await app.toolbox.access.postReport({ postID: params.url.id, user: params.session })
  
    if ( access === true ) {
      let post = await app.models.post.info(params.url.id),
          saveReport = await app.models.post.saveReport({
            userID: params.session.userID,
            postID: params.url.id,
            reason: app.toolbox.markdown.inline(params.form.reason)
          })

      if ( saveReport.success ) {
        let mail = await app.models.content.mail({
          template: 'Post Report',
          replace: {
            reporter: params.session.username,
            postUrl: app.config.comitium.baseUrl + 'post/id/' + post.id,
            postText: post.text,
            topicTitle: post.topicTitle,
            topicUrl: app.config.comitium.baseUrl + 'topic/' + post.topicUrl + '/id/' + post.topicID,
            reason: params.form.reason
          }
        })

        app.toolbox.mail.sendMail({
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
          public: {
            message: saveReport.message,
            post: post
          },
          include: {
            post: {
              route: '/post/id/' + post.id
            }
          }
        }
      }
    } else {
      return access
    }
  } else {
    return report(params, context)
  }
}


async function topic(params) {
  let [
    post,
    page
  ] = await Promise.all([
    app.models.post.info(params.url.id),
    app.models.post.page(params.url.id)
  ])

  if ( post ) {
    params.url.id = post.topicID
    params.url.page = page

    return {
      handoff: {
        controller: 'topic'
      },
      topic: {
        id: post.topicID,
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


async function trash(params) {
  let access = await app.toolbox.access.postTrash({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    let post = await app.models.post.info(params.url.id)

    params.form.forwardToUrl = app.toolbox.access.signInRedirect(params, app.config.comitium.baseUrl + '/post/id/' + post.id)
    params.form.reason = ''

    return {
      view: 'trash',
      public: {
        post: post
      },
      include: {
        post: {
          route: '/post/id/' + post.id
        }
      }
    }
  } else {
    return access
  }
}


async function trashForm(params, request, response, context) {
  if ( request.method === 'POST' ) {
    let access = await app.toolbox.access.postTrash({ postID: params.url.id, user: params.session })

    if ( access === true ) {
      let post = await app.models.post.info(params.url.id)

      await app.models.post.trash({
        postID: post.id,
        topicID: post.topicID,
        discussionID: post.discussionID,
        authorID: post.userID,
        deletedByID: params.session.userID,
        deleteReason: app.toolbox.markdown.inline(params.form.reason)
      })

      if ( params.form.notify ) {
        let [
          user,
          mail
        ] = await Promise.all([
          app.models.user.info({ userID: post.authorID }),
          app.models.content.mail({
            template: 'Post Delete',
            replace: {
              postID: post.id,
              postText: post.text,
              topicTitle: post.topicTitle,
              topicUrl: app.config.comitium.baseUrl + 'topic/' + post.topicUrl + '/id/' + post.topicID,
              reason: params.form.reason
            }
          })
        ])

        app.toolbox.mail.sendMail({
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
    return trash(params, context)
  }
}


async function unlock(params, request) {
  let access = await app.toolbox.access.postLock({ postID: params.url.id, user: params.session })

  if ( access === true ) {
    let post = await app.models.post.info(params.url.id)

    await app.models.post.unlock({ postID: post.id, topicID: post.topicID })

    return {
      redirect: request.headers.referer
    }
  } else {
    return access
  }
}
