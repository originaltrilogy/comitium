// layout controller

'use strict';

module.exports = {
  handler: handler
};


function handler(params, context, emitter) {
  var controllerChain = '';

  for ( var i = 0; i < params.route.chain.length; i++ ) {
    controllerChain += params.route.chain[i].controller;
    if ( i < params.route.chain.length-1 ) {
      controllerChain += ', ';
    }
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
      },
      _footer: {
        controller: '_footer'
      }
    }
  });
}
