window.CF = {
  params: {
    device: {
      hiRes: true,
      relativeSize: 'small'
    }
  },
  boundEvents: {
    internalLinks: false,
    viewportResize: false
  }
};

CF.immediate = ( function (Modernizr, CF) {
  'use strict';

  var methods = {

    init: function () {
      methods.responsiveModeSet();
      // methods.hiResCheck();
    },

    responsiveModeSet: function () {
      var html = document.querySelector('html');
      // var windowWidth = $(window).width();
      if ( Modernizr.mq('only screen and (min-width: 720px)') ) {
        CF.params.device.relativeSize = 'x-large';
      } else if ( Modernizr.mq('only screen and (min-width: 600px)') ) {
        CF.params.device.relativeSize = 'large';
      } else if ( Modernizr.mq('only screen and (min-width: 500px)') ) {
        CF.params.device.relativeSize = 'medium';
      }
      html.setAttribute('data-relative-size', CF.params.device.relativeSize);
      if ( html.classList ) {
        html.classList.remove('small');
        html.classList.remove('medium');
        html.classList.remove('large');
        html.classList.remove('x-large');
        html.classList.add(CF.params.device.relativeSize);
      } else {
        html.className = html.className.replace(new RegExp('(^|\\b)' + html.split(' ').join('|') + '(\\b|$)', 'gi'), ' ') + ' ' + CF.params.device.relativeSize;
      }
      // if ( !Modernizr.mq('only all') ) {
      //   $.ajax({
      //     url: 'app/skins/default/source/js/lib/respond.min.js',
      //     data: 'script'
      //   });
      // }
    }//,
  //
  //  hiResCheck: function () {
  //    // Check for high resolution displays and provide CSS/JS hooks for them
  //    if ( Modernizr.mq('(min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx)') ) {
  //      $('html').addClass('hi-res');
  //      CF.params.device.hiRes = true;
  //    }
  //  }
  //
  };

  //  Public methods
  return {
    init: methods.init,
    responsiveModeSet: methods.responsiveModeSet
  };

})(Modernizr, CF);

CF.immediate.init();
