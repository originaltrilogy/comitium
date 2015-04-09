// layout controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  var controllerChain = params.route.chain[0].controller;

  for ( var i = 1; i < params.route.chain.length; i++ ) {
    controllerChain = controllerChain + '-' + params.route.chain[i].controller;
  }

  emitter.emit('ready', {
    content: {
      controllerChain: controllerChain
    },
    include: {
      _head: {
        controller: '_head'
      },
      _header: {
        controller: '+_header',
        view: params.session.username ? '+_header-authenticated' : '+_header'
      }
    }
  });
}
