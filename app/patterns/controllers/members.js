// members controller

'use strict'

module.exports = {
  handler : handler,
  head    : head
}


async function handler(params) {
  let [
    count,
    group,
    groups,
    members
  ] = await Promise.all([
    ( async () => {
      if ( params.url.group ) {
        return await app.models.group.memberCount(params.url.group)
      } else {
        return await app.models.stats.users()
      }
    })(),
    ( async () => {
      if ( params.url.group ) {
        return await app.models.group.info(params.url.group)
      } else {
        return false
      }
    })(),
    app.models.members.groups(),
    ( async () => {
      let page = params.url.page || 1,
          start = ( page - 1 ) * 25,
          end = start + 25

      if ( !params.url.group ) {
        return await app.models.members.all({
          order: params.url.order,
          sort: params.url.sort,
          start: start,
          end: end
        })
      } else {
        return await app.models.members.group({
          group: params.url.group,
          order: params.url.order,
          sort: params.url.sort,
          start: start,
          end: end
        })
      }
    })()
  ])

  return {
    content: {
      // breadcrumbs: app.models.members.breadcrumbs(),
      count: count,
      group: group,
      groups: groups,
      members: members,
      pagination: app.toolbox.helpers.paginate(params.route.pathname, params.url.page || 1, count)
    }
  }
}


function head() {
  return app.models.members.metaData()
}
