// _head controller

'use strict';

var fs = require('fs');

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  var metaData = app.models[params.route.controller] && app.models[params.route.controller].metaData ? app.models[params.route.controller].metaData() : {},
      themePath = app.config.comitium.themes[params.session.theme || 'Default'].path,
      themeUrl = app.config.comitium.staticAssetUrl + 'themes/' + themePath + '/' + app.config.citizen.mode + '.css?v=',
      staticFileStats = app.cache.get({ scope: 'staticFileStats' });

  if ( staticFileStats ) {
    emitter.emit('ready', {
      content: {
        metaData: metaData,
        themePath: themePath,
        themeUrl: themeUrl + staticFileStats[themePath].ctime.toString().replace(/[ :\-\(\))]/g, '')
      }
    });
  } else {
    fs.stat(app.config.citizen.directories.web + '/themes/' + themePath + '/' + app.config.citizen.mode + '.css', function (err, stats) {
      if ( err ) {
        emitter.emit('error', err);
      } else {
        app.cache.set({ scope: 'staticFileStats', key: themePath, value: stats });
        emitter.emit('ready', {
          content: {
            metaData: metaData,
            themePath: themePath,
            themeUrl: themeUrl + stats.ctime.toString().replace(/[ :\-\(\))]/g, '')
          }
        });
      }
    });
  }

}
