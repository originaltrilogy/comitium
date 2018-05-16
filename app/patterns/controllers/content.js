// content controller

'use strict'

module.exports = {
  handler: handler,
  edit: edit,
  editForm: editForm
}


// default action
function handler(params, context, emitter) {
  app.listen({
    content: function (emitter) {
      app.models.content.getContent(params.url.id, emitter)
    },
    userCanEdit: function (emitter) {
      app.toolbox.access.contentEdit({
        user: params.session,
        contentID: params.url.id,
        response: 'boolean'
      }, emitter)
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.content ) {
        output.content.userCanEdit = output.userCanEdit;
        emitter.emit('ready', {
          content: output.content
        })
      } else {
        emitter.emit('error', {
          statusCode: 404
        })
      }
    } else {
      emitter.emit('error', output.listen)
    }
  })
}


function edit(params, context, emitter) {
  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.contentEdit({
        user: params.session,
        contentID: params.url.id
      }, emitter)
    },
    content: function (previous, emitter) {
      if ( previous.access === true ) {
        app.models.content.getContent(params.url.id, emitter)
      } else {
        emitter.emit('end', false)
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        params.form.title_markdown = output.content.title_markdown
        params.form.content_markdown = output.content.content_markdown

        emitter.emit('ready', {
          content: output.content,
          view: 'edit'
        })
      } else {
        emitter.emit('ready', output.access)
      }
    } else {
      emitter.emit('error', output.listen)
    }
  })
}


function editForm(params, context, emitter) {
  if ( params.request.method === 'POST' ) {
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.contentEdit({
          user: params.session,
          contentID: params.url.id
        }, emitter)
      },
      editContent: function (previous, emitter) {
        if ( previous.access === true ) {
          app.models.content.edit({
            id: params.url.id,
            title_markdown: params.form.title_markdown,
            title_html: app.toolbox.markdown.title(params.form.title_markdown),
            title_url: app.toolbox.slug(params.form.title_markdown),
            content_markdown: params.form.content_markdown,
            content_html: app.toolbox.markdown.content(params.form.content_markdown),
            modified_by_id: params.session.userID
          }, emitter)
        } else {
          emitter.emit('end', false)
        }
      }
    }, function (output) {
      if ( output.listen.success ) {
        if ( output.access === true ) {
          emitter.emit('ready', {
            redirect: 'content/' + output.editContent.title_url + '/id/' + params.url.id
          })
        } else {
          emitter.emit('ready', output.access)
        }
      } else {
        emitter.emit('error', output.listen)
      }
    })
  } else {
    edit(params, context, emitter)
  }
}