// discussions controller

export const handler = async (params) => {
  let categories = await app.models.discussions.categories(params.session.group_id)

  categories.forEach( function (item) {
    item.subcategories.forEach( function (item) {
      if ( app.helpers.moment(item.last_post_created).isAfter(params.session.last_activity) && item.last_post_author_id !== params.session.user_id ) {
        item.unread = true
      }
    })
  })

  return {
    local: {
      categories: categories
      // Breadcrumbs will return when the today/home page is done
      // breadcrumbs: app.models.discussions.breadcrumbs()
    },
    include: {
      announcements: '/announcements/compact/true/end/4'
    }
  }
}


export const head = () => {
  return app.models.discussions.metaData()
}
