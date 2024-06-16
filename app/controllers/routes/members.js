// members controller

export const handler = async (params) => {
  params.form.term = ''

  let [
    group,
    groups,
    members
  ] = await Promise.all([
    app.models.group.info(params.url.group || 3),
    app.models.members.groups(),
    ( async () => {
      let page = params.url.page || 1,
          start = ( page - 1 ) * 25,
          end = start + 25

      return await app.models.members.group({
        group: params.url.group || 3,
        order: params.url.order,
        sort: params.url.sort,
        start: start,
        end: end
      })
    })()
  ])

  let count = members.length ? members[0].full_count : 0

  return {
    public: {
      count: count,
      group: group,
      groups: groups,
      members: members,
      pagination: app.toolbox.helpers.paginate(params.route.pathname, params.url.page || 1, count),
      previousAndNext: app.toolbox.helpers.previousAndNext(params.route.pathname, params.url.page || 1, count),
      urlParams: '/' + ( params.url.group ? 'group/' + params.url.group + '/' : '' )
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
        groupID: params.url.group || 0,
        order: params.url.order,
        sort: params.url.sort,
        start: start,
        end: end
      })
    })()
  ])

  let count = members.length ? members[0].full_count : 0

  return {
    public: {
      count: count,
      groups: groups,
      members: members,
      pagination: app.toolbox.helpers.paginate(params.route.pathname, params.url.page || 1, count),
      previousAndNext: app.toolbox.helpers.previousAndNext(params.route.pathname, params.url.page || 1, count),
      urlParams: '/action/searchResults/term/' + params.url.term + '/' + ( params.url.group ? 'group/' + params.url.group + '/' : '' ),
      term: decodeURI(params.url.term)
    }
  }
}
