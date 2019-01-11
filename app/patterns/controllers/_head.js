// _head controller

'use strict'

const 
  util = require('util'),
  stat = util.promisify(require('fs').stat)

module.exports = {
  handler : handler
}


async function handler(params) {
  let themePath = app.config.comitium.themes[params.session.theme] ? app.config.comitium.themes[params.session.theme].path : app.config.comitium.themes['Default'].path,
      cssKey = themePath.css + '/min/site.css',
      cssUrl = app.config.comitium.staticAssetUrl + 'themes/' + themePath.css + '/min/site.css?v=',
      jsKey = themePath.js + '/min/site.js',
      jsUrl = app.config.comitium.staticAssetUrl + 'themes/' + themePath.js + '/min/site.js?v=',
      staticFileStats = app.config.citizen.cache.static.enable ? app.cache.get({ scope: 'staticFileStats' }) : false,
      metaData = params.route.action === 'handler' && app.controllers[params.route.controller].head ? await app.controllers[params.route.controller].head(params) : {}

  // If the static files are cached, generate the URLs
  if ( staticFileStats && staticFileStats[cssKey] && staticFileStats[jsKey] ) {
    return {
      content: {
        metaData: metaData,
        cssUrl: cssUrl + staticFileStats[cssKey].mtime.toString().replace(/[ :\-()]/g, ''),
        jsUrl: jsUrl + staticFileStats[jsKey].mtime.toString().replace(/[ :\-()]/g, '')
      }
    }
  // Read the files if they're not in the cache
  } else {
    let [
      css,
      js
    ] = await Promise.all([
      stat(app.config.citizen.directories.web + '/themes/' + themePath.css + '/min/site.css'),
      stat(app.config.citizen.directories.web + '/themes/' + themePath.js + '/min/site.js')
    ])

    // Cache the file stats if they aren't cached already
    if ( !app.cache.exists({ scope: 'staticFileStats' }) ) {
      app.cache.set({
        scope: 'staticFileStats',
        key: cssKey,
        value: css
      })
      app.cache.set({
        scope: 'staticFileStats',
        key: jsKey,
        value: js
      })
    }

    return {
      content: {
        metaData  : metaData,
        cssUrl    : cssUrl + css.mtime.toString().replace(/[ :\-()]/g, ''),
        jsUrl     : jsUrl + js.mtime.toString().replace(/[ :\-()]/g, '')
      }
    }
  }
}
