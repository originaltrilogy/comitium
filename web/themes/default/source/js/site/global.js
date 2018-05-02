CF.global = ( function () {
  'use strict'
  var methods = {

    init: function () {
      var body = document.querySelector('body'),
          bodyOffset = 0,
          timer = 0,
          header = document.querySelector('body > header'),
          accountNav = header.querySelector('nav ul.account'),
          accountNavTimer,
          menuIcon

      // If the URL contains an intra-page anchor (hash) that takes them directly to a specific post, delay the onset of the scroll listener so the header doesn't pop in
      if ( window.location.hash.length ) {
        body.classList.add('hidden-header')
        timer = 1000
      }
      setTimeout( function () {
        window.addEventListener('scroll', function () {
          if ( !body.classList.contains('hidden-header') && bodyOffset > body.getBoundingClientRect().top && Math.abs(body.getBoundingClientRect().top) > header.getBoundingClientRect().height ) {
            body.classList.add('hidden-header')
          // The minus 10 pixels is to keep the header from popping in with only slight movements (happens frequently when using touchscreens and touch input devices)
          // The second half of the statement deals with Safari's bounceback when you scroll past the top of the page
          } else if ( body.getBoundingClientRect().top - 10 >= bodyOffset || Math.abs(body.getBoundingClientRect().top) <= header.getBoundingClientRect().height ) {
            body.classList.remove('hidden-header')
          }

          bodyOffset = body.getBoundingClientRect().top
        })
      }, timer)
      
      // Create the main menu icon
      menuIcon = document.createElement('div')

      menuIcon.setAttribute('id', 'main-menu-icon')
      menuIcon.innerHTML = '<svg class="icon menu"><use xlink:href="themes/default/images/symbols.svg#icon-menu"></use></svg>'
      menuIcon.appendChild(document.createTextNode('Menu'))
      header.insertBefore(menuIcon, header.querySelector('a.home'))

      methods.menu({
        menu: 'header nav',
        trigger: '#main-menu-icon',
        position: 'left'
      })

      if ( document.body.clientWidth >= 600 ) {
        accountNav.addEventListener('mouseleave', function () {
          accountNavTimer = setTimeout( function () {
            accountNav.classList.remove('active')
          }, 500)
        }, false)

        accountNav.addEventListener('mouseover', function () {
          if ( accountNavTimer ) {
            clearTimeout(accountNavTimer)
          }
        })

        if ( header.classList.contains('authenticated') ) {
          header.querySelector('a.account').addEventListener('click', function (e) {
            if ( document.body.clientWidth >= 600 ) { // Just in case they resized the window
              e.preventDefault()
            }
            if ( accountNav.classList.contains('active') ) {
              accountNav.classList.remove('active')
            } else {
              accountNav.classList.add('active')
            }
          })

          window.addEventListener('scroll', function () {
            if ( accountNav.classList.contains('active') ) {
              accountNav.classList.remove('active')
            }
          })
        }
      }
    },

    collapseQuotes: function () {
      var quotes = document.body.querySelectorAll('section.content > blockquote'),
          bindButton = function (quote) {
            var expandButton = document.createElement('a')

            expandButton.setAttribute('href', '#')
            expandButton.classList.add('expand')
            expandButton.innerHTML = 'Expand'
            expandButton.addEventListener('click', function (e) {
              e.preventDefault()
              quote.classList.toggle('expanded')
              if ( expandButton.innerHTML === 'Expand' ) {
                expandButton.innerHTML = 'Collapse'
              } else {
                expandButton.innerHTML = 'Expand'
              }
            })
            quote.classList.add('nested')
            quote.appendChild(expandButton)
          }

      for ( var i = 0; i < quotes.length; i++ ) {
        if ( quotes[i].querySelector('blockquote') ) {
          bindButton(quotes[i])
        }
      }
    },

    menu: function (args) {
      var body = document.querySelector('body'),
          menu,
          trigger = document.querySelector(args.trigger)

      trigger.addEventListener('click', function () {
        var source = document.querySelector(args.menu),
            menuShadow = document.createElement('div')

        menu = source.cloneNode(true)
        body.appendChild(menu)
        menuShadow.className = 'menu-shadow'
        body.appendChild(menuShadow)

        if ( args.keepClass === false ) {
          menu.className = 'slide-menu ' + args.position
        } else {
          menu.className += ' slide-menu ' + args.position
        }

        if ( body.classList.contains('menu-open') ) {
          body.classList.remove('menu-open')
          menu.classList.remove('open')
          body.classList.add('menu-closing')
          setTimeout( function () {
            body.classList.remove('menu-closing')
          }, 200)
        } else {
          body.classList.add('menu-opening')
          setTimeout( function () {
            body.classList.remove('menu-opening')
            body.classList.add('menu-open')
            menu.classList.add('open')
          }, 200)
        }

        menuShadow.addEventListener('click', function () {
          body.classList.remove('menu-open')
          menu.classList.remove('open')
          body.classList.add('menu-closing')
          setTimeout( function () {
            body.classList.remove('menu-closing')
            body.removeChild(menuShadow)
            if ( menu.parentNode !== null ) {
              body.removeChild(menu)
            }
          }, 200)
        }, false)
      }, false)
    },

    // ajaxFormBinding: function(options) {
    //   var form = document.querySelector(options.formSelector),
    //       format = options.format || 'json',
    //       type = options.type || 'direct'

    //   form.addEventListener('submit', function (e) {
    //     var request = new XMLHttpRequest(),
    //         formData = new FormData(form),
    //         data

    //     e.preventDefault()

    //     request.open('POST', form.action + '/format/' + format + '/type/' + type, true)
    //     request.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    //     // request.setRequestHeader('Content-Type', 'application/json')
    //     request.send(formData)

    //     request.onreadystatechange = function () {
    //       console.log('readyState: ' + request.readyState)
    //       console.log('status: ' + request.status)
    //     }

    //     request.onload = function () {
    //       if ( request.status >= 200 && request.status < 400 ) {
    //         data = JSON.parse(request.responseText)
    //         console.log(data)
    //       } else {
    //         // We reached our target server, but it returned an error
    //       }
    //     }

    //     request.onerror = function () {
    //       // There was a connection error of some sort
    //     }
    //   })

    //   // Some browsers don't include the submit button's value when form.submit() is
    //   // called. This function creates a click listener that duplicates a form's submit
    //   // button as a hidden field so its name/value can be included in AJAX POSTs,
    //   // allowing different processing based on different submit buttons.
    //   form.addEventListener('click', function (e) {
    //     var input = document.createElement('input'),
    //         previousActions = form.querySelectorAll('input[type="hidden"].submit-surrogate')

    //     for ( var i = 0; i < previousActions.length; i++ ) {
    //       form.removeChild(previousActions[i])
    //     }

    //     if ( e.target.type && e.target.type.toLowerCase() === 'submit' ) {
    //       input.name = e.target.name
    //       input.type = 'hidden'
    //       input.value = e.target.value
    //       input.className = 'submit-surrogate'

    //       form.appendChild(input)
    //     }
    //   })
    // }
  }

  //  Public methods
  return {
    // ajaxFormBinding: methods.ajaxFormBinding,
    collapseQuotes: methods.collapseQuotes,
    init: methods.init,
    menu: methods.menu
  }

}(CF))
