// user controller

'use strict';

module.exports = {
  handler: handler,
  activate: activate,
  ban: ban,
  unban: unban,
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
          userID: params.url.id,
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
          pagination: app.toolbox.helpers.paginate(app.config.main.basePath + 'user/' + output.user.url + '/id/' + output.user.id, params.url.page, output.user.postCount)
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
          content: output,
          view: 'activate',
          handoff: {
            controller: 'sign-in',
            view: 'sign-in-partial'
          }
        });

      } else {

        emitter.emit('ready', {
          content: output,
          view: 'activate'
        });

      }

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function ban(params, context, emitter) {

  if ( params.session.moderateUsers ) {

    app.listen('waterfall', {
      user: function (emitter) {
        app.models.user.info({
          user: params.url.user
        }, emitter);
      },
      banUser: function (previous, emitter) {
        if ( previous.user.group === 'Administrators' ) {
          emitter.emit('error', {
            statusCode: 403,
            message: 'Administrators can\'t be banned.'
          });
        } else if ( previous.user.group === 'Moderators' && params.session.group !== 'Administrators' ) {
          emitter.emit('error', {
            statusCode: 403,
            message: 'Only an administrator can ban a moderator.'
          });
        } else {
          app.models.user.ban({
            user: params.url.user
          }, emitter);
        }
      }
    }, function (output) {
      if ( output.listen.success ) {
        app.session.end('userID', output.user.id);
        emitter.emit('ready', {
          redirect: params.request.headers.referer
        });
      } else {
        emitter.emit('error', output.listen);
      }
    });

  } else {

    emitter.emit('error', {
      statusCode: 403
    });

  }

}



function unban(params, context, emitter) {

  if ( params.session.moderateUsers ) {

    app.listen('waterfall', {
      user: function (emitter) {
        app.models.user.info({
          user: params.url.user
        }, emitter);
      },
      unbanUser: function (previous, emitter) {
        if ( previous.user.group === 'Administrators' && params.session.group !== 'Administrators' ) {
          emitter.emit('error', {
            statusCode: 403,
            message: 'Only an administrator can lift a ban on another administator.'
          });
        } else if ( previous.user.group === 'Moderators' && params.session.group !== 'Administrators' ) {
          emitter.emit('error', {
            statusCode: 403,
            message: 'Only an administrator can lift a ban on a moderator.'
          });
        } else {
          app.models.user.unban({
            user: params.url.user
          }, emitter);
        }
      }
    }, function (output) {
      if ( output.listen.success ) {
        emitter.emit('ready', {
          redirect: params.request.headers.referer
        });
      } else {
        emitter.emit('error', output.listen);
      }
    });

  } else {

    emitter.emit('error', {
      statusCode: 403
    });

  }

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
      if ( !output.access.redirect ) {
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
