CF.members = ( function () {
  'use strict'

  var methods = {

      init: function () {
        if ( document.body.clientWidth < 720 ) {
          let currentGroup = document.querySelector('#group-menu li.current a')
          if ( currentGroup ) {
            currentGroup.addEventListener('click', function (e) {
              e.preventDefault()
              e.target.parentNode.parentNode.classList.toggle('show-menu')
            })
          }
        }
      }

    }

  //  Public methods
  return {
    init: methods.init
  }

})(CF)
