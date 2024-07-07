// resend user activation e-mail

export const handler = ({ form }) => {
  form.email = ''
}


export const submit = async ({ form }, request) => {
  if ( request.method === 'POST' ) {
    let email = form.email.trim()

    if ( app.toolbox.validate.email(email) ) {
      let user = await app.models.user.info({ email: email }),
          mail = {}

      if ( user ) {
        if ( user.activated ) {
          mail = await app.models.content.mail({
            template: 'Registration Resend - Activated',
            replace: {
              siteName: app.config.comitium.site.name,
              siteUrl: app.config.comitium.site.url
            }
          })
        } else {
          mail = await app.models.content.mail({
            template: 'Registration',
            replace: {
              activationUrl: app.config.comitium.baseUrl + 'user/action/activate/id/' + user.id + '/activationCode/' + user.activation_code,
              username: user.username
            }
          })
        }
      } else {
        mail = await app.models.content.mail({
          template: 'Registration Resend - No Match',
          replace: {
            siteName: app.config.comitium.site.name,
            siteUrl: app.config.comitium.site.url
          }
        })
      }

      app.toolbox.mail.sendMail({
        from: app.config.comitium.email,
        to: email,
        subject: mail.subject,
        text: mail.text
      })

      return {
        redirect: '/resend-activation/action/confirmation'
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
    return {
      redirect: '/resend-activation'
    }
  }
}


export const confirmation = () => {
  return {
    view: 'confirmation'
  }
}
