// user model

'use strict'

const writeFile = require('util').promisify(require('fs').writeFile)

module.exports = {
  activate: activate,
  activationStatus: activationStatus,
  activityUpdate: activityUpdate,
  authenticate: authenticate,
  ban: ban,
  banIP: banIP,
  bannedIPs: bannedIPs,
  create: create,
  emailExists: emailExists,
  exists: exists,
  info: info,
  insert: insert,
  ipHistory: ipHistory,
  liftBan: liftBan,
  log: log,
  logByID: logByID,
  matchingUsersByIP: matchingUsersByIP,
  metaData: metaData,
  passwordResetInsert: passwordResetInsert,
  passwordResetVerify: passwordResetVerify,
  posts: posts,
  profileByID: profileByID,
  profileByUsername: profileByUsername,
  topicViewTimes: topicViewTimes,
  updateEmail: updateEmail,
  updatePassword: updatePassword,
  updateSettings: updateSettings
}


async function activate(args) {
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
          text: 'update users set "activated" = true where id = $1 and "activationCode" = $2',
          values: [ args.id, args.activationCode ]
        })

        // Create the user's avatar if they're activating their account for the first time.
        if ( !args.reactivation ) {
          await writeFile(app.config.citizen.directories.web + '/avatars/' + args.id + '.jpg', app.resources.images.defaultAvatar)
        }
    
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


async function activationStatus(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_activationStatus',
      text: 'select "id", "activated", "activationCode" from "users" where "id" = $1',
      values: [ args.id ]
    })

    if ( result.rows.length ) {
      return {
        userExists: true,
        id: result.rows[0].id,
        activationCode: result.rows[0].activationCode,
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


async function activityUpdate(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_activityUpdate',
      text: 'update "users" set "lastActivity" = $1 where "id" = $2;',
      values: [ args.time || app.toolbox.helpers.isoDate(), args.userID ]
    })

    return result.rows
  } finally {
    client.release()
  }
}


