// discussions model

'use strict';

module.exports = {
  categories: categories,
  breadcrumbs: breadcrumbs,
  metaData: metaData
};


function categories(groupID, emitter) {
  // See if the category list is already cached
  var cacheKey = 'group-' + groupID,
      scope = 'models-discussions-categories',
      cached = app.retrieve({ scope: scope, key: cacheKey });

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
              eval(app.db.sql.categoriesByGroup),
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
                categories[category.categoryTitle].discussions[category.discussionTitle][property] = app.toolbox.moment(app.toolbox.helpers.isoDate(category[property]), 'MMMM Do YYYY');
              } else {
                categories[category.categoryTitle].discussions[category.discussionTitle][property] = category[property];
              }
            }
          }
        });

        // Cache the categories object for future requests
        app.cache({
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
      url: app.config.main.basePath
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
