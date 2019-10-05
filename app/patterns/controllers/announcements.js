// announcements controller

'use strict'

module.exports = {
  handler: handler,
  head: head
}


async function handler(params) {
  params.url.page = params.url.page || 1

  let access  = await app.toolbox.access.discussionView({ discussionID: 2, user: params.session })
  
  if ( access === true ) {
    let start       = params.url.start || ( params.url.page - 1 ) * 25,
        end         = params.url.end || start + 25

    let [
      discussion,
      topics
    ] = await Promise.all([
      app.models.announcements.info(2),
      app.models.announcements.topics({
        groupID: 1,
        start: start,
        end: end
      })
    ])
    
    if ( params.session.userID ) {
      let topicID = []
      for ( var topic in topics ) {
        if ( topics.hasOwnProperty(topic) ) {
          topicID.push(topics[topic].id)
        }
      }

      let viewTimes = await app.models.user.topicViewTimes({
        userID: params.session.userID,
        topicID: topicID.join(', ')
      })

      if ( viewTimes ) {
        viewTimes.forEach( function (item) {
          viewTimes[item.topicID] = item
        })
      }

      topics.forEach( function (item) {
        if ( params.session.groupID > 1 ) {
          if ( !viewTimes[item.id] || ( item.lastPostAuthor !== params.session.username && app.toolbox.moment(item.lastPostCreated).isAfter(viewTimes[item.id].time) ) ) {
            item.unread = true
          }
        } else {
          if ( app.toolbox.moment(item.lastPostCreated).isAfter(params.session.lastActivity) ) {
            item.unread = true
          }
        }
      })
    }
    
    return {
      content: {
        discussion: discussion,
        topics: topics.length ? topics : false,
        breadcrumbs: app.models.announcements.breadcrumbs(),
        pagination: app.toolbox.helpers.paginate('announcements/id/2', params.url.page, discussion.topics),
        previousAndNext: app.toolbox.helpers.previousAndNext('announcements/id/2', params.url.page, discussion.topics)
      }
    }
  } else {
    return access
  }
}


function head() {
  return app.models.announcements.metaData()
}
