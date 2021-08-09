// discussions model

export const breadcrumbs = () => {
  return {
    a: {
      name: 'Home',
      url: app.config.comitium.basePath
    }
  }
}


export const categories = async (groupID) => {
  // See if the category list is already cached
  var cacheKey = 'group-' + groupID,
      scope = 'categories_discussions',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache object
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'categories_discussions',
        text: 'select c.id as category_id, c.sort as category_sort, c.title as category_title, c.description as category_description, d.id as discussion_id, d.sort as discussion_sort, d.title as discussion_title, d.url as discussion_url, d.description as discussion_description, ( select count(*) from topics where discussion_id = d.id and draft = false and private = false ) as topics, p.user_id as last_post_author_id, p.created as last_post_created, u.group_id as last_post_author_group_id, u.username as last_post_author, u.url as last_post_author_url from categories c join discussions d on c.id = d.category_id join discussion_permissions dp on d.id = dp.discussion_id and dp.group_id = $1 and dp.read = true left join posts p on p.id = d.last_post_id left join users u on p.user_id = u.id order by c.sort asc, d.sort asc;',
        values: [ groupID ]
      })

      let categories = []

      // Transform the data array into a nested object usable by the view
      result.rows.forEach( function (category) {
        categories[category.category_sort-1] = {
          category_id: category.category_id,
          category_sort: category.category_sort,
          category_title: category.category_title,
          category_description: category.category_description,
          subcategories: []
        }
      })

      // Remove empty array elements caused by gaps in category_sort
      categories = categories.filter( function (n) { return n !== undefined } )

      categories.forEach( function (category, categoryIndex) {
        result.rows.forEach( function (subcategory) {
          if ( subcategory.category_id === category.category_id ) {
            categories[categoryIndex].subcategories[subcategory.discussion_sort-1] = subcategory
            categories[categoryIndex].subcategories[subcategory.discussion_sort-1].topics_formatted = app.toolbox.numeral(subcategory.topics).format('0,0')
            categories[categoryIndex].subcategories[subcategory.discussion_sort-1].last_post_created_formatted = app.toolbox.moment.tz(subcategory.last_post_created, 'America/New_York').format('D-MMM-YYYY')
          }
          // Remove empty array elements caused by gaps in discussion_sort
          categories[categoryIndex].subcategories = categories[categoryIndex].subcategories.filter( function (n) { return n !== undefined } )
        })
      })

      // Cache the categories object for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: categories
        })
      }
      return categories
    } finally {
      client.release()
    }
  }
}


export const categoriesPost = async (groupID) => {
  // See if already cached
  let cacheKey = 'group-' + groupID,
      scope = 'categories_discussions_post',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'discussions_categoriesPost',
        text: 'select c.id as category_id, c.sort as category_sort, c.title as category_title, c.description as category_description, d.id as discussion_id, d.sort as discussion_sort, d.title as discussion_title, d.url as discussion_url, d.description as discussion_description, d.topics, d.posts, p.user_id as last_post_author_id, p.created as last_post_created, u.group_id as last_post_author_group_id, u.username as last_post_author, u.url as last_post_author_url from categories c join discussions d on c.id = d.category_id join discussion_permissions dp on d.id = dp.discussion_id and dp.group_id = $1 and dp.post = true left join posts p on p.id = d.last_post_id left join users u on p.user_id = u.id order by c.sort asc, d.sort asc;',
        values: [ groupID ]
      })

      let categories = []

      result.rows.forEach( function (category) {
        categories[category.category_sort-1] = {
          category_id: category.category_id,
          category_sort: category.category_sort,
          category_title: category.category_title,
          category_description: category.category_description,
          subcategories: []
        }
      })

      // Remove empty array elements caused by gaps in category_sort
      categories = categories.filter( function (n) { return n !== undefined } )

      categories.forEach( function (category, categoryIndex) {
        result.rows.forEach( function (subcategory) {
          if ( subcategory.category_id === category.category_id ) {
            categories[categoryIndex].subcategories[subcategory.discussion_sort-1] = subcategory
            categories[categoryIndex].subcategories[subcategory.discussion_sort-1].topicsFormatted = app.toolbox.numeral(subcategory.topics).format('0,0')
            categories[categoryIndex].subcategories[subcategory.discussion_sort-1].postsFormatted = app.toolbox.numeral(subcategory.posts).format('0,0')
            categories[categoryIndex].subcategories[subcategory.discussion_sort-1].last_post_created_formatted = app.toolbox.moment.tz(subcategory.lastPostCreated, 'America/New_York').format('D-MMM-YYYY')
          }
          // Remove empty array elements caused by gaps in discussion_sort
          categories[categoryIndex].subcategories = categories[categoryIndex].subcategories.filter( function (n) { return n !== undefined } )
        })
      })

      // Cache the result for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: categories
        })
      }

      return categories
    } finally {
      client.release()
    }
  }
}


export const metaData = () => {
  return {
    title: 'Original Trilogy - Discussion Forum',
    description: 'Various discussion forums related to the Star Wars universe, including fan projects such as fan edits, fan documentaries, and preservations of the original unaltered Star Wars trilogy.',
    keywords: 'star wars forum, forums, star wars bulletin board, bbs, messageboard, message board, discussion forum, fan edit forum, star wars fan films, fan documentaries, fan preservations, film preservation'
  }
}
