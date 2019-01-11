// discussions model

'use strict'

module.exports = {
  breadcrumbs     : breadcrumbs,
  categories      : categories,
  categoriesPost  : categoriesPost,
  metaData        : metaData
}


function breadcrumbs() {
  return {
    a: {
      name: 'Home',
      url: app.config.comitium.basePath
    }
  }
}


async function categories(groupID) {
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
        text: 'select c.id as "categoryID", c."sort" as "categorySort", c."title" as "categoryTitle", c."description" as "categoryDescription", d."id" as "discussionID", d."sort" as "discussionSort", d."title" as "discussionTitle", d."url" as "discussionUrl", d."description" as "discussionDescription", d."topics", d."posts", p."userID" as "lastPostAuthorID", p."created" as "lastPostCreated", u."groupID" as "lastPostAuthorGroupID", u."username" as "lastPostAuthor", u."url" as "lastPostAuthorUrl" from "categories" c join "discussions" d on c."id" = d."categoryID" join "discussionPermissions" dp on d."id" = dp."discussionID" and dp."groupID" = $1 and dp."read" = true left join "posts" p on p.id = d.last_post_id left join "users" u on p."userID" = u."id" order by c."sort" asc, d."sort" asc;',
        values: [ groupID ]
      })

      let categories = []

      // Transform the data array into a nested object usable by the view
      result.rows.forEach( function (category) {
        categories[category.categorySort-1] = {
          categoryID: category.categoryID,
          categorySort: category.categorySort,
          categoryTitle: category.categoryTitle,
          categoryDescription: category.categoryDescription,
          subcategories: []
        }
      })

      // Remove empty array elements caused by gaps in categorySort
      categories = categories.filter( function (n) { return n !== undefined } )

      categories.forEach( function (category, categoryIndex) {
        result.rows.forEach( function (subcategory) {
          if ( subcategory.categoryID === category.categoryID ) {
            categories[categoryIndex].subcategories[subcategory.discussionSort-1] = subcategory
            categories[categoryIndex].subcategories[subcategory.discussionSort-1].topicsFormatted = app.toolbox.numeral(subcategory.topics).format('0,0')
            categories[categoryIndex].subcategories[subcategory.discussionSort-1].postsFormatted = app.toolbox.numeral(subcategory.posts).format('0,0')
            categories[categoryIndex].subcategories[subcategory.discussionSort-1].lastPostCreatedFormatted = app.toolbox.moment.tz(subcategory.lastPostCreated, 'America/New_York').format('D-MMM-YYYY')
          }
          // Remove empty array elements caused by gaps in discussionSort
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


async function categoriesPost(groupID) {
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
        text: 'select c.id as "categoryID", c."sort" as "categorySort", c."title" as "categoryTitle", c."description" as "categoryDescription", d."id" as "discussionID", d."sort" as "discussionSort", d."title" as "discussionTitle", d."url" as "discussionUrl", d."description" as "discussionDescription", d."topics", d."posts", p."userID" as "lastPostAuthorID", p."created" as "lastPostCreated", u."groupID" as "lastPostAuthorGroupID", u."username" as "lastPostAuthor", u."url" as "lastPostAuthorUrl" from "categories" c join "discussions" d on c."id" = d."categoryID" join "discussionPermissions" dp on d."id" = dp."discussionID" and dp."groupID" = $1 and dp."post" = true left join "posts" p on p.id = d.last_post_id left join "users" u on p."userID" = u."id" order by c."sort" asc, d."sort" asc;',
        values: [ groupID ]
      })

      let categories = []

      result.rows.forEach( function (category) {
        categories[category.categorySort-1] = {
          categoryID: category.categoryID,
          categorySort: category.categorySort,
          categoryTitle: category.categoryTitle,
          categoryDescription: category.categoryDescription,
          subcategories: []
        }
      })

      // Remove empty array elements caused by gaps in categorySort
      categories = categories.filter( function (n) { return n !== undefined } )

      categories.forEach( function (category, categoryIndex) {
        result.rows.forEach( function (subcategory) {
          if ( subcategory.categoryID === category.categoryID ) {
            categories[categoryIndex].subcategories[subcategory.discussionSort-1] = subcategory
            categories[categoryIndex].subcategories[subcategory.discussionSort-1].topicsFormatted = app.toolbox.numeral(subcategory.topics).format('0,0')
            categories[categoryIndex].subcategories[subcategory.discussionSort-1].postsFormatted = app.toolbox.numeral(subcategory.posts).format('0,0')
            categories[categoryIndex].subcategories[subcategory.discussionSort-1].lastPostCreatedFormatted = app.toolbox.moment.tz(subcategory.lastPostCreated, 'America/New_York').format('D-MMM-YYYY')
          }
          // Remove empty array elements caused by gaps in discussionSort
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


function metaData() {
  return {
    title: 'Original Trilogy - Discussion Forum',
    description: 'Various discussion forums related to the Star Wars universe, including fan projects such as fan edits, fan documentaries, and preservations of the original unaltered Star Wars trilogy.',
    keywords: 'star wars forum, forums, star wars bulletin board, bbs, messageboard, message board, discussion forum, fan edit forum, star wars fan films, fan documentaries, fan preservations, film preservation'
  }
}
