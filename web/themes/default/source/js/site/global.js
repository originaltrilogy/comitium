CF.global = ( function (Modernizr, CF) {
  'use strict';
  var methods = {

    init: function () {
      var body = document.querySelector('body'),
          bodyOffset = 0,
          header = document.querySelector('body > header'),
          main = document.querySelector('main'),
          accountNav = header.querySelector('nav ul.account'),
          accountNavTimer,
          menuIcon;

      body.className = 'floating-header';
      // Weird artifact in Chrome causes the padding to be an extra pixel too tall, so subtract 1px
      main.style.paddingTop = ( header.getBoundingClientRect().height - 1 ) + 'px';

      window.addEventListener('scroll', function (e) {
        if ( bodyOffset > body.getBoundingClientRect().top && Math.abs(body.getBoundingClientRect().top) > header.getBoundingClientRect().height && !methods.hasClass(body, 'floating-header-hidden') ) {
          methods.removeClass(body, 'floating-header-active');
          body.className += ' floating-header-hidden';
        } else if ( body.getBoundingClientRect().top > bodyOffset ) {
          methods.removeClass(body, 'floating-header-hidden');
          if ( !methods.hasClass(body, 'floating-header-active') ) {
            body.className += ' floating-header-active';
          }
        }

        if ( body.getBoundingClientRect().top === 0 ) {
          body.className = 'floating-header';
        }

        bodyOffset = body.getBoundingClientRect().top;
      });

      if ( Modernizr.csstransitions && CF.params.device.relativeSize === 'small' || CF.params.device.relativeSize === 'medium' ) {
        menuIcon = document.createElement('div');

        menuIcon.className = 'main-menu-icon';
        menuIcon.appendChild(document.createTextNode('Menu'));
        header.appendChild(menuIcon);

        methods.menu({
          menu: 'header nav',
          trigger: 'header .main-menu-icon',
          position: 'left'
        });
      }

      if ( CF.params.device.relativeSize === 'large' || CF.params.device.relativeSize === 'x-large' ) {
        accountNav.addEventListener('mouseleave', function (e) {
          accountNavTimer = setTimeout( function () {
            methods.removeClass(accountNav, 'active');
          }, 500);
        }, false);

        accountNav.addEventListener('mouseover', function (e) {
          if ( accountNavTimer ) {
            clearTimeout(accountNavTimer);
          }
        });

        if ( methods.hasClass(header, 'authenticated') ) {
          header.querySelector('a.account').addEventListener('click', function (e) {
            if ( methods.hasClass(accountNav, 'active') ) {
              methods.removeClass(accountNav, 'active');
            } else {
              accountNav.className += ' active';
            }
            e.preventDefault();
          });

          window.addEventListener('scroll', function (e) {
            if ( methods.hasClass(accountNav, 'active') ) {
              methods.removeClass(accountNav, 'active');
            }
          });
        }
      }

      methods.viewportResizeCheck('responsiveModeSet', CF.immediate.responsiveModeSet);
      methods.viewportResizeCheck('frameworkReinit', CF.global.init);
      // methods.bindInternalLinks();
    },

    collapseQuotes: function () {
      var quotes = document.body.querySelectorAll('section.content > blockquote'),
          bindButton = function (quote) {
            var expandButton = document.createElement('a');

            expandButton.setAttribute('href', '#');
            expandButton.classList.add('expand');
            expandButton.innerHTML = 'Expand';
            expandButton.addEventListener('click', function (e) {
              e.preventDefault();
              quote.classList.toggle('expanded');
              if ( expandButton.innerHTML === 'Expand' ) {
                expandButton.innerHTML = 'Collapse';
              } else {
                expandButton.innerHTML = 'Expand';
              }
            });
            quote.classList.add('nested');
            quote.appendChild(expandButton);
          };

      for ( var i = 0; i < quotes.length; i++ ) {
        if ( quotes[i].querySelector('blockquote') ) {
          bindButton(quotes[i]);
        }
      }
    },

    menu: function (args) {
      var body = document.querySelector('body'),
          menu,
          trigger = document.querySelector(args.trigger);

      trigger.addEventListener('click', function () {
        var source = document.querySelector(args.menu),
            menuShadow = document.createElement('div');

        menu = source.cloneNode(true);
        body.appendChild(menu);
        menuShadow.className = 'menu-shadow';
        body.appendChild(menuShadow);

        if ( args.keepClass === false ) {
          menu.className = 'slide-menu ' + args.position;
        } else {
          menu.className += ' slide-menu ' + args.position;
        }

        if ( methods.hasClass(body, 'menu-open') ) {
          methods.removeClass(body, 'menu-open');
          methods.removeClass(menu, 'open');
          body.className += ' menu-closing';
          setTimeout( function () {
            methods.removeClass(body, 'menu-closing');
          }, 200);
        } else {
          body.className += ' menu-opening';
          setTimeout( function () {
            methods.removeClass(body, 'menu-opening');
            body.className += ' menu-open';
            menu.className += ' open';
          }, 200);
        }

        menuShadow.addEventListener('click', function () {
          methods.removeClass(body, 'menu-open');
          methods.removeClass(menu, 'open');
          body.className += ' menu-closing';
          setTimeout( function () {
            methods.removeClass(body, 'menu-closing');
            body.removeChild(menuShadow);
            if ( menu.parentNode !== null ) {
              body.removeChild(menu);
            }
          }, 200);
        }, false);
      }, false);
    },

    hasClass: function (element, className) {
      if ( element.classList ) {
        return element.classList.contains(className);
      } else {
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
      }
    },

    removeClass: function (element, className) {
      if ( element.classList ) {
        element.classList.remove(className);
      } else {
        element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      }
    },

    toggleClass: function (element, className) {
      if ( methods.hasClass(element, className) ) {
        methods.removeClass(element, className);
      } else {
        element.className += ' ' + className;
      }
    },

    ajaxFormBinding: function(options) {
      var form = document.querySelector(options.formSelector),
          format = options.format || 'json',
          type = options.type || 'direct';

      form.addEventListener('submit', function (e) {
        var request = new XMLHttpRequest(),
            formData = new FormData(form),
            data;

        e.preventDefault();

        request.open('POST', form.action + '/format/' + format + '/type/' + type, true);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        // request.setRequestHeader('Content-Type', 'application/json');
        request.send(formData);

        request.onreadystatechange = function () {
          console.log('readyState: ' + request.readyState);
          console.log('status: ' + request.status);
        };

        request.onload = function () {
          if ( request.status >= 200 && request.status < 400 ) {
            data = JSON.parse(request.responseText);
            console.log(data);
          } else {
            // We reached our target server, but it returned an error
          }
        };

        request.onerror = function () {
          // There was a connection error of some sort
        };
      });

      // Some browsers don't include the submit button's value when form.submit() is
      // called. This function creates a click listener that duplicates a form's submit
      // button as a hidden field so its name/value can be included in AJAX POSTs,
      // allowing different processing based on different submit buttons.
      form.addEventListener('click', function (e) {
        var input = document.createElement('input'),
            previousActions = form.querySelectorAll('input[type="hidden"].submit-surrogate');

        for ( var i = 0; i < previousActions.length; i++ ) {
          form.removeChild(previousActions[i]);
        }

        if ( e.target.type && e.target.type.toLowerCase() === 'submit' ) {
          input.name = e.target.name;
          input.type = 'hidden';
          input.value = e.target.value;
          input.className = 'submit-surrogate';

          form.appendChild(input);
        }
      });
    },

    // hrefParser: function (historyUrl) {
    //  var newContentUrl = historyUrl + '/type/ajax/',
    //    newContentUrl = newContentUrl.replace(/\/\//, '/'),
    //    newBodyID = historyUrl.replace(/^[\/]?([A-Za-z0-9-_]+)\/.*/, '$1'),
    //    parsedHref = {};
    //  if ( historyUrl === '/' ) {
    //    newContentUrl = historyUrl;
    //    newBodyID = 'index';
    //  }
    //  parsedHref = {
    //    historyUrl: historyUrl,
    //    newContentUrl: newContentUrl,
    //    newBodyID: newBodyID
    //  };
    //  return parsedHref;
    // },
    //
    // bindInternalLinks: function () {
    //  if ( Modernizr.history && !CF.boundEvents.internalLinks ) {
    //    window.addEventListener('popstate', function (e) {
    //      var parsedHref = methods.hrefParser(location.pathname);
    //      // If it's the first request, don't do anything. If an ajax request has been fired previously, run updateContent to handle the back button
    //      if ( $('body').hasClass('pushed') ) {
    //        methods.updateContent('pop', parsedHref.historyUrl, parsedHref.newContentUrl, parsedHref.newBodyID);
    //      }
    //    });
    //    $('body').on('click.updateContent', 'a:nCF([href^="http"],[href^="tel"],[href^="app/"],[href^="index/frameworkReinit/true/"])', function (e) {
    //      var parsedHref = methods.hrefParser($(this).attr('href'));
    //      e.preventDefault();
    //      methods.updateContent('push', parsedHref.historyUrl, parsedHref.newContentUrl, parsedHref.newBodyID);
    //      //  BONUS: Write destroy methods for all CF.namespaces so bound events and changes to the DOM can be cleaned up easily on new page loads
    //    });
    //    CF.boundEvents.internalLinks = true;
    //  }
    // },
    //
    // updateContent: function (historyEvent, historyUrl, newContentUrl, newBodyID) {
    //  $('body').addClass('transitioning');
    //  $('html, body').scrollTop(0);
    //  // Append the loading indicator when transitioning to new content, but only if the response isn't received
    //  // within a brief delay window
    //  setTimeout( function () {
    //    if ( $('body').hasClass('transitioning') && !$('body').hasClass('loaded') ) {
    //      $('#primary-content-wrap').append('<span class="loading-indicator"></span>');
    //    }
    //  }, 250);
    //  $.ajax({
    //    url: newContentUrl,
    //    dataType: 'html',
    //    success: function (data) {
    //      var newContent = $(data),
    //        contentObject = newBodyID.replace(/-/, '');
    //      // Uncomment the timeout to simulate a 3-second delay in the response
  //        // setTimeout( function () {
    //      $('body').attr('id', newBodyID);
    //      $('body').attr('class', newBodyID + ' view-' + newBodyID + ' show-default do-default action-default type-default transitioning');
    //      $('title').html(newContent.filter('title').html());
    //      $('meta[name="description"]').attr('content', newContent.filter('meta[name="description"]').attr('content'));
    //      $('meta[name="keywords"]').attr('content', newContent.filter('meta[name="keywords"]').attr('content'));
    //      $('#primary-content').html(newContent.find('#primary-content').html());
    //      if ( typeof CF[contentObject] !== 'undefined' ) {
    //        CF[contentObject].init();
    //      }
    //      $('body').addClass('loaded pushed');
    //      $('#primary-content-wrap > span.loading-indicator').remove();
    //      // 150ms delay matches the CSS transition
    //      setTimeout( function () {
    //        // Second attempt to remove the loading indicator just in case it appears between the response and the delay set above
    //        $('#primary-content-wrap > span.loading-indicator').remove();
    //        $('body').removeClass('transitioning');
    //        $('body').removeClass('loaded');
    //      }, 150);
    //      if ( historyEvent === 'push' ) {
    //        history.pushState(newBodyID,newBodyID,historyUrl);
    //      }
  //        // }, 3000);
    //    }
    //  });
    // },
    //
    // preload: function (elements) {
    //
    //  var methods = {
    //
    //    init: function () {
    //      var $preload = '';
    //      $('body').append('<div id="preload" style="position: absolute; left: -1000em; width: 1px; height: 1px;"></div>');
    //      $preload = $('#preload');
    //      return $preload;
    //    },
    //
    //    image: function (elements) {
    //      var elementsArray = elements.split(','),
    //        $preload = $('#preload');
    //      if ( !$preload.length ) {
    //        $preload = methods.init();
    //      }
    //      for ( var i = 0; i < elementsArray.length; i++ ) {
    //        $preload.append('<img src="' + elementsArray[i] + '" />');
    //      }
    //      $preload.remove();
    //    }
    //
    //  };
    //
    //  methods.image(elements);
    //
    // },
    //
    viewportResizeCheck: function (namespace, callback) {
      var windowWidth = document.body.clientWidth,
          delay = 0;
      //  If the browser is resized, check the viewport size after a slight delay and run the
      //  provided callback function.
      window.addEventListener('resize', function (e) {
        clearTimeout(delay);
        delay = setTimeout( function () {
          if ( document.body.clientWidth !== windowWidth ) {
            windowWidth = document.body.clientWidth;
            callback();
          }
        }, 500);
      });
     // $(window).on('resize.' + namespace, function (e) {
     //   clearTimeout(delayCheckViewport);
     //   delayCheckViewport = setTimeout( function () {
     //     if ( $(window).width() !== windowWidth ) {
     //       windowWidth = $(window).width();
     //       callback();
     //     }
     //   }, 500);
     // });
    },
    //
    // responsiveImages: function (selector, cleanup) {
    //  var path = '',
    //    size = '';
    //  if ( typeof selector === 'undefined' ) {
    //    selector = 'body';
    //  }
    //  if ( typeof cleanup === 'undefined' ) {
    //    cleanup = true;
    //  }
    //  if ( CF.params.device.hiRes ) {
    //    size = '-2x';
    //  }
    //  if ( cleanup ) {
    //    $('a.responsive, img.responsive').remove();
    //  }
    //  $(selector + ' noscript').each( function () {
    //    var sizes = [],
    //      respond = false,
    //      className = 'responsive';
    //    if ( typeof $(this).attr('data-image') !== 'undefined' ) {
    //      if ( $(this).attr('data-sizes') ) {
    //        sizes = $(this).attr('data-sizes').split(' ');
    //        for ( var i = 0; i < sizes.length; i++ ) {
    //          if ( sizes[i] === CF.params.device.relativeSize ) {
    //            respond = true;
    //            break;
    //          }
    //        }
    //      } else {
    //        respond = true;
    //      }
    //      if ( respond ) {
    //        path = $(this).attr('data-image').replace(/-small.|-medium.|-large.|-x-large./, '-' + CF.params.device.relativeSize + size + '.');
    //        if ( $(this).attr('class') ) {
    //          className = className + ' ' + $(this).attr('class');
    //        }
    //        if ( typeof $(this).attr('data-anchor') !== 'undefined' ) {
    //          $(this).after('<a class="' + className + '" href="' + $(this).attr('data-anchor') + '"><img class="' + className + '" src="' + path + '" /></a>');
    //        } else {
    //          $(this).after('<img class="' + className + '" src="' + path + '" />');
    //        }
    //      }
    //    }
    //  });
    // }

  };

  //  Public methods
  return {
    collapseQuotes: methods.collapseQuotes,
    init: methods.init,
    menu: methods.menu,
    hasClass: methods.hasClass,
    removeClass: methods.removeClass,
    ajaxFormBinding: methods.ajaxFormBinding
    // preload: methods.preload,
    // viewportResizeCheck: methods.viewportResizeCheck
  };

}(Modernizr, CF));
