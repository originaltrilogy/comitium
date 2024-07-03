// announcements controller

export const handler = async (params) => {
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

    let viewTimes
    
    if ( params.session.user_id ) {
      let topicID   = []

      for ( var topic in topics ) {
        topicID.push(topics[topic].id)
      }

      if ( topicID.length ) {
        viewTimes = await app.models.user.topicViewTimes({
          userID: params.session.user_id,
          topicID: topicID.join(', ')
        })
        
        if ( viewTimes ) {
          viewTimes.forEach( function (item) {
            viewTimes[item.topic_id] = item
          })
        }
      }

      topics.forEach( function (item) {
        if ( params.session.user_id ) {
          if ( !viewTimes[item.id] || ( item.last_post_author !== params.session.username && app.toolbox.moment(item.last_post_created).isAfter(viewTimes[item.id].time) ) ) {
            item.unread = true
          }
        } else {
          if ( app.toolbox.moment(item.last_post_created).isAfter(params.session.last_activity) ) {
            item.unread = true
          }
        }
      })
    }
    
    return {
      local: {
        discussion: discussion,
        topics: topics.length ? topics : false,
        breadcrumbs: app.models.announcements.breadcrumbs(),
        pagination: app.toolbox.helpers.paginate('announcements/id/2', params.url.page, discussion.topics),
        previousAndNext: app.toolbox.helpers.previousAndNext('announcements/id/2', params.url.page, discussion.topics)
      },
      view: params.url.compact ? 'compact' : 'announcements'
    }
  } else {
    return access
  }
}


export const head = () => {
  return app.models.announcements.metaData()
}
