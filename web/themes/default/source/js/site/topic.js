CF.topic = ( function (Modernizr, CF) {
  'use strict';

  var actions, methods;

	actions = {

    handler: function () {
      // if ( document.querySelectorAll('main nav.topic.actions li').length > 2 ) {
      //   methods.topicMenu();
      // }
      var form = document.querySelector('#quick-reply-form'),
          // mask, closeButton, zoomImage, openImage;
          mask;

      if ( form && !CF.global.hasClass(form.parentNode, 'quote') ) {
        methods.postContent();
      }

      if ( CF.params.device.relativeSize === 'x-large' ) {
        mask = document.createElement('div');
        mask.setAttribute('id', 'mask');
        mask.innerHTML = '<div id="mask-close"></div><img><a class="open-tab" target="_blank"></a>';
        // zoomImage = document.createElement('img');
        // openImage = document.createElement('a');
        // openImage.classList.add('open-tab');
        // openImage.setAttribute('target', '_blank');
        // mask.appendChild(zoomImage);
        // mask.appendChild(openImage);
        document.body.appendChild(mask);
      }

      document.querySelectorAll('section.posts article.post section.content.post p > img, section.posts article.post section.content.post > img').forEach( function (item, index, array) {
        var wrapper = document.createElement('div'),
            parent = item.parentNode,
            src = item.getAttribute('src'),
            closeButton = mask.querySelector('#mask-close'),
            zoomImage = mask.querySelector('img'),
            openImage = mask.querySelector('a.open-tab');
        
        wrapper.classList.add('zoom');
        parent.appendChild(wrapper);
        parent.insertBefore(wrapper, item);
        wrapper.appendChild(item);

        item.addEventListener('click', function (e) {
          zoomImage.setAttribute('src', src);
          openImage.setAttribute('href', src);
          openImage.innerText = src;
          document.body.classList.remove('floating-header-active');
          document.querySelector('html').classList.add('mask-enabled');
          document.body.classList.add('floating-header-hidden');
          mask.classList.add('enabled');
          closeButton.addEventListener('click', function (e) {
            mask.classList.remove('enabled');
            document.querySelector('html').classList.remove('mask-enabled');
          });
        });
      });
    },

    start: function () {
      // CF.global.ajaxFormBinding({
      //   formSelector: '#topic-write-form'
      // });
      methods.postContent();
    },

    reply: function () {
      // CF.global.ajaxFormBinding({
      //   formSelector: '#topic-reply-form'
      // });
      var form = document.querySelector('#topic-reply-form');

      if ( form && !CF.global.hasClass(form.parentNode, 'quote') ) {
        methods.postContent();
      }
    }

	};

  methods = {

		init: function () {
      CF.global.collapseQuotes();
      // methods.postContent();
		},

    // topicMenu: function () {
    //   var menu = document.querySelector('main nav.topic.actions ul'),
    //       moreButton = document.createElement('li'),
    //       moreAnchor = document.createElement('a');

    //   moreButton.className = 'more';
    //   moreButton.appendChild(moreAnchor);
    //   moreAnchor.appendChild(document.createTextNode('More...'));
    //   menu.appendChild(moreButton);

    //   CF.global.menu({
    //     menu: 'main nav.topic.actions',
    //     trigger: 'main nav.topic.actions li.more a',
    //     position: 'right',
    //     clone: true,
    //     keepClass: false
    //   });

    // },

    postContent: function () {
      var postContent = document.getElementById('post-content'),
          postContentText = postContent ? postContent.value : '';

      if ( postContent ) {
        postContent.addEventListener('focus', function (e) {
          if ( postContent.value === postContentText ) {
            postContent.value = '';
          }
        });
        postContent.addEventListener('blur', function (e) {
          if ( postContent.value === '' ) {
            postContent.value = postContentText;
          }
        });
      }
    }

  };

	//	Public methods
	return {
		init: methods.init,
    handler: actions.handler,
    start: actions.start,
    startPrivate: actions.start,
    startAnnouncement: actions.start,
    reply: actions.reply
	};

})(Modernizr, CF);


// For now, the announcement library is the same as the topic library
CF.announcement = CF.topic;
