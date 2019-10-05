CF.members = ( function () {
  'use strict'

  var methods = {

      init: function () {
        document.querySelector('#group-menu li.current a').addEventListener('click', function (e) {
          if ( document.body.clientWidth < 720 ) {
            e.preventDefault()
            e.target.parentNode.parentNode.classList.toggle('show-menu')
          }
        })
      }

    }

  //  Public methods
  return {
    init: methods.init
  }

})(CF)
