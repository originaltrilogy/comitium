// content controller

'use strict'

module.exports = {
  handler   : handler,
  edit      : edit,
  editForm  : editForm
}


// default action
async function handler(params) {
  let [
    content,
    userCanEdit
  ] = await Promise.all([
    app.models.content.info(params.url.id),
    app.toolbox.access.contentEdit({
      user: params.session,
      contentID: params.url.id,
      response: 'boolean'
    })
  ])

  if ( content ) {
    if ( params.route.descriptor === content.url ) {
      // content.userCanEdit = userCanEdit
      return {
        content: {
          content: content,
          userCanEdit: userCanEdit
        }
      }
    } else {
      return {
        redirect: {
          url: app.config.comitium.baseUrl + 'content/' + content.url + '/id/' + params.url.id,
          statusCode: 301
        }
      }
    }
  } else {
    let err = new Error()
    err.statusCode = 404
    throw err
  }
}


async function edit(params) {
  let access = await app.toolbox.access.contentEdit({ user: params.session, contentID: params.url.id })

  if ( access === true ) {
    let content = await app.models.content.info(params.url.id)

    params.form.title_markdown = content.title_markdown
    params.form.content_markdown = content.content_markdown

    return {
      content: {
        content: content
      },
      view: 'edit'
    }
  } else {
    return access
  }
}


async function editForm(params, context) {
  if ( params.request.method === 'POST' ) {
    let access = await app.toolbox.access.contentEdit({ user: params.session, contentID: params.url.id })

    if ( access === true ) {
      let editContent = await app.models.content.edit({
        id: params.url.id,
        title_markdown: params.form.title_markdown,
        title_html: app.toolbox.markdown.title(params.form.title_markdown),
        url: app.toolbox.slug(params.form.title_markdown),
        content_markdown: params.form.content_markdown,
        content_html: app.toolbox.markdown.content(params.form.content_markdown),
        modified_by_id: params.session.userID
      })

      if ( editContent.success ) {
        return {
          redirect: 'content/' + editContent.url + '/id/' + params.url.id
        }
      } else {
        let content = await app.models.content.info(params.url.id)
        return {
          content: {
            content: content,
            message: editContent.message
          },
          view: 'edit'
        }
      }
    } else {
      return access
    }
  } else {
    edit(params, context)
  }
}
