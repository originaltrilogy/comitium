// content controller

export const handler = async (params) => {
  let [
    content,
    userCanEdit
  ] = await Promise.all([
    app.models.content.info(params.url.id),
    app.helpers.access.contentEdit({
      user: params.session,
      contentID: params.url.id,
      response: 'boolean'
    })
  ])

  if ( content ) {
    if ( params.route.descriptor === content.url ) {
      // content.userCanEdit = userCanEdit
      return {
        local: {
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
    let err = new Error('The requested content doesn\'t exist.')
    err.statusCode = 404
    throw err
  }
}


export const edit = async (params) => {
  let access = await app.helpers.access.contentEdit({ user: params.session, contentID: params.url.id })

  if ( access === true ) {
    let content = await app.models.content.info(params.url.id)

    params.form.title_markdown = content.title_markdown
    params.form.content_markdown = content.content_markdown

    return {
      local: {
        content: content
      },
      view: 'edit'
    }
  } else {
    return access
  }
}


export const editForm = async (params, request) => {
  if ( request.method === 'POST' ) {
    let access = await app.helpers.access.contentEdit({ user: params.session, contentID: params.url.id })

    if ( access === true ) {
      let editContent = await app.models.content.edit({
        id: params.url.id,
        title_markdown: params.form.title_markdown,
        title_html: app.helpers.markdown.title(params.form.title_markdown),
        url: app.helpers.slug(params.form.title_markdown),
        content_markdown: params.form.content_markdown,
        content_html: app.helpers.markdown.content(params.form.content_markdown),
        modified_by_id: params.session.user_id
      })

      if ( editContent.success ) {
        return {
          redirect: 'content/' + editContent.url + '/id/' + params.url.id
        }
      } else {
        let content = await app.models.content.info(params.url.id)
        return {
          local: {
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
    return edit(params)
  }
}
