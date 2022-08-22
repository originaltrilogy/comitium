// _head controller

import { stat } from 'fs/promises'

export const handler = async (params) => {
  let cssKey = params.session.themePath.css + '/min/site.css',
      cssUrl = app.config.comitium.staticAssetUrl + 'themes/' + params.session.themePath.css + '/min/site.css?v=',
      jsKey = params.session.themePath.js + '/min/site.js',
      jsUrl = app.config.comitium.staticAssetUrl + 'themes/' + params.session.themePath.js + '/min/site.js?v=',
      staticFileStats = app.config.citizen.cache.static.enable ? app.cache.get({ scope: 'staticFileStats' }) : false,
      metaData = params.route.action === 'handler' && app.controllers[params.route.controller] && app.controllers[params.route.controller].head ? await app.controllers[params.route.controller].head(params) : {}

  // If the static files are cached, generate the URLs
  if ( staticFileStats && staticFileStats[cssKey] && staticFileStats[jsKey] ) {
    return {
      public: {
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
      stat(app.config.citizen.directories.web + '/themes/' + params.session.themePath.css + '/min/site.css'),
      stat(app.config.citizen.directories.web + '/themes/' + params.session.themePath.js + '/min/site.js')
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
      public: {
        metaData  : metaData,
        cssUrl    : cssUrl + css.mtime.toString().replace(/[ :\-()]/g, ''),
        jsUrl     : jsUrl + js.mtime.toString().replace(/[ :\-()]/g, '')
      }
    }
  }
}
