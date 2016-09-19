// discussions model

'use strict';

module.exports = {
  categories: categories,
  categoriesPost: categoriesPost,
  breadcrumbs: breadcrumbs,
  metaData: metaData
};


function categories(groupID, emitter) {
  // See if the category list is already cached
  var cacheKey = 'group-' + groupID,
      scope = 'discussions-categories',
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      categories: function (emitter) {
        app.toolbox.pg.connect(app.config.comitium.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query({
              name: 'categories_discussions',
              text: 'select c.id as "categoryID", c."sort" as "categorySort", c."title" as "categoryTitle", c."description" as "categoryDescription", d."id" as "discussionID", d."sort" as "discussionSort", d."title" as "discussionTitle", d."url" as "discussionUrl", d."description" as "discussionDescription", d."topics", d."posts", p."userID" as "lastPostAuthorID", p."created" as "lastPostCreated", u."groupID" as "lastPostAuthorGroupID", u."username" as "lastPostAuthor", u."url" as "lastPostAuthorUrl" from "categories" c join "discussions" d on c."id" = d."categoryID" join "discussionPermissions" dp on d."id" = dp."discussionID" and dp."groupID" = $1 and dp."read" = true left join "posts" p on p.id = ( select posts.id from posts join topics on posts."topicID" = topics.id where topics."discussionID" = d.id and topics.draft = false and posts.draft = false order by posts.created desc limit 1 ) join "users" u on p."userID" = u."id" order by c."sort" asc, d."sort" asc;',
              values: [ groupID ]
            },
              function (err, result) {
                done();
                if ( err ) {
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', result.rows);
                }
              }
            );
          }
        });
      }
    }, function (output) {
      var categories = {};

      if ( output.listen.success ) {
        // Transform the data array into a nested object usable by the view
        output.categories.forEach( function (category, index, array) {
          categories[category.categoryTitle] = {};
          for ( var property in category ) {
            if ( category.hasOwnProperty(property) && property.search('category') === 0 ) {
              categories[category.categoryTitle][property] = category[property];
            }
          }
          categories[category.categoryTitle].discussions = {};
        });

        output.categories.forEach( function (category, index, array) {
          categories[category.categoryTitle].discussions[category.discussionTitle] = {};
          for ( var property in category ) {
            if ( category.hasOwnProperty(property) && property.search('category') !== 0 ) {
              categories[category.categoryTitle].discussions[category.discussionTitle][property] = category[property];
              if ( property === 'topics' || property === 'posts' ) {
                categories[category.categoryTitle].discussions[category.discussionTitle][property + 'Formatted'] = app.toolbox.numeral(category[property]).format('0,0');
              } else if ( property === 'lastPostCreated' ) {
                categories[category.categoryTitle].discussions[category.discussionTitle][property + 'Formatted'] = app.toolbox.moment.tz(category[property], 'America/New_York').format('D-MMM-YYYY');
                // Formatting needs to be moved to the controller for this to work.
                // categories[category.categoryTitle].discussions[category.discussionTitle][property + 'Formatted'] = app.toolbox.moment.tz(category[property], 'America/New_York').fromNow();
              }
            }
          }
        });

        // Cache the categories object for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: categories
          });
        }

        emitter.emit('ready', categories);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }

}



function categoriesPost(groupID, emitter) {
  // See if the category list is already cached
  var cacheKey = 'group-' + groupID,
      scope = 'discussions-categoriesPost',
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      categories: function (emitter) {
        app.toolbox.pg.connect(app.config.comitium.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query({
              name: 'discussions_categoriesPost',
              text: 'select c.id as "categoryID", c."sort" as "categorySort", c."title" as "categoryTitle", c."description" as "categoryDescription", d."id" as "discussionID", d."sort" as "discussionSort", d."title" as "discussionTitle", d."url" as "discussionUrl", d."description" as "discussionDescription", d."topics", d."posts", p."userID" as "lastPostAuthorID", p."created" as "lastPostCreated", u."username" as "lastPostAuthor", u."url" as "lastPostAuthorUrl" from "categories" c join "discussions" d on c."id" = d."categoryID" join "discussionPermissions" dp on d."id" = dp."discussionID" and dp."groupID" = $1 and dp."post" = true left join "posts" p on p.id = ( select posts.id from posts join topics on posts."topicID" = topics.id where topics."discussionID" = d.id and topics.draft = false and posts.draft = false order by posts.created desc limit 1 ) join "users" u on p."userID" = u."id" order by c."sort" asc, d."sort" asc;',
              values: [ groupID ]
            },
              function (err, result) {
                done();
                if ( err ) {
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', result.rows);
                }
              }
            );
          }
        });
      }
    }, function (output) {
      var categories = {};

      if ( output.listen.success ) {
        // Transform the data array into a nested object usable by the view
        output.categories.forEach( function (category, index, array) {
          categories[category.categoryTitle] = {};
          for ( var property in category ) {
            if ( category.hasOwnProperty(property) && property.search('category') === 0 ) {
              categories[category.categoryTitle][property] = category[property];
            }
          }
          categories[category.categoryTitle].discussions = {};
        });

        output.categories.forEach( function (category, index, array) {
          categories[category.categoryTitle].discussions[category.discussionTitle] = {};
          for ( var property in category ) {
            if ( category.hasOwnProperty(property) && property.search('category') !== 0 ) {
              if ( property === 'topics' || property === 'posts' ) {
                categories[category.categoryTitle].discussions[category.discussionTitle][property] = app.toolbox.numeral(category[property]).format('0,0');
              } else if ( property === 'lastPostCreated' ) {
                categories[category.categoryTitle].discussions[category.discussionTitle][property] = app.toolbox.moment(category[property]).format('MMMM Do YYYY');
              } else {
                categories[category.categoryTitle].discussions[category.discussionTitle][property] = category[property];
              }
            }
          }
        });

        // Cache the categories object for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: categories
          });
        }

        emitter.emit('ready', categories);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }

}



function breadcrumbs() {
  return {
    a: {
      name: 'Home',
      url: app.config.comitium.basePath
    }
  };
}



function metaData() {
  return {
    title: 'Original Trilogy - Discussion Forum',
    description: 'Various discussion forums related to the Star Wars universe, including fan projects such as fan edits, fan documentaries, and preservations of the original unaltered Star Wars trilogy.',
    keywords: 'star wars forum, forums, star wars bulletin board, bbs, messageboard, message board, discussion forum, fan edit forum, star wars fan films, fan documentaries, fan preservations, film preservation'
  };
}
