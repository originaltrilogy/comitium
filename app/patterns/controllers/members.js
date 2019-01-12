// members controller

'use strict'

module.exports = {
  handler       : handler,
  head          : head,
  search        : search,
  searchResults : searchResults
}


async function handler(params) {
  params.form.term = ''

  let [
    group,
    groups,
    members
  ] = await Promise.all([
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

  let count = members.length ? members[0].full_count : 0

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


function search(params) {
  if ( params.request.method === 'POST' ) {
    return {
      redirect: app.config.comitium.baseUrl + 'members/action/searchResults/term/' + encodeURI(params.form.term)
    }
  } else {
    return {
      redirect: app.config.comitium.baseUrl + 'members'
    }
  }
}


async function searchResults(params) {
  params.form.term = decodeURI(params.url.term)

  let [
    groups,
    members
  ] = await Promise.all([
    app.models.members.groups(),
    ( async () => {
      let page = params.url.page || 1,
          start = ( page - 1 ) * 25,
          end = start + 25

      return await app.models.members.search({
        term: decodeURI(params.url.term),
        order: params.url.order,
        sort: params.url.sort,
        start: start,
        end: end
      })
    })()
  ])

  let count = members.length ? members[0].full_count : 0

  return {
    content: {
      // breadcrumbs: app.models.members.breadcrumbs(),
      count: count,
      groups: groups,
      members: members,
      pagination: app.toolbox.helpers.paginate(params.route.pathname, params.url.page || 1, count)
    }
  }
}
