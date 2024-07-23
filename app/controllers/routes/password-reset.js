// password-reset controller

export const handler = (params) => {
  params.form.email = ''
}


export const submit = async (params, request, response, context) => {
  if ( request.method === 'POST' ) {
    let email = params.form.email?.trim() || ''

    if ( app.helpers.validate.email(email) ) {
      let user = await app.models.user.info({ email: email })
  
      if ( !user ) {
        return {
          local: {
            error: {
              message: 'The e-mail address you provided doesn\'t exist in our system. Please check it and try again.'
            }
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
          ip: app.helpers.util.ip(request.remoteAddress)
        })
      ])
  
      let mail = await app.models.content.mail({
        template: 'Password Reset',
        replace: {
          resetUrl: app.config.comitium.baseUrl + 'password-reset/action/reset/id/' + user.id + '/code/' + passwordResetInsert.verificationCode
        }
      })
  
      app.helpers.mail.sendMail({
        from: app.config.comitium.email,
        to: user.email,
        subject: mail.subject,
        text: mail.text
      })
  
      return {
        redirect: app.config.comitium.basePath + 'password-reset/action/confirmation'
      }
    } else {
      return {
        local: {
          error: {
            message: 'Please provide a valid e-mail address.'
          }
        }
      }
    }
  } else {
    return handler(params, context)
  }
}


export const confirmation = () => {
  return {
    view: 'confirmation'
  }
}


export const reset = async (params) => {
  params.form.password = ''
  params.form.verifyPassword = ''

  let passwordResetVerify = await app.models.user.passwordResetVerify({ userID: params.url.id, verificationCode: params.url.code }),
      view = 'reset'

  if ( passwordResetVerify ) {
    if ( app.helpers.moment(Date.now()).diff(passwordResetVerify.time, 'hours') >= 24 ) {
      view = 'expired'
    }
  } else {
    view = 'invalid'
  }

  return {
    view: view
  }
}


export const resetForm = async (params) => {
  let message = ''

  if ( !params.form.password.length || !params.form.verifyPassword.length ) {
    message = 'All fields are required.'
  } else if ( params.form.password !== params.form.verifyPassword ) {
    message = 'The passwords you entered don\'t match.'
  } else if ( !app.helpers.validate.password(params.form.password) ) {
    message = 'Your password doesn\'t meet the minimum requirements (between 8 and 50 characters, anything but spaces).'
  }

  if ( message.length ) {
    return {
      local: {
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



export const resetConfirmation = () => {
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
