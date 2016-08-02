CF.user = ( function (Modernizr, CF) {
  'use strict';

  var methods = {

      init: function () {
        CF.global.collapseQuotes();
      }

    };

  //  Public methods
  return {
    init: methods.init
  };

})(Modernizr, CF);
