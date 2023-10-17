// user model

import { writeFile } from 'fs/promises'


export const activate = async (args) => {
  if ( !args.id || !args.activationCode ) {
    return {
      success: false,
      message: 'The activation link you requested isn\'t valid. Try copying it from your activation e-mail and pasting it into your browser\'s address bar. If you continue to have problems, please contact us for help.'
    }
  } else {
    let activationStatus = await app.models.user.activationStatus({ id: args.id, activationCode: args.activationCode })

    // If the account isn't activated, activate it
    if ( activationStatus.userExists && !activationStatus.activated && activationStatus.activationCode === args.activationCode ) {
      const client = await app.toolbox.dbPool.connect()
    
      try {
        await client.query({
          name: 'user_activate',
          text: 'update users set activated = true where id = $1 and activation_code = $2',
          values: [ args.id, args.activationCode ]
        })

        // Create the user's avatar if they're activating their account for the first time.
        if ( !args.reactivation ) {
          await writeFile(app.config.citizen.directories.web + '/avatars/' + args.id + '.jpg', app.resources.images.defaultAvatar)
        }

        // Clear the member cache
        app.cache.clear({ scope: 'members' })
    
        return {
          success: true,
          message: 'Your account has been activated! You can now sign in.'
        }
      } finally {
        client.release()
      }
    } else {
      if ( !activationStatus.userExists ) {
        return {
          success: false,
          reason: 'userDoesNotExist',
          message: 'The account you\'re trying to activate doesn\'t exist. Please contact us for help.'
        }
      } else if ( activationStatus.activated ) {
        return {
          success: false,
          reason: 'accountAlreadyActivated',
          message: 'This account has already been activated, so you\'re free to sign in below. If you\'re having trouble signing in, try resetting your password. If that doesn\'t work, please let us know.'
        }
      } else if ( activationStatus.activationCode !== args.activationCode ) {
        return {
          success: false,
          reason: 'invalidActivationCode',
          message: 'Your activation code is invalid. Please contact us for help.'
        }
      }
    }
  }
}


export const activationStatus = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_activationStatus',
      text: 'select id, activated, activation_code from users where id = $1',
      values: [ args.id ]
    })

    if ( result.rows.length ) {
      return {
        userExists: true,
        id: result.rows[0].id,
        activationCode: result.rows[0].activation_code,
        activated: result.rows[0].activated
      }
    } else {
      return {
        userExists: false
      }
    }
  } finally {
    client.release()
  }
}


export const activityUpdate = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_activityUpdate',
      text: 'update users set last_activity = $1 where id = $2;',
      values: [ args.time || app.toolbox.helpers.isoDate(), args.userID ]
    })

    return result.rows
  } finally {
    client.release()
  }
}


export const authenticate = async (credentials) => {
  let email = '',
      password = '',
      usernameHash = ''

  if ( credentials.email ) {
    email = credentials.email.trim()
    password = credentials.password || ''
    password = password.trim()
  } else if ( credentials.usernameHash ) {
    usernameHash = credentials.usernameHash || ''
    usernameHash = usernameHash.trim()
  }

  if ( !usernameHash.length && ( !email.length || !password.length ) ) {
    return {
      success: false,
      reason: 'requiredFieldsEmpty',
      message: 'All fields are required.'
    }
  } else if ( !usernameHash.length && app.toolbox.validate.email(email) === false ) {
    return {
      success: false,
      reason: 'invalidEmail',
      message: 'That doesn\'t seem to be a properly formatted e-mail address. Did you enter your username by mistake?'
    }
  } else {
    let user
    if ( usernameHash.length ) {
      user = await info({ usernameHash: usernameHash })
    } else if ( email.length ) {
      user = await info({ email: email })
    }
    let compareHash = password.length && user && user.password_hash ? await app.toolbox.helpers.compareHash(password, user.password_hash) : false

    if ( user ) {
      if ( user.activated ) {
        if ( user.login ) {
          if ( usernameHash.length || compareHash === true ) {
            await activityUpdate({ userID: user.id })
            return {
              success: true,
              message: 'Cookies are set.',
              user: user
            }
          } else {
            return {
              success: false,
              reason: 'passwordMismatch',
              message: 'We\'re fluent in over 6 million forms of communication...but we don\'t recognize that password.'
            }
          }
        } else {
          return {
            success: false,
            reason: 'banned',
            message: 'This account has had its login privileges revoked.'
          }
        }
      } else {
        return {
          success: false,
          reason: 'notActivated',
          message: 'This account is awaiting activation. Did you follow the instructions in your welcome e-mail to activate your account? If you\'ve activated your account and you\'re still getting this message, please contact an administrator for assistance.'
        }
      }
    } else {
      return {
        success: false,
        reason: 'noRecord',
        message: 'The credentials you entered don\'t match our records.'
      }
    }
  }
}


