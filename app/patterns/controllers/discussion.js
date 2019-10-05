// discussion controller

'use strict'

module.exports = {
  handler : handler,
  head    : head
}


async function handler(params) {
  let access  = await app.toolbox.access.discussionView({ discussionID: params.url.id, user: params.session })

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
      if ( params.session.userID ) {
        let topicID = []
        topics.forEach( function (item) {
          topicID.push(item.id)
        })
        announcements.forEach( function (item) {
          topicID.push(item.id)
        })
  
        viewTimes = await app.models.user.topicViewTimes({
          userID: params.session.userID,
          topicID: topicID.join(', ')
        })
  
        if ( viewTimes ) {
          viewTimes.forEach( function (item) {
            viewTimes[item.topicID] = item
          })
        }
      }
  
      announcements.forEach( function (item) {
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

      topics.forEach( function (item) {
        if ( params.session.groupID > 1 ) {
          if ( !viewTimes[item.id] || ( item.lastPostAuthor !== params.session.username && app.toolbox.moment(item.lastPostCreated).isAfter(viewTimes[item.id].time) ) ) {
            item.unread = true
          }
        } else if ( app.toolbox.moment(item.lastPostCreated).isAfter(params.session.lastActivity) ) {
          item.unread = true
        }
      })

      return {
        content: {
          discussion: discussion,
          announcements: announcements.length ? announcements : false,
          topics: topics.length ? topics : false,
          breadcrumbs: app.models.discussion.breadcrumbs(discussion.title),
          page: page,
          pagination: app.toolbox.helpers.paginate('discussion/' + discussion.url + '/id/' + discussion.id, page, discussion.topics),
          previousAndNext: app.toolbox.helpers.previousAndNext('discussion/' + discussion.url + '/id/' + discussion.id, page, discussion.topics)
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


async function head(params) {
  return await app.models.discussion.metaData({ discussionID: params.url.id })
}
