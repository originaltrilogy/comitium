window.OT = {
  params: {
    device: {
      hiRes: true
    }
  },
  boundEvents: {
    internalLinks: false
  }
};

OT.immediate = ( function (Modernizr, OT) {
  'use strict';

  var methods = {

    init: function () {
      // methods.responsiveModeSet();
      // methods.hiResCheck();
    }//,

  //  responsiveModeSet: function () {
  //    var windowWidth = $(window).width();
  //    if ( windowWidth >= 960 ) {
  //      DEMO.params.device.relativeSize = 'x-large';
  //    } else if ( windowWidth >= 768 ) {
  //      DEMO.params.device.relativeSize = 'large';
  //    } else if ( windowWidth >= 500 ) {
  //      DEMO.params.device.relativeSize = 'medium';
  //    } else {
  //      DEMO.params.device.relativeSize = 'small';
  //    }
  //    $('html').removeClass('small medium large x-large').addClass(DEMO.params.device.relativeSize);
  //    if ( !Modernizr.mq('only all') ) {
  //      $.ajax({
  //        url: 'app/skins/default/source/js/lib/respond.min.js',
  //        data: 'script'
  //      });
  //    }
  //  },
  //
  //  hiResCheck: function () {
  //    // Check for high resolution displays and provide CSS/JS hooks for them
  //    if ( Modernizr.mq('(min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx)') ) {
  //      $('html').addClass('hi-res');
  //      DEMO.params.device.hiRes = true;
  //    }
  //  }
  //
  };

  //  Public methods
  return {
    init: methods.init//,
    // responsiveModeSet: methods.responsiveModeSet
  };

})(Modernizr, OT);

OT.immediate.init();