export const ban = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'user_ban',
      text: 'update users set group_id = ( select id from groups where name = \'Banned Members\' ), signature = null, signature_html = null, website = null where id = $1;',
      values: [ args.userID ]
    })

    app.cache.clear({ scope: 'user-' + args.userID })
  } finally {
    client.release()
  }
}


export const liftBan = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'user_liftBan',
      text: 'update users set group_id = ( select id from groups where name = \'Members\' ) where id = $1;',
      values: [ args.userID ]
    })

    app.cache.clear({ scope: 'user-' + args.userID })
  } finally {
    client.release()
  }
}


export const banIP = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const banned = await client.query('select ip from banned_ip_addresses where ip = $1;', [ args.ip ])
    if ( !banned.rowCount ) {
      await client.query(
        'insert into banned_ip_addresses ( ip, admin_user_id, time ) values ( $1, $2, $3 );',
        [ args.ip, args.adminUserID, args.time ])
      // Clear the cached data
      app.cache.clear({ scope: 'logs', key: 'bannedIPs' })
    }
  } finally {
    client.release()
  }
}


export const bannedIPs = async () => {
  // See if already cached
  var cacheKey  = 'bannedIPs',
      scope     = 'logs',
      cached    = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'user_bannedIPs',
        text: 'select id, ip, admin_user_id, time from banned_ip_addresses order by time asc;'
      })

      result.rows.forEach( function (item, index) {
        result.rows[index] = item.ip.replace('/32', '')
      })

      // Cache the result for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: result.rows
        })
      }

      return result.rows
    } finally {
      client.release()
    }
  }
}


