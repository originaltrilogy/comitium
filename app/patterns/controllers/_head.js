// _head controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  var metaData = app.models[params.route.controller] && app.models[params.route.controller].metaData ? app.models[params.route.controller].metaData() : {};

  emitter.emit('ready', {
    content: {
      metaData: metaData
    },
    cache: {
      controller: {
        scope: 'route',
        lifespan: 300000,
        resetOnAccess: true
      }
    }
  });
  
}
