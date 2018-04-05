CF.topic = ( function () {
  'use strict'

  var actions, methods

	actions = {

    handler: function () {
      var form = document.querySelector('#quick-reply-form'),
          mask

      if ( form && !form.parentNode.classList.contains('quote') ) {
        methods.postContent()
      }

      if ( document.body.clientWidth >= 720 ) {
        mask = document.createElement('div')
        mask.setAttribute('id', 'mask')
        document.body.appendChild(mask)

        document.querySelectorAll('section.posts article.post section.content.post p > img, section.posts article.post section.content.post > img').forEach( function (item) {
          var zoomWrapper = document.createElement('span'),
              imageWrapper = document.createElement('span'),
              parent = item.parentNode,
              src = item.getAttribute('src')
          
          zoomWrapper.classList.add('zoom')
          imageWrapper.classList.add('zoom-image')
          zoomWrapper.appendChild(imageWrapper)
          parent.appendChild(zoomWrapper)
          parent.insertBefore(zoomWrapper, item)
          imageWrapper.appendChild(item)

          imageWrapper.addEventListener('click', function () {
            mask.innerHTML = '<div id="mask-close"></div><img src="' + src + '"><a class="open-tab" href="' + src + '" target="_blank">' + src + '</a>'
            document.querySelector('html').classList.add('mask-enabled')
            mask.classList.add('enabled')

            mask.querySelector('#mask-close').addEventListener('click', function () {
              mask.classList.add('closing')
              document.querySelector('html').classList.remove('mask-enabled')

              setTimeout( function () {
                mask.classList.remove('closing', 'enabled')
                mask.innerHTML = ''
              }, 200)
            })
          })
        })
      }
    },

    start: function () {
      // CF.global.ajaxFormBinding({
      //   formSelector: '#topic-write-form'
      // })
      methods.postContent()
    },

    reply: function () {
      // CF.global.ajaxFormBinding({
      //   formSelector: '#topic-reply-form'
      // })
      var form = document.querySelector('#topic-reply-form')

      if ( form && !form.parentNode.classList.contains('quote') ) {
        methods.postContent()
      }
    }

	}

  methods = {

		init: function () {
      CF.global.collapseQuotes()
		},

    postContent: function () {
      var postContent = document.getElementById('post-content'),
          postContentText = postContent ? postContent.value : ''

      if ( postContent ) {
        postContent.addEventListener('focus', function () {
          if ( postContent.value === postContentText ) {
            postContent.value = ''
          }
        })
        postContent.addEventListener('blur', function () {
          if ( postContent.value === '' ) {
            postContent.value = postContentText
          }
        })
      }
    }

  }

	//	Public methods
	return {
		init: methods.init,
    handler: actions.handler,
    start: actions.start,
    startPrivate: actions.start,
    startAnnouncement: actions.start,
    reply: actions.reply
	}

})(CF)


// For now, the announcement library is the same as the topic library
CF.announcement = CF.topic