async function authenticate(credentials) {
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
    let compareHash = password.length && user && user.passwordHash ? await app.toolbox.helpers.compareHash(password, user.passwordHash) : false

    if ( user ) {
      if ( user.activated ) {
        if ( user.login ) {
          if ( usernameHash.length || compareHash === true ) {
            await this.activityUpdate({ userID: user.id })
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


async function ban(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'user_ban',
      text: 'update "users" set "groupID" = ( select "id" from "groups" where "name" = \'Banned Members\' ), signature = null, "signatureHtml" = null, website = null where "id" = $1;',
      values: [ args.userID ]
    })

    app.cache.clear({ scope: 'user-' + args.userID })
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}


async function liftBan(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'user_liftBat',
      text: 'update "users" set "groupID" = ( select "id" from "groups" where "name" = \'Trusted Members\' ) where "id" = $1;',
      values: [ args.userID ]
    })

    app.cache.clear({ scope: 'user-' + args.userID })
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}


async function banIP(args) {
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
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}


async function bannedIPs() {
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


async function create(args) {
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
        // Until new member logic is in place, new members are Trusted Members.
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


async function emailExists(args) {
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


async function exists(args) {
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


async function info(args) {
  let sql, arg

  if ( args.userID ) {
    sql = 'select u."id", u."groupID", u."username", u."usernameHash", u."passwordHash", u."url", u."email", u."timezone", u."dateFormat", u."theme", u."signature", u."signatureHtml", u."lastActivity", u."joined", u."website", u."privateTopicEmailNotification", u."subscriptionEmailNotification", u."activated", u."activationCode", u."system", u."locked", g."name" as "group", g."login", g."post", g."reply", g."talkPrivately", g."moderateDiscussions", g."administrateDiscussions", g."moderateUsers", g."administrateUsers", g."administrateApp", g."bypassLockdown" from "users" u join "groups" g on u."groupID" = g."id" where u."id" = $1'
    arg = args.userID
  } else if ( args.username ) {
    sql = 'select u."id", u."groupID", u."username", u."usernameHash", u."passwordHash", u."url", u."email", u."timezone", u."dateFormat", u."theme", u."signature", u."signatureHtml", u."lastActivity", u."joined", u."website", u."privateTopicEmailNotification", u."subscriptionEmailNotification", u."activated", u."activationCode", u."system", u."locked", g."name" as "group", g."login", g."post", g."reply", g."talkPrivately", g."moderateDiscussions", g."administrateDiscussions", g."moderateUsers", g."administrateUsers", g."administrateApp", g."bypassLockdown" from "users" u join "groups" g on u."groupID" = g."id" where lower(u."username") = lower($1)'
    arg = args.username
  } else if ( args.usernameHash ) {
    sql = 'select u."id", u."groupID", u."username", u."usernameHash", u."passwordHash", u."url", u."email", u."timezone", u."dateFormat", u."theme", u."signature", u."signatureHtml", u."lastActivity", u."joined", u."website", u."privateTopicEmailNotification", u."subscriptionEmailNotification", u."activated", u."activationCode", u."system", u."locked", g."name" as "group", g."login", g."post", g."reply", g."talkPrivately", g."moderateDiscussions", g."administrateDiscussions", g."moderateUsers", g."administrateUsers", g."administrateApp", g."bypassLockdown" from "users" u join "groups" g on u."groupID" = g."id" where lower(u."usernameHash") = lower($1)'
    arg = args.usernameHash
  } else if ( args.email ) {
    sql = 'select u."id", u."groupID", u."username", u."usernameHash", u."passwordHash", u."url", u."email", u."timezone", u."dateFormat", u."theme", u."signature", u."signatureHtml", u."lastActivity", u."joined", u."website", u."privateTopicEmailNotification", u."subscriptionEmailNotification", u."activated", u."activationCode", u."system", u."locked", g."name" as "group", g."login", g."post", g."reply", g."talkPrivately", g."moderateDiscussions", g."administrateDiscussions", g."moderateUsers", g."administrateUsers", g."administrateApp", g."bypassLockdown" from "users" u join "groups" g on u."groupID" = g."id" where lower(u."email") = lower($1)'
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
        result.rows[0].joinedFormatted = app.toolbox.moment.tz(result.rows[0].joined, 'America/New_York').format('D-MMM-YYYY')
        result.rows[0].lastActivityFormatted = app.toolbox.moment.tz(result.rows[0].lastActivity, 'America/New_York').format('D-MMM-YYYY')
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


async function insert(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_insert',
      text: 'insert into "users" ( "groupID", "username", "usernameHash", "passwordHash", "url", "email", "timezone", "dateFormat", "theme", "lastActivity", "joined", "privateTopicEmailNotification", "subscriptionEmailNotification", "activated", "activationCode", "system", "locked" ) values ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17 ) returning id;',
      values: [ args.groupID, args.username, args.usernameHash, args.passwordHash, args.url, args.email, args.timezone, args.dateFormat, args.theme, args.lastActivity, args.joined, args.privateTopicEmailNotification, args.subscriptionEmailNotification, args.activated, args.activationCode, args.system, args.locked ]
    })

    return {
      id: result.rows[0].id
    }
  } finally {
    client.release()
  }
}


async function ipHistory(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_ipHistory',
      text: 'select min(id) as id, ip, max(time) as time from "userLogs" where "userID" = $1 group by ip order by time desc;',
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


async function log(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_log',
      text: 'insert into "userLogs" ( "userID", "action", "ip", "time" ) values ( $1, $2, $3, $4 ) returning id;',
      values: [ args.userID, args.action, args.ip, app.toolbox.helpers.isoDate() ]
    })

    return result.rows
  } finally {
    client.release()
  }
}


async function logByID(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_logByID',
      text: 'select id, "userID", action, ip, time from "userLogs" where id = $1;',
      values: [ args.logID ]
    })

    return result.rows[0]
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}


async function metaData(args) {
  let info = await this.info({ userID: args.userID })

  return {
    title: 'User Profile: ' + info.username + ' - Original Trilogy',
    description: info.username + ' has been a member since ' + info.joined + '.',
    keywords: ''
  }
}


async function passwordResetInsert(args) {
  let verificationCode = Math.random().toString().replace('0.', '') + Math.random().toString().replace('0.', '')
  const client = await app.toolbox.dbPool.connect()

  try {
    await client.query({
      name: 'user_passwordResetInsert',
      text: 'insert into "passwordReset" ( "userID", "verificationCode", "time" ) values ( $1, $2, $3 );',
      values: [ args.userID, verificationCode, app.toolbox.helpers.isoDate() ]
    })

    return {
      verificationCode: verificationCode
    }
  } finally {
    client.release()
  }
}


