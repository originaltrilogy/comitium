// discussions controller

'use strict'

module.exports = {
  handler : handler,
  head    : head
}


async function handler(params) {
  let [
    categories,
    topicCount
  ] = await Promise.all([
    app.models.discussions.categories(params.session.groupID),
    app.models.stats.topics()
  ])

  categories.forEach( function (item) {
    item.subcategories.forEach( function (item) {
      if ( app.toolbox.moment(item.lastPostCreated).isAfter(params.session.lastActivity) && item.lastPostAuthorID !== params.session.userID ) {
        item.unread = true
      }
    })
  })

  return {
    content: {
      categories: categories,
      topicCount: app.toolbox.numeral(topicCount).format('0,0')
      // Breadcrumbs will return when the today/home page is done
      // breadcrumbs: app.models.discussions.breadcrumbs()
    },
    include: {
      announcements: {
        route: '/announcements/end/4',
        view: 'compact'
      }
    }
  }
}


function head() {
  return app.models.discussions.metaData()
}
