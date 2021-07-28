// layout controller

'use strict'

module.exports = {
  handler : handler
}


function handler(params) {
  let controllerChain = ''
  for ( let link in params.route.chain ) {
    controllerChain += params.route.chain[link].controller + '-' + params.route.chain[link].action + '-' + params.route.chain[link].view + ','
  }
  // Get rid of the extra comma
  controllerChain = controllerChain.substring(0, controllerChain.length-1)

  return {
    public: {
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
  }
}
