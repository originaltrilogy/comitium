// discussion controller

export const handler = async (params) => {
  let access  = await app.helpers.access.discussionView({ discussionID: params.url.id, user: params.session })

  if ( access === true ) {
    let page    = parseInt(params.url.page, 10) || 1,
        start   = ( page - 1 ) * 25,
        end     = start + 25
        
    let [
      discussion,
      topics,
      announcements
    ] = await Promise.all([
      app.models.discussion.info(params.url.id),
      app.models.discussion.topics({
        discussionID  : params.url.id,
        start         : start,
        end           : end
      }),
      page === 1 ? app.models.discussion.announcements(params.url.id) : []
    ])

    if ( params.route.descriptor === discussion.url ) {
      let viewTimes

      if ( params.session.user_id ) {
        let topicID = []

        topics.forEach( function (item) {
          topicID.push(item.id)
        })
        announcements.forEach( function (item) {
          topicID.push(item.id)
        })
  
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
      }

      announcements.forEach( function (item) {
        if ( params.session.user_id ) {
          if ( !viewTimes[item.id] || ( item.last_post_author !== params.session.username && app.helpers.moment(item.last_post_created).isAfter(viewTimes[item.id].time) ) ) {
            item.unread = true
          }
        } else {
          if ( app.helpers.moment(item.last_post_created).isAfter(params.session.last_activity) ) {
            item.unread = true
          }
        }
      })

      topics.forEach( function (item) {
        if ( params.session.user_id ) {
          if ( !viewTimes[item.id] || ( item.last_post_author !== params.session.username && app.helpers.moment(item.last_post_created).isAfter(viewTimes[item.id].time) ) ) {
            item.unread = true
          }
        } else if ( app.helpers.moment(item.last_post_created).isAfter(params.session.last_activity) ) {
          item.unread = true
        }
      })

      return {
        local: {
          discussion: discussion,
          announcements: announcements.length ? announcements : false,
          topics: topics.length ? topics : false,
          breadcrumbs: app.models.discussion.breadcrumbs(discussion.title),
          page: page,
          pagination: app.helpers.util.paginate('discussion/' + discussion.url + '/id/' + discussion.id, page, discussion.topics),
          previousAndNext: app.helpers.util.previousAndNext('discussion/' + discussion.url + '/id/' + discussion.id, page, discussion.topics)
        }
      }
    } else {
      return {
        redirect: {
          statusCode  : 301,
          url         : app.config.comitium.baseUrl + 'discussion/' + discussion.url + '/id/' + discussion.id + ( params.url.page ? '/page/' + params.url.page : '' )
        }
      }
    }
  } else {
    return access
  }
}


export const head = async (params) => {
  return await app.models.discussion.metaData({ discussionID: params.url.id })
}
