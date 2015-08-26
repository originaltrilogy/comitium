// _head controller

'use strict';

var fs = require('fs');

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  var metaData = app.models[params.route.controller] && app.models[params.route.controller].metaData ? app.models[params.route.controller].metaData() : {},
      themePath = app.config.comitium.themes[params.session.theme || 'Default'].path,
      cssKey = themePath + '/min/' + app.config.citizen.mode + '.css',
      cssUrl = app.config.comitium.staticAssetUrl + 'themes/' + themePath + '/min/' + app.config.citizen.mode + '.css?v=',
      jsKey = themePath + '/min/' + app.config.citizen.mode + '.js',
      jsUrl = app.config.comitium.staticAssetUrl + 'themes/' + themePath + '/min/' + app.config.citizen.mode + '.js?v=',
      staticFileStats = app.cache.get({ scope: 'staticFileStats' });

  // If the static files are cached, generate the URLs
  if ( staticFileStats ) {
    // If the user's theme file cache exists, return their URLs
    if ( staticFileStats[cssKey] && staticFileStats[jsKey] ) {
      emitter.emit('ready', {
        content: {
          metaData: metaData,
          cssUrl: cssUrl + staticFileStats[cssKey].mtime.toString().replace(/[ :\-\(\)]/g, ''),
          jsUrl: jsUrl + staticFileStats[jsKey].mtime.toString().replace(/[ :\-\(\)]/g, '')
        }
      });
    // Fall back to the default theme otherwise
    } else {
      emitter.emit('ready', {
        content: {
          metaData: metaData,
          cssUrl: app.config.comitium.staticAssetUrl + 'themes/default/min/' + app.config.citizen.mode + '.css?v=' + staticFileStats['default/min/' + app.config.citizen.mode + '.css'].mtime.toString().replace(/[ :\-\(\)]/g, ''),
          jsUrl: app.config.comitium.staticAssetUrl + 'themes/default/min/' + app.config.citizen.mode + '.js?v=' + staticFileStats['default/min/' + app.config.citizen.mode + '.js'].mtime.toString().replace(/[ :\-\(\)]/g, '')
        }
      });
    }
  // Read the files if they're not in the cache
  } else {
    app.listen({
      css: function (emitter) {
        fs.stat(app.config.citizen.directories.web + '/themes/' + themePath + '/min/' + app.config.citizen.mode + '.css', function (err, stats) {
          // If there's a problem reading the CSS file, fall back to the default theme
          if ( err ) {
            cssKey = 'default/min/' + app.config.citizen.mode + '.css';
            cssUrl = app.config.comitium.staticAssetUrl + 'themes/default/min/' + app.config.citizen.mode + '.css?v=';
            fs.stat(app.config.citizen.directories.web + '/themes/default/min/' + app.config.citizen.mode + '.css', function (err, stats) {
              if ( err ) {
                emitter.emit('error', err);
              } else {
                emitter.emit('ready', stats);
              }
            });
          } else {
            emitter.emit('ready', stats);
          }
        });
      },
      js: function (emitter) {
        fs.stat(app.config.citizen.directories.web + '/themes/' + themePath + '/min/' + app.config.citizen.mode + '.js', function (err, stats) {
          // If there's a problem reading the JS file, fall back to the default theme
          if ( err ) {
            jsKey = 'default/min/' + app.config.citizen.mode + '.js';
            jsUrl = app.config.comitium.staticAssetUrl + 'themes/default/min/' + app.config.citizen.mode + '.js?v=';
            fs.stat(app.config.citizen.directories.web + '/themes/default/min/' + app.config.citizen.mode + '.js', function (err, stats) {
              if ( err ) {
                emitter.emit('error', err);
              } else {
                emitter.emit('ready', stats);
              }
            });
          } else {
            emitter.emit('ready', stats);
          }
        });
      }
    }, function (output) {
      // Cache the file stats if they aren't cached already
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
