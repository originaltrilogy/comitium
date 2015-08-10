CF.topic = ( function (Modernizr, CF) {
  'use strict';

	var actions = {

      handler: function () {
        // if ( document.querySelectorAll('main nav.topic.actions li').length > 2 ) {
        //   methods.topicMenu();
        // }
        var form = document.querySelector('#quick-reply-form');

        if ( form && !CF.global.hasClass(form.parentNode, 'quote') ) {
          methods.postContent();
        }
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

		},

    methods = {

			init: function () {
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
