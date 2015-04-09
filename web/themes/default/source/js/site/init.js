OT.init = function () {
	'use strict';

	var body = document.getElementsByTagName('body')[0],
			controller = body.getAttribute('data-controller'),
			action = body.getAttribute('data-action'),
			view = body.getAttribute('data-view');

	OT.global.init();

	if ( OT[controller] ) {
		OT[controller].init();

		if ( OT[controller][action] && typeof OT[controller][action] === 'function' ) {
			OT[controller][action]();

			if ( OT[controller][action][view] ) {
				OT[controller][action][view]();
			}
		}
	}
};

document.onreadystatechange = function () {
	'use strict';

  if ( document.readyState === 'interactive' ) {
    OT.init();
  }
};