export const create = async (args) => {
  let username  = args.username.trim(),
      email     = args.email.trim(),
      password  = args.password.trim(),
      tos       = args.tos || false

  // Defeat attempts to mimic a username with extra internal spaces
  while ( username.search(/\s\s/) >= 0 ) {
    username = username.replace(/\s{2,30}/g, ' ')
  }

  if ( !username.length || !password.length || !email.length || !tos ) {
    return failed('requiredFieldsEmpty')
  } else if ( app.toolbox.validate.username(username) === false ) {
    return failed('invalidUsername')
  } else if ( app.toolbox.validate.email(email) === false ) {
    return failed('invalidEmail')
  } else if ( app.toolbox.validate.password(password) === false ) {
    return failed('invalidPassword')
  } else {
    let [
      userExists,
      emailExists
    ] = await Promise.all([
      app.models.user.exists({ username: username }),
      app.models.user.emailExists({ email: email })
    ])

    if ( userExists ) {
      return failed('userExists')
    } else if ( emailExists ) {
      return failed('emailExists')
    } else {
      let url = app.toolbox.slug(username),
          time = app.toolbox.helpers.isoDate(),
          activationCode = app.toolbox.helpers.activationCode()

      let [
        usernameHash,
        passwordHash
      ] = await Promise.all([
        app.toolbox.helpers.hash(username),
        app.toolbox.helpers.hash(password)
      ])

      let user = await insert({
        // New members will eventually go into groupID 2 (New Members).
        // Until new member logic is in place, new members are Members.
        groupID: 3,
        username: username,
        usernameHash: usernameHash,
        passwordHash: passwordHash,
        url: url,
        email: email,
        timezone: 'GMT',
        dateFormat: 'mmmm d, yyyy',
        theme: 'Default',
        lastActivity: time,
        joined: time,
        privateTopicEmailNotification: true,
        subscriptionEmailNotification: true,
        activated: false,
        activationCode: activationCode,
        system: false,
        locked: false
      })

      return {
        success: true,
        message: 'Your account has been created. You need to activate it before you can post, so please check your e-mail for your activation instructions.',
        username: username,
        url: url,
        id: user.id,
        email: email,
        activationCode: activationCode
      }
    }
  }

  function failed(reason) {
    var output = {
          success: false,
          reason: reason
        }

    switch ( reason ) {
      case 'requiredFieldsEmpty':
        output.message = 'All fields are required.'
        break
      case 'userExists':
        output.message = 'The username you requested already exists.'
        break
      case 'emailExists':
        output.message = 'The e-mail address you provided is already in use. Are you sure you don\'t have an account? You can <a href="password-reset">reset your password</a> if so.'
        break
      case 'invalidUsername':
        output.message = 'Your username must be 30 characters or less and may not contain the following: @ : ! < > ( ) [ ]'
        break
      case 'invalidEmail':
        output.message = 'The e-mail address you provided isn\'t valid.'
        break
      case 'invalidPassword':
        output.message = 'Your password doesn\'t meet the minimum requirements (between 8 and 50 characters, anything but spaces).'
        break
      default:
        output.message = 'An unspecified error occurred. Please try again later.'
    }

    return output
  }
}


