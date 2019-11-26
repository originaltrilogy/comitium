CF.user = ( function () {
  'use strict'

  var methods = {

      init: function () {
        CF.global.collapseQuotes()
      }

    }

  //  Public methods
  return {
    init: methods.init
  }

})(CF)
