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
      app.models.content.getContent(params.url.content, emitter)
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.content ) {
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
        contentID: params.route.descriptor
      }, emitter)
    },
    content: function (previous, emitter) {
      if ( previous.access === true ) {
        app.models.content(params.route.descriptor, emitter)
      } else {
        emitter.emit('error', previous.access)
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
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
  if ( params.request.method === 'post' ) {
    app.listen('waterfall', {
      access: function (emitter) {
        app.toolbox.access.contentEdit({
          user: params.session,
          contentID: params.route.descriptor
        }, emitter)
      },
      content: function (emitter) {
        app.models.content(params.route.descriptor, emitter)
      }
    }, function (output) {
      if ( output.listen.success ) {
        emitter.emit('ready', {
          content: output.content,
          view: 'edit'
        })
      } else {
        emitter.emit('error', output.listen)
      }
    })
  } else {
    edit(params, context, emitter)
  }
}