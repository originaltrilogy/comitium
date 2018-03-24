// _head controller

'use strict';

var fs = require('fs');

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  var themePath = app.config.comitium.themes[params.session.theme] ? app.config.comitium.themes[params.session.theme].path : app.config.comitium.themes['Default'].path,
      cssKey = themePath.css + '/min/site.css',
      cssUrl = app.config.comitium.staticAssetUrl + 'themes/' + themePath.css + '/min/site.css?v=',
      jsKey = themePath.js + '/min/' + app.config.citizen.mode + '.js',
      jsUrl = app.config.comitium.staticAssetUrl + 'themes/' + themePath.js + '/min/' + app.config.citizen.mode + '.js?v=',
      staticFileStats = app.cache.get({ scope: 'staticFileStats' });

  app.listen({
    metaData: function (emitter) {
      if ( params.route.action === 'handler' && app.controllers[params.route.controller].head ) {
        app.controllers[params.route.controller].head(params, context, emitter);
      } else {
        emitter.emit('ready', {});
      }
    }
  }, function (output) {
    var metaData = output.metaData;

    if ( output.listen.success ) {
      // If the static files are cached, generate the URLs
      if ( staticFileStats && staticFileStats[cssKey] && staticFileStats[jsKey] ) {
        emitter.emit('ready', {
          content: {
            metaData: metaData,
            cssUrl: cssUrl + staticFileStats[cssKey].mtime.toString().replace(/[ :\-\(\)]/g, ''),
            jsUrl: jsUrl + staticFileStats[jsKey].mtime.toString().replace(/[ :\-\(\)]/g, '')
          }
        });
      // Read the files if they're not in the cache
      } else {
        app.listen({
          css: function (emitter) {
            fs.stat(app.config.citizen.directories.web + '/themes/' + themePath.css + '/min/site.css', function (err, stats) {
              // If there's a problem reading the CSS file, fall back to the default theme
              if ( err ) {
                cssKey = 'default/min/site.css';
                cssUrl = app.config.comitium.staticAssetUrl + 'themes/default/min/site.css?v=';
                fs.stat(app.config.citizen.directories.web + '/themes/default/min/site.css', function (err, stats) {
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
            fs.stat(app.config.citizen.directories.web + '/themes/' + themePath.js + '/min/' + app.config.citizen.mode + '.js', function (err, stats) {
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
    } else {
      emitter.emit('error', output.listen);
    }
  });

}
