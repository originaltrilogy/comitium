// members controller

'use strict'

module.exports = {
  handler: handler,
  head: head
}


function handler(params, context, emitter) {
  let sort = params.url.sort || 'default'

  app.listen({
    members: function (emitter) {
      let page = params.url.page || 1,
          start = ( page - 1 ) * 25,
          end = start + 25

      app.models.members.all({
        sort: sort,
        start: start,
        end: end
      }, emitter)
    }
  }, function (output) {
    if ( output.listen.success ) {
      emitter.emit('ready', {
        content: {
          // breadcrumbs: app.models.members.breadcrumbs(),
          members: output.members
        }
      })
    } else {
      emitter.emit('error', output.listen)
    }
  })
}


function head(params, context, emitter) {
  emitter.emit('ready', app.models.members.metaData())
}
