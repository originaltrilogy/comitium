// user controller

'use strict';

module.exports = {
  handler: handler,
  activate: activate,
  ban: ban,
  unban: unban
};



function handler(params, context, emitter) {

  params.url.page = params.url.page || 1;

  app.listen({
    userInfo: function (emitter) {
      app.models.user.info({
        user: params.url.user
      }, emitter);
    },
    posts: function (emitter) {
      var start = ( params.url.page - 1 ) * 25,
          end = start + 25;
      app.models.user.posts({
        user: params.url.user,
        start: start,
        end: end
      }, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      emitter.emit('ready', {
        content: {
          user: output.userInfo,
          posts: output.posts,
          pagination: app.toolbox.helpers.paginate(app.config.main.basePath + 'user/' + output.userInfo.url, params.url.page, output.userInfo.postCount)
        },
        handoff: {
          controller: '+_layout'
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
          view: 'activate',
          handoff: {
            controller: '+_layout'
          }
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
      userInfo: function (emitter) {
        app.models.user.info({
          user: params.url.user
        }, emitter);
      },
      banUser: function (previous, emitter) {
        if ( previous.userInfo.group === 'Administrators' ) {
          emitter.emit('error', {
            statusCode: 403,
            message: 'Administrators can\'t be banned.'
          });
        } else if ( previous.userInfo.group === 'Moderators' && params.session.group !== 'Administrators' ) {
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
        app.session.end('userID', output.userInfo.id);
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
      userInfo: function (emitter) {
        app.models.user.info({
          user: params.url.user
        }, emitter);
      },
      unbanUser: function (previous, emitter) {
        if ( previous.userInfo.group === 'Administrators' && params.session.group !== 'Administrators' ) {
          emitter.emit('error', {
            statusCode: 403,
            message: 'Only an administrator can lift a ban on another administator.'
          });
        } else if ( previous.userInfo.group === 'Moderators' && params.session.group !== 'Administrators' ) {
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
