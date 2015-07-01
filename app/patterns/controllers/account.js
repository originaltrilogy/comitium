// account controller

'use strict';

module.exports = {
  handler: handler
};


// default action
function handler(params, context, emitter) {

  var content = app.models.account.content();

  emitter.emit('ready', {
    content: content
  });

}
