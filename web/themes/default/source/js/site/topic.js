OT.topic = ( function (Modernizr, OT) {
  'use strict';

	var actions = {

      handler: function () {

      },

      write: function () {
        // OT.global.ajaxFormBinding({
        //   formSelector: '#topic-write-form'
        // });
        // methods.postContent();
      },

      reply: function () {
        // OT.global.ajaxFormBinding({
        //   formSelector: '#topic-reply-form'
        // });
        // methods.postContent();
      },

		},

    methods = {

			init: function () {

			},

      postContent: function () {
        var postContent = document.getElementById('post-content'),
            postContentText = postContent.value;

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

    };

	//	Public methods
	return {
		init: methods.init,
    handler: actions.handler,
    write: actions.write,
    writeForm: actions.write,
    reply: actions.reply,
    replyForm: actions.reply
	};

})(Modernizr, OT);
