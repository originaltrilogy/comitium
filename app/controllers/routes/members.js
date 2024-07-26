// members controller

export const handler = async (params) => {
  params.form.term = ''

  let [
    group,
    groups,
    members
  ] = await Promise.all([
    app.models.group.info(params.url.id || 3),
    app.models.members.groups(),
    ( async () => {
      let page = params.url.page || 1,
          start = ( page - 1 ) * 25,
          end = start + 25

      return await app.models.members.group({
        group: params.url.id || 3,
        order: params.url.order,
        sort: params.url.sort,
        start: start,
        end: end
      })
    })()
  ])

  let count = members.length ? members[0].full_count : 0

  return {
    local: {
      count: count,
      group: group,
      groups: groups,
      members: members,
      pagination: app.helpers.util.paginate(params.route.pathname, params.url.page || 1, count),
      previousAndNext: app.helpers.util.previousAndNext(params.route.pathname, params.url.page || 1, count),
      urlParams: '/' + ( params.url.id ? 'id/' + params.url.id + '/' : '' )
    }
  }
}


export const head = () => {
  return app.models.members.metaData()
}


export const search = (params, request) => {
  if ( request.method === 'POST' ) {
    return {
      redirect: app.config.comitium.baseUrl + 'members/action/searchResults/term/' + encodeURI(params.form.term)
    }
  } else {
    return {
      redirect: app.config.comitium.baseUrl + 'members'
    }
  }
}


export const searchResults = async (params) => {
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
        term: params.url.term,
        groupID: params.url.id || 0,
        order: params.url.order,
        sort: params.url.sort,
        start: start,
        end: end
      })
    })()
  ])

  let count = members.length ? members[0].full_count : 0

  return {
    local: {
      count: count,
      groups: groups,
      members: members,
      pagination: app.helpers.util.paginate(params.route.pathname, params.url.page || 1, count),
      previousAndNext: app.helpers.util.previousAndNext(params.route.pathname, params.url.page || 1, count),
      urlParams: '/action/searchResults/term/' + params.url.term + '/' + ( params.url.id ? 'id/' + params.url.id + '/' : '' ),
      term: decodeURI(params.url.term)
    }
  }
}