export const emailExists = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_emailExists',
      // Use lower() so e-mail checks are case-insensitive
      text: 'select email from users where lower(email) = lower($1)',
      values: [ args.email ]
    })

    if ( result.rows.length ) {
      return true
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


export const exists = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_exists',
      // Use lower() so username checks are case-insensitive
      text: 'select id from users where lower(username) = lower($1)',
      values: [ args.username ]
    })

    if ( result.rows.length ) {
      return true
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


export const info = async (args) => {
  let sql, arg

  if ( args.userID ) {
    sql = 'select u.id, u.group_id, u.username, u.username_hash, u.password_hash, u.url, u.email, u.timezone, u.date_format, u.theme, u.signature, u.signature_html, u.last_activity, u.joined, u.website, u.private_topic_email_notification, u.subscription_email_notification, u.activated, u.activation_code, u.system, u.locked, g.name as group, g.login, g.post, g.reply, g.talk_privately, g.moderate_discussions, g.administrate_discussions, g.moderate_users, g.administrate_users, g.administrate_app, g.bypass_lockdown from users u join groups g on u.group_id = g.id where u.id = $1'
    arg = args.userID
  } else if ( args.username ) {
    sql = 'select u.id, u.group_id, u.username, u.username_hash, u.password_hash, u.url, u.email, u.timezone, u.date_format, u.theme, u.signature, u.signature_html, u.last_activity, u.joined, u.website, u.private_topic_email_notification, u.subscription_email_notification, u.activated, u.activation_code, u.system, u.locked, g.name as group, g.login, g.post, g.reply, g.talk_privately, g.moderate_discussions, g.administrate_discussions, g.moderate_users, g.administrate_users, g.administrate_app, g.bypass_lockdown from users u join groups g on u.group_id = g.id where lower(u.username) = lower($1)'
    arg = args.username
  } else if ( args.usernameHash ) {
    sql = 'select u.id, u.group_id, u.username, u.username_hash, u.password_hash, u.url, u.email, u.timezone, u.date_format, u.theme, u.signature, u.signature_html, u.last_activity, u.joined, u.website, u.private_topic_email_notification, u.subscription_email_notification, u.activated, u.activation_code, u.system, u.locked, g.name as group, g.login, g.post, g.reply, g.talk_privately, g.moderate_discussions, g.administrate_discussions, g.moderate_users, g.administrate_users, g.administrate_app, g.bypass_lockdown from users u join groups g on u.group_id = g.id where lower(u.username_hash) = lower($1)'
    arg = args.usernameHash
  } else if ( args.email ) {
    sql = 'select u.id, u.group_id, u.username, u.username_hash, u.password_hash, u.url, u.email, u.timezone, u.date_format, u.theme, u.signature, u.signature_html, u.last_activity, u.joined, u.website, u.private_topic_email_notification, u.subscription_email_notification, u.activated, u.activation_code, u.system, u.locked, g.name as group, g.login, g.post, g.reply, g.talk_privately, g.moderate_discussions, g.administrate_discussions, g.moderate_users, g.administrate_users, g.administrate_app, g.bypass_lockdown from users u join groups g on u.group_id = g.id where lower(u.email) = lower($1)'
    arg = args.email
  }

  if ( sql.length ) {
    const client = await app.toolbox.dbPool.connect()
    
    try {
      const result = await client.query({
        text: sql,
        values: [ arg ]
      })

      if ( result.rows.length ) {
        result.rows[0].joined_formatted = app.toolbox.moment.tz(result.rows[0].joined, 'America/New_York').format('D-MMM-YYYY')
        result.rows[0].last_activity_formatted = app.toolbox.moment.tz(result.rows[0].last_activity, 'America/New_York').format('D-MMM-YYYY')
        return result.rows[0]
      } else {
        return false
      }
    } finally {
      client.release()
    }
  } else {
    throw new Error('Error in user model: no argument specified.')
  }
}


export const insert = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_insert',
      text: 'insert into users ( group_id, username, username_hash, password_hash, url, email, timezone, date_format, theme, last_activity, joined, private_topic_email_notification, subscription_email_notification, activated, activation_code, system, locked ) values ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17 ) returning id;',
      values: [ args.groupID, args.username, args.usernameHash, args.passwordHash, args.url, args.email, args.timezone, args.dateFormat, args.theme, args.lastActivity, args.joined, args.privateTopicEmailNotification, args.subscriptionEmailNotification, args.activated, args.activationCode, args.system, args.locked ]
    })

    return {
      id: result.rows[0].id
    }
  } finally {
    client.release()
  }
}


export const ipHistory = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_ipHistory',
      text: 'select min(id) as id, ip, max(time) as time from user_logs where user_id = $1 group by ip order by time desc;',
      values: [ args.userID ]
    })

    if ( result.rows.length ) {
      result.rows.forEach( function (item, index, array) {
        array[index].ip = array[index].ip.replace('/32', '')
      })
      return result.rows
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


export const log = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_log',
      text: 'insert into user_logs ( user_id, action, ip, time ) values ( $1, $2, $3, $4 ) returning id;',
      values: [ args.userID, args.action, args.ip, app.toolbox.helpers.isoDate() ]
    })

    return result.rows
  } finally {
    client.release()
  }
}


export const logByID = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_logByID',
      text: 'select id, user_id, action, ip, time from user_logs where id = $1;',
      values: [ args.logID ]
    })

    return result.rows[0]
  } finally {
    client.release()
  }
}


export const metaData = async (args) => {
  let userInfo = await info({ userID: args.userID })

  return {
    title: 'User Profile: ' + userInfo.username + ' - Original Trilogy',
    description: userInfo.username + ' has been a member since ' + userInfo.joined + '.',
    keywords: ''
  }
}


