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
    title: 'Original Trilogy - Star Wars, Film Preservation, and Fan Edits',
    description: 'News and discussion surrounding everything Star Wars, from 1976 to today. Particularly focused on preserving the original trilogy (Episodes IV through VI) for future generations.',
    keywords: 'star wars bluray, star wars blu-ray, star wars dvd, George Lucas, george lucas, original trilogy, ot, out, gout, prequel trilogy, pt, star wars special edition, a new hope, empire strikes back, return of the jedi, phantom menace, attack of the clones, revenge of the sith, fan edits, fanedits, film preservation, fan preservations, fanedits.com'
  };
}
