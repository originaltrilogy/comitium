// index model

'use strict';

module.exports = {
  content: content,
  metaData: metaData
};


function content(groupID, emitter) {
  app.listen({
    categories: function (emitter) {
      app.models.discussions.categories(groupID, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {
      emitter.emit('ready', output.categories);
    } else {
      emitter.emit('error', output.listen);
    }

  });
}


function metaData() {
  return {
    title: 'Index View',
    description: 'This is the index view template.',
    keywords: 'index, view'
  };
}
