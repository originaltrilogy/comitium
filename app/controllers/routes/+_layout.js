// layout controller

export const handler = async (params) => {
  let chain = ''
  for ( let link in params.route.chain ) {
    chain += params.route.chain[link].controller + '-' + params.route.chain[link].action + '-' + params.route.chain[link].view + ','
  }
  // Get rid of the extra comma
  chain = chain.substring(0, chain.length-1)

  return {
    local: {
      chain: chain
    },
    include: {
      _head: '/_head/controller/' + params.route.controller,
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