async function passwordResetVerify(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_passwordResetVerify',
      text: 'select "userID", "verificationCode", "time" from "passwordReset" where "userID" = $1 and "verificationCode" = $2;',
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


async function posts(args) {
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
        text: 'select p."id", p."topicID", p."html", p."created", p."modified", p."editorID", p."lockedByID", p."lockReason", t."titleHtml" as "topicTitle", t."url" as "topicUrl", t.replies as "topicReplies", u."username" as "author", u."url" as "authorUrl" ' +
        'from posts p ' +
        'join topics t on p."topicID" = t."id" ' +
        'join users u on p."userID" = u.id ' +
        // Only grab public posts, not posts from private topics!
        'where u."id" = $1 and p."draft" = false and t."discussionID" in ( select "discussionID" from "discussionPermissions" where "groupID" = $2 and "read" = true ) ' +
        'order by p."created" desc ' +
        'limit $3 offset $4;',
        values: [ args.userID, args.visitorGroupID, end - start, start ]
      })

      result.rows.forEach( function (item) {
        item.createdFormatted   = app.toolbox.moment.tz(item.created, 'America/New_York').format('D-MMM-YYYY h:mm A')
        item.modifiedFormatted  = app.toolbox.moment.tz(item.modified, 'America/New_York').format('D-MMM-YYYY h:mm A')
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


async function profileByID(args) {
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
        text: 'select u."id", u."groupID", u."username", u."url", u."signatureHtml", u."lastActivity", u."joined", u."website", g."name" as "group", ( select count(*) from "posts" p join topics t on p."topicID" = t."id" where "userID" = $1 and t.draft = false and p."draft" = false and t."discussionID" in ( select "discussionID" from "discussionPermissions" where "groupID" = $2 and "read" = true ) ) as "postCount" from "users" u join "groups" g on u."groupID" = g."id" where u."id" = $1',
        values: [ args.userID, args.visitorGroupID ]
      })

      if ( result.rows && result.rows.length ) {
        result.rows[0].joinedFormatted        = app.toolbox.moment.tz(result.rows[0].joined, 'America/New_York').format('D-MMM-YYYY')
        result.rows[0].lastActivityFormatted  = app.toolbox.moment.tz(result.rows[0].lastActivity, 'America/New_York').format('D-MMM-YYYY')

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


async function profileByUsername(args) {
  // See if already cached
  let cacheKey = 'profileByUsername-user-' + args.userID,
      scope = 'user',
      cached = app.cache.get({ scope: scope, key: cacheKey })

  // If it's cached, return the cache item
  if ( cached ) {
    return cached
  // If it's not cached, retrieve it from the database and cache it
  } else {
    const client = await app.toolbox.dbPool.connect()

    try {
      const result = await client.query({
        name: 'user_profileByUsername',
        text: 'select u."id", u."groupID", u."username", u."url", u."signatureHtml", u."lastActivity", u."joined", u."website", g."name" as "group", ( select count("id") from "posts" where "userID" = $1 and "draft" = false ) as "postCount" from "users" u join "groups" g on u."groupID" = g."id" where u."username" = $1',
        values: [ args.username ]
      })

      if ( result.rows && result.rows.length ) {
        result.rows[0].joinedFormatted        = app.toolbox.moment.tz(result.rows[0].joined, 'America/New_York').format('D-MMM-YYYY')
        result.rows[0].lastActivityFormatted  = app.toolbox.moment.tz(result.rows[0].lastActivity, 'America/New_York').format('D-MMM-YYYY')

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


async function matchingUsersByIP(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_matchingUsersByIP',
      text: 'select u.id, u.username, u.url, ul.ip, max(ul.time) as time from users u join "userLogs" ul on u.id = ul."userID" where ul.ip = ( select ip from "userLogs" where id = $1 ) group by u.id, ul.ip order by time desc;',
      values: [ args.logID ]
    })

    if ( result.rows.length ) {
      result.rows.forEach( function (item, index, array) {
        array[index].ip = array[index].ip.replace('/32', '')
        array[index].timeFormatted = app.toolbox.moment.tz(array[index].time, 'America/New_York').format('D-MMM-YYYY h:mm A')
      })
      return result.rows
    } else {
      return false
    }
  } finally {
    client.release()
  }
}


async function topicViewTimes(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      text: 'select "topicID", "time" from "topicViews" where "userID" = $1 and "topicID" in ( ' + args.topicID + ' );',
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


async function updateEmail(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_updateEmail',
      text: 'update "users" set "email" = $1, "activated" = false, "activationCode" = $3 where "id" = $2;',
      values: [ args.email, args.userID, args.activationCode ]
    })

    return result.rows
  } finally {
    client.release()
  }
}


async function updatePassword(args) {
  let passwordHash = await app.toolbox.helpers.hash(args.password)

  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_updatePassword',
      text: 'update "users" set "passwordHash" = $1 where "id" = $2;',
      values: [ passwordHash, args.userID ]
    })

    return result.rows
  } finally {
    client.release()
  }
}


async function updateSettings(args) {
  const client = await app.toolbox.dbPool.connect()

  try {
    const result = await client.query({
      name: 'user_updateSettings',
      text: 'update "users" set "signature" = $1, "signatureHtml" = $2, "timezone" = $3, "theme" = $4, "website" = $5, "subscriptionEmailNotification" = $6, "privateTopicEmailNotification" = $7 where "id" = $8;',
      values: [ args.signature, args.signatureHtml, args.timezone, args.theme, args.website, args.subscriptionEmailNotification, args.privateTopicEmailNotification, args.userID ]
    })

    return result.rows
  } finally {
    client.release()
  }
}
