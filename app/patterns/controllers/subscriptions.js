// subscriptions controller

'use strict'

module.exports = {
  handler : handler
}


async function handler(params) {
  let access = await app.toolbox.access.subscriptionsView({ user: params.session })

  if ( access === true ) {
    params.url.page = params.url.page || 1

    let [
      stats,
      topics
    ] = await Promise.all([
      app.models.subscriptions.stats(params.session.userID),
      ( async () => {
        let start = ( params.url.page - 1 ) * 25,
            end = start + 25
        return await app.models.subscriptions.topics({
          userID: params.session.userID,
          start: start,
          end: end
        })
      })()
    ])
    
    let topicID = [],
        viewTimes

    for ( let topic in topics ) {
      if ( topics.hasOwnProperty(topic) ) {
        topicID.push(topics[topic].id)
      }
    }

    if ( topicID.length ) {
      viewTimes = await app.models.user.topicViewTimes({ userID: params.session.userID, topicID: topicID.join(', ') })
    }

    if ( viewTimes ) {
      viewTimes.forEach( function (item) {
        viewTimes[item.topicID] = item
      })
    }

    topics.forEach( function (item) {
      if ( !viewTimes[item.id] || ( item.lastPostAuthor !== params.session.username && app.toolbox.moment(item.lastPostCreated).isAfter(viewTimes[item.id].time) ) ) {
        item.unread = true
      }
    })

    return {
      content: {
        stats: stats,
        topics: topics.length ? topics : false,
        breadcrumbs: {
          a: {
            name: 'Home',
            url: app.config.comitium.basePath
          }
        },
        pagination: app.toolbox.helpers.paginate('subscriptions', params.url.page, stats.topics),
        previousAndNext: app.toolbox.helpers.previousAndNext('subscriptions', params.url.page, stats.topics),
      }
    }
  } else {
    return access
  }
}
