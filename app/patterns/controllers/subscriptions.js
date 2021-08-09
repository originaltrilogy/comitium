// subscriptions controller

export const handler = async (params) => {
  let access = await app.toolbox.access.subscriptionsView({ user: params.session })

  if ( access === true ) {
    params.url.page = params.url.page || 1

    let start = ( params.url.page - 1 ) * 25,
        end = start + 25,
        topicID = [],
        topics = await app.models.subscriptions.topics({
          userID: params.session.user_id,
          start: start,
          end: end
        }),
        count = topics.length ? topics[0].full_count : 0,
        viewTimes

    Object.keys(topics).forEach( topic => {
      topicID.push(topics[topic].id)
    })

    if ( topicID.length ) {
      viewTimes = await app.models.user.topicViewTimes({ userID: params.session.user_id, topicID: topicID.join(', ') })
      viewTimes.forEach( function (item) {
        viewTimes[item.topic_id] = item
      })
    }

    topics.forEach( function (item) {
      if ( !viewTimes[item.id] || ( item.last_post_author !== params.session.username && app.toolbox.moment(item.last_post_created).isAfter(viewTimes[item.id].time) ) ) {
        item.unread = true
      }
    })

    return {
      public: {
        count: count,
        topics: topics.length ? topics : false,
        breadcrumbs: {
          a: {
            name: 'Home',
            url: app.config.comitium.basePath
          }
        },
        pagination: app.toolbox.helpers.paginate('subscriptions', params.url.page, count),
        previousAndNext: app.toolbox.helpers.previousAndNext('subscriptions', params.url.page, count),
      }
    }
  } else {
    return access
  }
}
