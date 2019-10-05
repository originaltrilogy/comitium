CF.post = ( function () {
  'use strict'

  var methods = {

		init: function () {
      CF.global.collapseQuotes()
		},
		// If the post controller is fired to send the user directly to a post, run the default topic scripts
		topic: function () {
			CF.topic.handler()
		}

  }

	//	Public methods
	return {
		init: methods.init,
		topic: methods.topic
	}

})(CF)