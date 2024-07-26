// request event hooks

import querystring from 'querystring'


export const start = async (params) => {
  // Redirects for legacy OT.com forum URLs
  // REMOVE from shipping version
  let url           = params.route.parsed.pathname,
      template      ,
      statusCode    = 301,
      regexp        = new RegExp(/.*\/([A-Za-z0-9-_]+)\.cfm(.*)/),
      forumRegex    = new RegExp(/\/forum[/]?(\/index\.cfm)?$/),
      faneditsRegex = new RegExp(/\/fan-edits[/]?$/),
      discussionID

  if ( !regexp.test(url) && !forumRegex.test(url) && !faneditsRegex.test(url) ) {
    // Keep all of this (mode security)
    switch ( app.config.comitium.mode.status ) {
      // If full access is enabled, send the user on their way
      case 'online':
        // Check if url.id is a valid value when provided, throw a 404 if invalid
        if ( params.url.id && !app.helpers.validate.positiveInteger(params.url.id) || params.url.page && !app.helpers.validate.positiveInteger(params.url.page) ) {
          let err = new Error()
          err.statusCode = 404
          throw err
        }

        return
      // If the forum is offline, check the user's permissions
      case 'offline':
        // If moderators are allowed to bypass the offline mode, check permissions
        if ( app.config.comitium.mode.moderatorBypass ) {
          if ( params.session.authenticated ) {
            if ( params.session.moderate_discussions ) {
              return
            } else {
              return {
                redirect: params.route.controller === 'offline' ? {} : 'offline'
              }
            }
          } else {
            return {
              redirect: params.route.controller === 'sign-in' ? {} : 'sign-in'
            }
          }
        } else {
          return {
            redirect: params.route.controller === 'offline' ? {} : 'offline'
          }
        }
      }
  } else {
    if ( forumRegex.test(url) ) {
      url = '/discussions'
    } else if ( faneditsRegex.test(url) ) {
      url = '/discussion/Fan-Edits-and-Projects-for-Other-Properties/id/11'
      statusCode = 302
    } else {
      url = url.replace(/\/forum/i, '')
      template = url.replace(regexp, '$1')

      switch ( template ) {
        case 'index':
          url = app.config.comitium.baseUrl
          break
        case 'topic':
          url = url.replace('/topic/', '/id/')
          url = url.replace('topic.cfm', 'topic')

          // Announcements
          regexp = new RegExp(/(.*)\/forum\/[0-9]+[/]?(.*)/)
          if ( regexp.test(url) ) {
            url = url.replace('/topic/', '/announcement/')
            url = url.replace(regexp, '$1/$2')
          }

          // Posts
          regexp = new RegExp(/.*\/post\/([0-9]+)[/]?.*/)
          if ( regexp.test(url) ) {
            url = url.replace(regexp, '/post/id/$1')
          }
          break
        case 'forum':
          url = url.replace('forum.cfm', 'discussion')

          switch ( params.url.forum ) {
            case '2':
              url = url.replace(/(.*)\/forum\/([0-9]+)[/]?.*/, '$1/id/22')
              break
            case '7':
              url = '/announcements'
              break
            case '14':
              url = url.replace(/(.*)\/forum\/([0-9]+)[/]?.*/, '$1/id/5')
              break
            case '15':
              url = '/discussion/Feedback-Forum/id/5'
              break
            default:
              url = url.replace(/(.*)\/forum\/([0-9]+)[/]?.*/, '$1/id/$2')
          }
          break
        case 'category':
          url = '/discussions'
          break
        case 'user-profile':
          url = url.replace(/(.*)\/user\/([0-9]+)[/]?.*/, '$1/id/$2')
          url = url.replace('user-profile.cfm', 'user')
          break
        case 'login':
          url = '/sign-in'
          break
        case 'categories':
          regexp = new RegExp(/.*categories\.cfm\?catid=([0-9]+)/)
          if ( regexp.test(url) ) {
            discussionID = querystring.parse(params.route.parsed.query).catid
            if ( discussionID == 2 ) {
              discussionID = 22
            }
            url = '/discussion/id/' + discussionID
          }
          break
        case 'messageview':
          regexp = new RegExp(/.*messageview\.cfm\?.*threadid=([0-9]+)/)
          if ( regexp.test(url) ) {
            url = url.replace(regexp, '/topic/id/$1')
            url = url.replace(/&STARTPAGE=([0-9]+)/i, '/page/$1')
          }
          break
        case 'create-an-account':
          url = '/register'
          break
        case 'password-request':
          url = '/password-reset'
          break
        case 'about':
          url = 'content/About/id/1'
          break
        case 'help':
          url = 'content/Help/id/2'
          break
        case 'user-lists':
          url = '/discussions'
          statusCode = 302
          break
        case 'contact':
          url = '/contact'
          break
        case 'terms-of-service':
        case 'privacy-policy':
          url = 'content/Terms-of-Service/id/3'
          break
      }

      // Get rid of the trailing slash
      regexp = new RegExp(/(.*)\/$/)
      if ( regexp.test(url) ) {
        url = url.replace(regexp, '$1')
      }

    }

    return {
      redirect: {
        url: url,
        statusCode: statusCode
      }
    }
  }
}
