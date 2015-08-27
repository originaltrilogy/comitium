'use strict';

var querystring = require('querystring');

module.exports = {
  start: start
};


function start(params, context, emitter) {
  // Redirects for legacy OT.com forum URLs. Remove this from
  // the shipping version.
  var url = params.route.parsed.path,
      template,
      statusCode = 301,
      regexp = new RegExp(/.*\/([A-Za-z0-9-_]+)\.cfm(.*)/),
      faneditsRegex = new RegExp(/\/fan-edits[\/]?$/),
      petitionRegex = new RegExp(/\/petition[\/]?$/),
      discussionID;

  if ( !regexp.test(url) && !faneditsRegex.test(url) && !petitionRegex.test(url) ) {
    emitter.emit('ready');
  } else {
    if ( faneditsRegex.test(url) ) {
      url = app.config.citizen.urlPaths.app + '/discussion/Fan-Edits-of-Other-Films/id/11';
      statusCode = 302;
    } else if ( petitionRegex.test(url) ) {
      url = '/petition.html';
    } else {
      template = url.replace(regexp, '$1');

      switch ( template ) {
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
            url = url.replace(regexp, app.config.citizen.urlPaths.app + '/post/id/$1');
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
          url = app.config.citizen.urlPaths.app + '/discussions';
          break;
        case 'user-profile':
          url = url.replace(/(.*)\/user\/([0-9]+)[\/]?.*/, '$1/id/$2');
          url = url.replace('user-profile.cfm', 'user');
          break;
        case 'login':
          url = 'sign-in';
          break;
        case 'categories':
          regexp = new RegExp(/.*categories\.cfm\?catid=([0-9]+)/);
          if ( regexp.test(url) ) {
            discussionID = querystring.parse(params.route.parsed.query).catid;
            if ( discussionID == 2 ) {
              discussionID = 22;
            }
            url = app.config.citizen.urlPaths.app + '/discussion/id/' + discussionID;
          }
          break;
        case 'messageview':
          regexp = new RegExp(/.*messageview\.cfm\?.*threadid=([0-9]+)/);
          if ( regexp.test(url) ) {
            url = url.replace(regexp, app.config.citizen.urlPaths.app + '/topic/id/$1');
          }
          break;
        case 'create-an-account':
          url = app.config.citizen.urlPaths.app + '/register';
          break;
        case 'password-request':
          url = app.config.citizen.urlPaths.app + '/password-reset';
          break;
        case 'help':
          url = app.config.citizen.urlPaths.app + '/help.html';
          statusCode = 302;
          break;
        case 'user-lists':
          url = app.config.citizen.urlPaths.app + '/discussions';
          statusCode = 302;
          break;
        case 'contact':
          url = app.config.citizen.urlPaths.app + '/contact';
          break;
        case 'terms-of-service':
          url = app.config.citizen.urlPaths.app + '/terms-of-service.html';
          statusCode = 302;
          break;
        case 'privacy-policy':
          url = app.config.citizen.urlPaths.app + '/terms-of-service.html';
          statusCode = 302;
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