export const passwordResetInsert = async (args) => {
  let verificationCode = Math.random().toString().replace('0.', '') + Math.random().toString().replace('0.', '')
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'user_passwordResetInsert',
      text: 'insert into password_reset ( user_id, verification_code, time ) values ( $1, $2, $3 );',
      values: [ args.userID, verificationCode, app.toolbox.helpers.isoDate() ]
    })

    return {
      verificationCode: verificationCode
    }
  } finally {
    client.release()
  }
}


export const passwordResetVerify = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_passwordResetVerify',
      text: 'select user_id, verification_code, time from password_reset where user_id = $1 and verification_code = $2;',
      values: [ args.userID, args.verificationCode ]
    })

    if ( result.rows.length ) {
      return result.rows[0]
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


export const posts = async (args) => {
  // See if already cached
  let start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'models-user-posts-subset-' + start + '-' + end + '-visitorGroupID-' + args.visitorGroupID,
      scope = 'user-' + args.userID,
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'user_posts',
        text: 'select p.id, p.topic_id, p.html, p.created, p.modified, p.editor_id, p.locked_by_id, p.lock_reason, t.title_html as topic_title, t.url as topic_url, t.replies as topic_replies, u.username as author, u.url as author_url ' +
        'from posts p ' +
        'join topics t on p.topic_id = t.id ' +
        'join users u on p.user_id = u.id ' +
        // Only grab public posts, not posts from private topics!
        'where u.id = $1 and p.draft = false and t.discussion_id in ( select discussion_id from discussion_permissions where group_id = $2 and read = true ) ' +
        'order by p.created desc ' +
        'limit $3 offset $4;',
        values: [ args.userID, args.visitorGroupID, end - start, start ]
      })

      result.rows.forEach( function (item) {
        item.created_formatted   = app.toolbox.moment.tz(item.created, 'America/New_York').format('D-MMM-YYYY h:mm A')
        item.modified_formatted  = app.toolbox.moment.tz(item.modified, 'America/New_York').format('D-MMM-YYYY h:mm A')
      })

      // Cache the result for future requests
      if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
        app.cache.set({
          key: cacheKey,
          scope: scope,
          value: result.rows
        })
      }

      return result.rows
    } finally {
      client.release()
    }
  }
}


export const replies = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_replies',
      text: 'select p.id, p.created from posts p ' +
      'join topics t on t.id = p.topic_id ' +
      // Public posts only (no private posts, no Trash)
      'where p.user_id = $1 and t.discussion_id > 1 and p.created <> t.created;',
      values: [ args.userID ]
    })

    result.rows.forEach( function (item) {
      item.created_formatted   = app.toolbox.moment.tz(item.created, 'America/New_York').format('D-MMM-YYYY h:mm A')
    })

    if ( result.rows.length ) {
      return result.rows
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


export const profileByID = async (args) => {
  // See if already cached
  let cacheKey = 'profileByID-visitorGroupID-' + args.visitorGroupID,
      scope = 'user-' + args.userID,
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'user_profileByID',
        text: 'select u.id, u.group_id, u.username, u.url, u.signature_html, u.last_activity, u.joined, u.website, g.name as group, ( select count(*) from posts p join topics t on p.topic_id = t.id where user_id = $1 and t.draft = false and p.draft = false and t.discussion_id in ( select discussion_id from discussion_permissions where group_id = $2 and read = true ) ) as post_count from users u join groups g on u.group_id = g.id where u.id = $1',
        values: [ args.userID, args.visitorGroupID ]
      })

      if ( result.rows && result.rows.length ) {
        result.rows[0].joined_formatted        = app.toolbox.moment.tz(result.rows[0].joined, 'America/New_York').format('D-MMM-YYYY')
        result.rows[0].last_activity_formatted = app.toolbox.moment.tz(result.rows[0].last_activity, 'America/New_York').format('D-MMM-YYYY')

        // Cache the result for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: result.rows[0]
          })
        }

        return result.rows[0]
      } else {
        return false
      }
    } finally {
      client.release()
    }
  }
}


