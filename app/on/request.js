// request events

// This module optionally exports the following methods:
// start(params, context, emitter) - Called at the beginning of every request
// end(params, context, emitter) - Called at the end of every request

// If you have no use for this file, you can delete it.

'use strict';

module.exports = {
  start: start
};


function start(params, context, emitter) {

  // This is a list of controller/action pairs that require authentication. If the
  // pair is requested and the user isn't authenticated, send them to the sign in
  // page, where they'll be redirected to the original route after login.

  var authenticationRequired = {
        account: {
          handler: true
        },
        user: {
          ban: true,
          unban: true
        },
        announcement: {
          start: true,
          startForm: true,
          reply: true,
          replyForm: true,
          subscribe: true,
          unsubscribe: true
        },
        topic: {
          start: true,
          startForm: true,
          startPrivate: true,
          startPrivateForm: true,
          reply: true,
          replyForm: true,
          subscribe: true,
          unsubscribe: true
        },
        'private-topics': {
          handler: true
        },
        post: {
          bookmark: true,
          bookmarkForm: true,
          delete: true,
          deleteForm: true,
          edit: true,
          editForm: true,
          lock: true,
          lockForm: true,
          unlock: true,
          report: true,
          reportForm: true
        }
      },
      redirect = {};

  if ( authenticationRequired[params.route.controller] && authenticationRequired[params.route.controller][params.route.action] && !params.session.username ) {
    redirect = app.config.comitium.baseUrl + 'sign-in';
  }

  emitter.emit('ready', {
    redirect: redirect
  });
}
