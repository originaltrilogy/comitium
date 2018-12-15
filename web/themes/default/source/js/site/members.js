CF.members = ( function () {
  'use strict'

  var methods = {

      init: function () {
        document.querySelector('#group-menu li.current a').addEventListener('click', function (e) {
          e.preventDefault()
          e.target.parentNode.parentNode.classList.add('show-menu')
        })
      }

    }

  //  Public methods
  return {
    init: methods.init
  }

})(CF)