export const matchingUsersByIP = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_matchingUsersByIP',
      text: 'select u.id, u.username, u.url, ul.ip, max(ul.time) as time from users u join user_logs ul on u.id = ul.user_id where ul.ip = ( select ip from user_logs where id = $1 ) group by u.id, ul.ip order by time desc;',
      values: [ args.logID ]
    })

    if ( result.rows.length ) {
      result.rows.forEach( function (item, index, array) {
        array[index].ip = array[index].ip.replace('/32', '')
        array[index].time_formatted = app.toolbox.moment.tz(array[index].time, 'America/New_York').format('D-MMM-YYYY h:mm A')
      })
      return result.rows
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


export const topics = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_topics',
      text: 'select t.id, t.title_html, t.url, p.created as post_date ' +
      'from topics t ' +
      'join posts p on p.id = ( select id from posts where topic_id = t.id and draft = false order by created asc limit 1 ) ' +
      'join users u on u.id = p.user_id ' +
      'where u.id = $1 ' +
      'and t.discussion_id <> 1 and t.draft = false and t.private = false ' +
      'order by p.created asc;',
      values: [ args.userID ]
    })

    result.rows.forEach( function (item) {
      item.post_date_formatted = app.toolbox.moment.tz(item.post_date, 'America/New_York').format('D-MMM-YYYY')
    })

    if ( result.rows.length ) {
      return result.rows
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


export const cleanup = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query('begin')
    // Move this user's topics to the trash
    await client.query(
      'update topics set discussion_id = 1 where id in ( ' +
        'select t.id from topics t ' +
        'join posts p on p.id = ( select id from posts where topic_id = t.id and draft = false order by created asc limit 1 ) ' +
        'join users u on u.id = p.user_id ' +
        'where u.id = $1 and t.private = false' +
      ');',
      [ args.userID ])
    // Permanently delete this user's replies in any other topics
    if ( args.deleteReplies ) {
      await client.query(
        'delete from posts where id in ( ' +
          'select p.id from posts p ' +
          'join topics t on t.id = p.topic_id ' +
          'where p.user_id = $1 and t.discussion_id > 1 and p.created <> t.created' +
        ');',
        [ args.userID ])
    }
    // Update the last post across all discussions
    await client.query(
      'update discussions d set last_post_id = ( ' +
        'select p.id from posts p ' +
        'join topics t on p.topic_id = t.id ' +
        'where t.id = p.topic_id and t.discussion_id = d.id ' +
        'order by p.created desc limit 1 ' +
      ');',
      )
    await client.query('commit')

    // Clear the cache
    app.cache.clear()
  } catch (err) {
    await client.query('rollback')
    throw err
  } finally {
    client.release()
  }
}


export const topicViewTimes = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      text: 'select topic_id, time from topic_views where user_id = $1 and topic_id in ( ' + args.topicID + ' );',
      values: [ args.userID ]
    })

    if ( result.rows.length ) {
      return result.rows
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


export const updateEmail = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_updateEmail',
      text: 'update users set email = $1, activated = false, activation_code = $3 where id = $2;',
      values: [ args.email, args.userID, args.activationCode ]
    })

    return result.rows
  } finally {
    client.release()
  }
}


export const updatePassword = async (args) => {
  let passwordHash = await app.toolbox.helpers.hash(args.password)

  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_updatePassword',
      text: 'update users set password_hash = $1 where id = $2;',
      values: [ passwordHash, args.userID ]
    })

    return result.rows
  } finally {
    client.release()
  }
}


export const updateSettings = async (args) => {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_updateSettings',
      text: 'update users set signature = $1, signature_html = $2, timezone = $3, theme = $4, website = $5, subscription_email_notification = $6, private_topic_email_notification = $7 where id = $8;',
      values: [ args.signature, args.signatureHtml, args.timezone, args.theme, args.website, args.subscriptionEmailNotification, args.privateTopicEmailNotification, args.userID ]
    })

    return result.rows
  } finally {
    client.release()
  }
}
