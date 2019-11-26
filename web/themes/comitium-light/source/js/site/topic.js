CF.topic = ( function () {
  'use strict'

  var actions, methods

	actions = {

    handler: function () {
      var form = document.querySelector('#quick-reply-form')

      if ( form && !form.parentNode.classList.contains('quote') ) {
        methods.postContent()
      }
      methods.imageZoom()
    },

    start: function () {
      // CF.global.ajaxFormBinding({
      //   formSelector: '#topic-write-form'
      // })
      methods.imageZoom()
      methods.postContent()
    },

    startForm: function () {
      methods.imageZoom()
    },

    reply: function () {
      // CF.global.ajaxFormBinding({
      //   formSelector: '#topic-reply-form'
      // })
      var form = document.querySelector('#topic-reply-form')

      if ( form && !form.parentNode.classList.contains('quote') ) {
        methods.postContent()
      }
      methods.imageZoom()
    },

    replyForm: function () {
      methods.imageZoom()
    }

	}

  methods = {

		init: function () {
      CF.global.collapseQuotes()
    },
    
    imageZoom: function () {
      if ( document.body.clientWidth >= 720 ) {
        var mask = document.createElement('div')
        mask.setAttribute('id', 'mask')
        document.body.appendChild(mask)

        document.querySelectorAll('article.post section.content.post p > img, article.post section.content.post > img').forEach( function (item) {
          var zoomWrapper = document.createElement('span'),
              zoomButton = document.createElement('span'),
              parent = item.parentNode,
              src = item.getAttribute('src')
          
          zoomWrapper.classList.add('zoom')
          parent.appendChild(zoomWrapper)
          zoomButton.classList.add('zoom-button')
          zoomButton.innerHTML = '<svg class="icon zoom-in"><use xlink:href="themes/default/images/symbols.svg#icon-zoom-in"></use></svg>'
          zoomWrapper.appendChild(item)
          zoomWrapper.appendChild(zoomButton)

          zoomWrapper.addEventListener('click', function () {
            mask.innerHTML = '<div id="mask-close"><svg class="icon close"><use xlink:href="themes/default/images/symbols.svg#icon-close"></use></svg></div><img src="' + src + '"><a class="open-tab" href="' + src + '" target="_blank">' + src + '<svg class="icon arrow-up-right"><use xlink:href="themes/default/images/symbols.svg#icon-arrow-up-right"></use></svg></a>'
            document.querySelector('html').classList.add('mask-enabled')
            mask.classList.add('enabled')

            window.addEventListener('keydown', escape)
            mask.querySelector('#mask-close').addEventListener('click', function () {
              close()
            })

            function escape(e) {
              if ( e.key === 'Escape' ) {
                close()
              }
            }

            function close() {
              document.querySelector('html').classList.remove('mask-enabled')
              mask.classList.remove('enabled')
              mask.innerHTML = ''
              window.removeEventListener('keydown', escape)
            }
          })
        })
      }
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
    startForm: actions.startForm,
    // Private topic and announcement actions use the same scripts as default topic actions
    startPrivate: actions.start,
    startPrivateForm: actions.startForm,
    startAnnouncement: actions.start,
    startAnnouncementForm: actions.startForm,
    reply: actions.reply,
    replyForm: actions.replyForm
	}

})(CF)


// For now, the announcement library is the same as the topic library
CF.announcement = CF.topic
