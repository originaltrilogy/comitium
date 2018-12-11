// members controller

'use strict'

module.exports = {
  handler: handler,
  head: head
}


function handler(params, context, emitter) {
  app.listen({
    count: function (emitter) {
      if ( params.url.group ) {
        app.models.group.memberCount(params.url.group, emitter)
      } else {
        app.models.stats.users(emitter)
      }
    },
    group: function (emitter) {
      if ( params.url.group ) {
        app.models.group.info(params.url.group, emitter)
      } else {
        emitter.emit('ready')
      }
    },
    groups: function (emitter) {
      app.models.members.groups(emitter)
    },
    members: function (emitter) {
      let page = params.url.page || 1,
          start = ( page - 1 ) * 25,
          end = start + 25

      if ( !params.url.group ) {
        app.models.members.all({
          order: params.url.order,
          sort: params.url.sort,
          start: start,
          end: end
        }, emitter)
      } else {
        app.models.members.group({
          group: params.url.group,
          order: params.url.order,
          sort: params.url.sort,
          start: start,
          end: end
        }, emitter)
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      emitter.emit('ready', {
        content: {
          // breadcrumbs: app.models.members.breadcrumbs(),
          count: output.count,
          group: output.group,
          groups: output.groups,
          members: output.members,
          pagination: app.toolbox.helpers.paginate(params.route.pathname, params.url.page || 1, output.count)
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
