'use strict';

var querystring = require('querystring');

module.exports = {
  start: start
};


function start(params, context, emitter) {
  // Redirects for legacy OT.com forum URLs
  // REMOVE from shipping version
  var url = params.route.parsed.path,
      template,
      statusCode = 301,
      regexp = new RegExp(/.*\/([A-Za-z0-9-_]+)\.cfm(.*)/),
      forumRegex = new RegExp(/\/forum[\/]?(\/index\.cfm)?$/),
      faneditsRegex = new RegExp(/\/fan-edits[\/]?$/),
      petitionRegex = new RegExp(/\/petition[\/]?$/),
      discussionID;

  if ( !regexp.test(url) && !forumRegex.test(url) && !faneditsRegex.test(url) && !petitionRegex.test(url) ) {
    // Keep all of this (mode security)
    switch ( app.config.comitium.mode.status ) {
      // If full access is enabled, send the user on their way
      case 'online':
        emitter.emit('ready');
        break;
      // If the forum is offline, check the user's permissions
      case 'offline':
        // If moderators are allowed to bypass the offline mode, check permissions
        if ( app.config.comitium.mode.moderatorBypass ) {
          if ( params.session.authenticated ) {
            if ( params.session.moderateDiscussions ) {
              emitter.emit('ready');
            } else {
              emitter.emit('ready', {
                redirect: params.route.controller === 'offline' ? {} : 'offline'
              });
            }
          } else {
            emitter.emit('ready', {
              redirect: params.route.controller === 'sign-in' ? {} : 'sign-in'
            });
          }
        } else {
          emitter.emit('ready', {
            redirect: params.route.controller === 'offline' ? {} : 'offline'
          });
        }
        break;
    }
  } else {
    if ( forumRegex.test(url) ) {
      url = '/discussions';
    } else if ( faneditsRegex.test(url) ) {
      url = '/discussion/Fan-Edits-of-Other-Films/id/11';
      statusCode = 302;
    } else if ( petitionRegex.test(url) ) {
      url = '/petition.html';
    } else {
      url = url.replace(/\/forum/i, '');
      template = url.replace(regexp, '$1');

      switch ( template ) {
        case 'index':
          url = 'https://originaltrilogy.com';
          break;
        case 'topic':
          url = url.replace('/topic/', '/id/');
          url = url.replace('topic.cfm', 'topic');

          // Announcements
          regexp = new RegExp(/(.*)\/forum\/[0-9]+[\/]?(.*)/);
          if ( regexp.test(url) ) {
            url = url.replace('/topic/', '/announcement/');
            url = url.replace(regexp, '$1/$2');
          }

          // Posts
          regexp = new RegExp(/.*\/post\/([0-9]+)[\/]?.*/);
          if ( regexp.test(url) ) {
            url = url.replace(regexp, '/post/id/$1');
          }
          break;
        case 'forum':
          url = url.replace('forum.cfm', 'discussion');
          if ( params.url.forum == 2 ) {
            url = url.replace(/(.*)\/forum\/([0-9]+)[\/]?.*/, '$1/id/22');
          } else {
            url = url.replace(/(.*)\/forum\/([0-9]+)[\/]?.*/, '$1/id/$2');
          }
          break;
        case 'category':
          url = '/discussions';
          break;
        case 'user-profile':
          url = url.replace(/(.*)\/user\/([0-9]+)[\/]?.*/, '$1/id/$2');
          url = url.replace('user-profile.cfm', 'user');
          break;
        case 'login':
          url = '/sign-in';
          break;
        case 'categories':
          regexp = new RegExp(/.*categories\.cfm\?catid=([0-9]+)/);
          if ( regexp.test(url) ) {
            discussionID = querystring.parse(params.route.parsed.query).catid;
            if ( discussionID == 2 ) {
              discussionID = 22;
            }
            url = '/discussion/id/' + discussionID;
          }
          break;
        case 'messageview':
          regexp = new RegExp(/.*messageview\.cfm\?.*threadid=([0-9]+)/);
          if ( regexp.test(url) ) {
            url = url.replace(regexp, '/topic/id/$1');
            url = url.replace(/&STARTPAGE=([0-9]+)/i, '/page/$1');
          }
          break;
        case 'create-an-account':
          url = '/register';
          break;
        case 'password-request':
          url = '/password-reset';
          break;
        case 'about':
          url = 'content/About/id/1';
          break;
        case 'help':
          url = 'content/Help/id/2';
          break;
        case 'user-lists':
          url = '/discussions';
          statusCode = 302;
          break;
        case 'contact':
          url = '/contact';
          break;
        case 'terms-of-service':
        case 'privacy-policy':
          url = 'content/Terms-of-Service/id/3';
          break;
      }

      // Get rid of the trailing slash
      regexp = new RegExp(/(.*)\/$/);
      if ( regexp.test(url) ) {
        url = url.replace(regexp, '$1');
      }

    }

    emitter.emit('ready', {
      redirect: {
        url: url,
        statusCode: statusCode
      }
    });
  }
}
