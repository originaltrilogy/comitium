// password-reset controller

'use strict'

module.exports = {
  handler           : handler,
  form              : form,
  confirmation      : confirmation,
  reset             : reset,
  resetForm         : resetForm,
  resetConfirmation : resetConfirmation
}


// default action
function handler(params) {
  params.form.email = ''
}


async function form(params, context) {
  if ( params.request.method === 'POST' ) {
    params.form.email = params.form.email.trim() || ''

    if ( !params.form.email.length ) {
      return {
        content: {
          message: 'Your e-mail address is required.'
        }
      }
    } else if ( !app.toolbox.validate.email(params.form.email) ) {
      return {
        content: {
          message: 'That doesn\'t appear to be a properly formatted e-mail address. Please check your entry and try again.'
        }
      }
    }

    let user = await app.models.user.info({ email: params.form.email })

    if ( !user ) {
      return {
        content: {
          message: 'The e-mail address you provided doesn\'t exist in our system. Please check it and try again.'
        }
      }
    }

    let [
      passwordResetInsert
    ] = await Promise.all([
      app.models.user.passwordResetInsert({ userID: user.id }),
      app.models.user.log({
        userID: user.id,
        action: 'Password reset request',
        ip: app.toolbox.helpers.ip(params.request)
      })
    ])

    let mail = await app.models.content.mail({
      template: 'Password Reset',
      replace: {
        resetUrl: app.config.comitium.baseUrl + 'password-reset/action/reset/id/' + user.id + '/code/' + passwordResetInsert.verificationCode
      }
    })

    app.toolbox.mail.sendMail({
      from: app.config.comitium.email,
      to: user.email,
      subject: mail.subject,
      text: mail.text
    })

    return {
      redirect: app.config.comitium.basePath + 'password-reset/action/confirmation'
    }
  } else {
    handler(params, context)
  }
}


function confirmation() {
  return {
    view: 'confirmation'
  }
}


async function reset(params) {
  params.form.password = ''
  params.form.verifyPassword = ''

  let passwordResetVerify = await app.models.user.passwordResetVerify({ userID: params.url.id, verificationCode: params.url.code }),
      view = 'reset'

  if ( passwordResetVerify ) {
    if ( app.toolbox.moment(Date.now()).diff(passwordResetVerify.time, 'hours') >= 24 ) {
      view = 'expired'
    }
  } else {
    view = 'invalid'
  }

  return {
    view: view
  }
}


async function resetForm(params) {
  let message = ''

  if ( !params.form.password.length || !params.form.verifyPassword.length ) {
    message = 'All fields are required.'
  } else if ( params.form.password !== params.form.verifyPassword ) {
    message = 'The passwords you entered don\'t match.'
  } else if ( !app.toolbox.validate.password(params.form.password) ) {
    message = 'Your password doesn\'t meet the minimum requirements (between 8 and 50 characters, anything but spaces).'
  }

  if ( message.length ) {
    return {
      content: {
        message: message
      },
      view: 'reset'
    }
  }

  let passwordResetVerify = await app.models.user.passwordResetVerify({ userID: params.url.id, verificationCode: params.url.code })

  if ( passwordResetVerify ) {
    let updatePassword = await app.models.user.updatePassword({ userID: params.url.id, password: params.form.password })

    if ( updatePassword ) {
      return {
        redirect: app.config.comitium.basePath + 'password-reset/action/resetConfirmation'
      }
    } else {
      return {
        view: 'invalid'
      }
    }
  } else {
    return {
      view: 'invalid'
    }
  }
}



function resetConfirmation() {
  return {
    view: 'reset-confirmation',
    include: {
      'sign-in': {
        controller: 'sign-in',
        view: 'sign-in-partial'
      }
    }
  }
}
