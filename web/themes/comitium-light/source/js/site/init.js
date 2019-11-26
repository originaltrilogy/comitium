CF.init = function () {
  'use strict'

  var body = document.getElementsByTagName('body')[0],
      controller = body.getAttribute('data-controller'),
      action = body.getAttribute('data-action'),
      view = body.getAttribute('data-view')

  CF.global.init()

  if ( CF[controller] ) {
    CF[controller].init()

    if ( CF[controller][action] && typeof CF[controller][action] === 'function' ) {
      CF[controller][action]()

      if ( CF[controller][action][view] ) {
        CF[controller][action][view]()
      }
    }
  }
}

document.onreadystatechange = function () {
  'use strict'

  if ( document.readyState === 'interactive' ) {
    CF.init()
  }
}
