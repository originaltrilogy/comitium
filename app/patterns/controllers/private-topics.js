// private topics controller

'use strict'

module.exports = {
  handler : handler
}


async function handler(params) {
  let access = await app.toolbox.access.privateTopicsView({ user: params.session })

  if ( access === true ) {
    params.url.page = params.url.page || 1

    let [
      stats,
      topics
    ] = await Promise.all([
      app.models['private-topics'].stats(params.session.userID),
      ( async () => {
        let start = ( params.url.page - 1 ) * 25,
            end = start + 25
        return await app.models['private-topics'].topics({
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
        topics: topics.length ? topics : false,
        stats: stats,
        breadcrumbs: app.models['private-topics'].breadcrumbs(),
        pagination: app.toolbox.helpers.paginate('private-topics', params.url.page, stats.topics),
        previousAndNext: app.toolbox.helpers.previousAndNext('private-topics', params.url.page, stats.topics)
      }
    } 
  } else {
    return access
  }
}
