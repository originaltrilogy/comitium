// _head controller

'use strict';

var fs = require('fs');

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  var metaData = app.models[params.route.controller] && app.models[params.route.controller].metaData ? app.models[params.route.controller].metaData() : {},
      themePath = app.config.comitium.themes[params.session.theme || 'Default'].path,
      cssKey = themePath + '/' + app.config.citizen.mode + '.css',
      cssUrl = app.config.comitium.staticAssetUrl + 'themes/' + themePath + '/' + app.config.citizen.mode + '.css?v=',
      jsKey = themePath + '/' + app.config.citizen.mode + '.js',
      jsUrl = app.config.comitium.staticAssetUrl + 'themes/' + themePath + '/' + app.config.citizen.mode + '.js?v=',
      staticFileStats = app.cache.get({ scope: 'staticFileStats' });

  if ( staticFileStats ) {
    emitter.emit('ready', {
      content: {
        metaData: metaData,
        cssUrl: cssUrl + staticFileStats[cssKey].mtime.toString().replace(/[ :\-\(\)]/g, ''),
        jsUrl: jsUrl + staticFileStats[jsKey].mtime.toString().replace(/[ :\-\(\)]/g, '')
      }
    });
  } else {
    app.listen({
      css: function (emitter) {
        fs.stat(app.config.citizen.directories.web + '/themes/' + themePath + '/' + app.config.citizen.mode + '.css', function (err, stats) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            emitter.emit('ready', stats);
          }
        });
      },
      js: function (emitter) {
        fs.stat(app.config.citizen.directories.web + '/themes/' + themePath + '/' + app.config.citizen.mode + '.css', function (err, stats) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            emitter.emit('ready', stats);
          }
        });
      }
    }, function (output) {
      if ( !app.cache.exists({ scope: 'staticFileStats' }) ) {
        app.cache.set({
          scope: 'staticFileStats',
          key: cssKey,
          value: output.css
        });
        app.cache.set({
          scope: 'staticFileStats',
          key: jsKey,
          value: output.js
        });
      }
      emitter.emit('ready', {
        content: {
          metaData: metaData,
          cssUrl: cssUrl + output.css.mtime.toString().replace(/[ :\-\(\)]/g, ''),
          jsUrl: jsUrl + output.js.mtime.toString().replace(/[ :\-\(\)]/g, '')
        }
      });
    });
  }

}
