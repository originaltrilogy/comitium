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
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select c.id as "categoryID", c."sort" as "categorySort", c."title" as "categoryTitle", c."description" as "categoryDescription", d."id" as "discussionID", d."sort" as "discussionSort", d."title" as "discussionTitle", d."url" as "discussionUrl", d."description" as "discussionDescription", d."topics", d."posts", p."id" as "lastPostID", p."dateCreated" as "lastPostDate", u."id" as "lastPostAuthorID", u."username" as "lastPostAuthor", u."url" as "lastPostAuthorUrl" from "categories" c join "discussions" d on c."id" = d."categoryID" join "discussionPermissions" dp on d."id" = dp."discussionID" and dp."groupID" = $1 and dp."read" = true join "topics" t on d."id" = t."discussionID" and t."id" = ( select t."id" from "topics" t join "posts" p on p."topicID" = t."id" where t."discussionID" = d."id" order by p."dateCreated" desc limit 1 ) left join "posts" p on t."id" = p."topicID" join "users" u on p."userID" = u."id" where p."id" = ( select max("id") from "posts" where "topicID" = t."id" and "draft" = false ) order by c."sort" asc, d."sort" asc;',
              [ groupID ],
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
              } else if ( property === 'lastPostDate' ) {
                categories[category.categoryTitle].discussions[category.discussionTitle][property + 'Formatted'] = app.toolbox.moment.tz(category[property], 'America/New_York').format('MMM D YYYY [at] h:mm A');
                // Formatting needs to be moved to the controller for this to work.
                // categories[category.categoryTitle].discussions[category.discussionTitle][property + 'Formatted'] = app.toolbox.moment.tz(category[property], 'America/New_York').fromNow();
              }
            }
          }
        });

        // Cache the categories object for future requests
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: categories
        });

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
      scope = 'discussions-categories',
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      categories: function (emitter) {
        app.toolbox.pg.connect(app.config.db.connectionString, function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select c.id as "categoryID", c.sort as "categorySort", c.title as "categoryTitle", c.description as "categoryDescription", d.id as "discussionID", d.sort as "discussionSort", d.title as "discussionTitle", d.url as "discussionUrl", d.description as "discussionDescription", d."topics", d."posts", p.id as "lastPostID", p."dateCreated" as "lastPostDate", u.username as "lastPostAuthor", u.url as "lastPostAuthorUrl" from categories c join discussions d on c.id = d."categoryID" join "discussionPermissions" dp on d.id = dp."discussionID" and dp."groupID" = $1 and dp.post = true join topics t on d.id = t."discussionID" and t.id = ( select max(t2.id) from topics t2 where t2."discussionID" = d.id ) left join posts p on t.id = p."topicID" join users u on p."userID" = u.id where p.id = ( select max(p2.id) from posts p2 where p2."topicID" = t.id and p2.draft = false ) order by c.sort asc, d.sort asc;',
              [ groupID ],
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
              } else if ( property === 'lastPostDate' ) {
                categories[category.categoryTitle].discussions[category.discussionTitle][property] = app.toolbox.moment(category[property]).format('MMMM Do YYYY');
              } else {
                categories[category.categoryTitle].discussions[category.discussionTitle][property] = category[property];
              }
            }
          }
        });

        // Cache the categories object for future requests
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: categories
        });

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
      name: 'Forum Home',
      url: app.config.comitium.basePath
    }
  };
}


function metaData() {
  return {
    title: 'Discussions View',
    description: 'This is the discussions view template.',
    keywords: 'discussions, view'
  };
}
