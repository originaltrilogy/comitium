// user controller

'use strict';

module.exports = {
  handler: handler,
  activate: activate,
  ban: ban,
  liftBan: liftBan,
  edit: edit,
  editForm: editForm
};



function handler(params, context, emitter) {

  params.url.page = params.url.page || 1;

  app.listen('waterfall', {
    user: function (emitter) {
      app.models.user.info({
        userID: params.url.id
      }, emitter);
    },
    posts: function (previous, emitter) {
      if ( previous.user ) {
        var start = ( params.url.page - 1 ) * 25,
            end = start + 25;
        app.models.user.posts({
          userID: previous.user.id,
          visitorGroupID: params.session.groupID,
          start: start,
          end: end
        }, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      emitter.emit('ready', {
        content: {
          talkPrivately: params.session.talkPrivately && output.user.id !== params.session.userID,
          editProfile: output.user.id === params.session.userID || params.session.moderateUsers,
          banUser: output.user.id !== params.session.userID && params.session.moderateUsers,
          user: output.user,
          posts: output.posts,
          pagination: app.toolbox.helpers.paginate(app.config.comitium.basePath + 'user/' + output.user.url + '/id/' + output.user.id, params.url.page, output.user.postCount)
        }
      });
    } else {
      emitter.emit('error', output.listen);
    }
  });
}



function activate(params, context, emitter) {

  app.listen({
    activate: function (emitter) {
      app.models.user.activate({
        id: params.url.id || false,
        activationCode: params.url.activationCode || false
      }, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.activate.success || ( !output.activate.success && output.activate.reason === 'accountAlreadyActivated' ) ) {
        emitter.emit('ready', {
          view: 'activate',
          content: output,
          handoff: {
            controller: 'sign-in',
            view: 'sign-in-partial'
          }
        });
      } else {
        emitter.emit('ready', {
          view: 'activate',
          content: output
        });
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function ban(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.userBan({
        userID: params.url.id,
        user: params.session
      }, emitter);
    },
    proceed: function (previous, emitter) {
      if ( previous.access === true ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('end', false);
      }
    },
    user: function (previous, emitter) {
      app.models.user.info({
        userID: params.url.id
      }, emitter);
    },
    banUser: function (previous, emitter) {
      app.models.user.ban({
        userID: params.url.id
      }, emitter);
      // End the user's session immediately
      app.session.end('userID', previous.user.id);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        emitter.emit('ready', {
          redirect: params.request.headers.referer
        });
      } else {
        emitter.emit('ready', output.access);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function liftBan(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.userBan({
        userID: params.url.id,
        user: params.session
      }, emitter);
    },
    proceed: function (previous, emitter) {
      if ( previous.access === true ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('end', false);
      }
    },
    user: function (previous, emitter) {
      app.models.user.info({
        userID: params.url.id
      }, emitter);
    },
    liftBan: function (previous, emitter) {
      app.models.user.liftBan({
        userID: params.url.id
      }, emitter);
      // End the user's session immediately
      app.session.end('userID', previous.user.id);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        emitter.emit('ready', {
          redirect: params.request.headers.referer
        });
      } else {
        emitter.emit('ready', output.access);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function edit(params, context, emitter) {

  app.listen('waterfall', {
    access: function (emitter) {
      app.toolbox.access.userEdit(params.url.id, params.session, emitter);
    },
    user: function (previous, emitter) {
      if ( previous.access ) {
        app.models.user.info({
          userID: params.url.id
        }, emitter);
      } else {
        emitter.emit('end');
      }
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( output.access === true ) {
        emitter.emit('ready', {
          view: 'edit'
        });
      } else {
        emitter.emit('ready', output.access);
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function editForm(params, context, emitter) {

}
