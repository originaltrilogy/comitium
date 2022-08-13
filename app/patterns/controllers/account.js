// account controller

import { writeFile } from 'fs/promises'
import gm from 'gm'


export const config = {
  avatarForm: {
    forms: {
      maxPayloadSize: 5242880 // 5MB
    }
  }
}


export const handler = async (params) => {
  if ( params.session.authenticated ) {
    params.form.email = params.session.email
    params.form.password = ''
    params.form.signature = params.session.signature
    params.form.timezone = params.session.timezone
    params.form.dateFormat = params.session.dateFormat
    params.form.theme = params.session.theme
    params.form.subscriptionEmailNotification = params.session.subscriptionEmailNotification
    params.form.privateTopicEmailNotification = params.session.privateTopicEmailNotification
    params.form.website = params.session.website

    return {
      public: {
        timezones : app.toolbox.moment.tz.names(),
        themes    : app.config.comitium.themes
      }
    }
  } else {
    return {
      redirect: params.session.user_id ? app.config.comitium.basePath + 'sign-in/password/true' : app.config.comitium.basePath + 'sign-in'
    }
  }
}


export const generalForm = async (params, request, response, context) => {
  if ( params.session.authenticated ) {
    if ( request.method === 'POST' ) {
      let email         = params.form.email.trim(),
          password      = params.form.password.trim(),
          signature     = params.form.signature.trim().length ? params.form.signature.trim() : null,
          signatureHtml = signature ? app.toolbox.markdown.content(signature) : null,
          website       = params.form.website.trim().length ? params.form.website.trim() : null,
          methods       = [],
          update        = true,
          messages      = {},
          activationCode

      if ( email !== params.session.email ) {
        if ( app.toolbox.validate.email(email) ) {
          let emailExists = await app.models.user.emailExists({ email: email })

          if ( !emailExists ) {
            activationCode = app.toolbox.helpers.activationCode()
            methods.push(
              app.models.user.updateEmail({
                userID: params.session.user_id,
                email: email,
                deactivateUser: true,
                activationCode: activationCode
              })
            )
          } else {
            update = false
            messages.email = 'The e-mail address you provided is already in use.'
          }
        } else {
          update = false
          messages.email = 'The e-mail address you provided isn\'t valid.'
        }
      }

      if ( password.length ) {
        if ( app.toolbox.validate.password(password) ) {
          methods.push(
            app.models.user.updatePassword({
              userID: params.session.user_id,
              password: password
            })
          )
        } else {
          update = false
          messages.password = 'Your password doesn\'t meet the minimum requirements (between 8 and 50 characters, anything but spaces).'
        }
      }

      if ( website && website.length && !app.toolbox.validate.url(website) ) {
        update = false
        messages.website = 'Your website address isn\'t properly formatted. Make sure it includes the protocol (http or https).'
      }

      if ( update ) {
        methods.push(
          app.models.user.updateSettings({
            userID: params.session.user_id,
            signature: signature,
            signatureHtml: signatureHtml,
            timezone: params.form.timezone,
            theme: params.form.theme,
            website: website,
            subscriptionEmailNotification: params.form.subscriptionEmailNotification || false,
            privateTopicEmailNotification: params.form.privateTopicEmailNotification || false
          })
        )

        await Promise.all(methods)

        // If e-mail was updated, send reactivation e-mail and log the user out
        if ( activationCode ) {
          let mail = await app.models.content.mail({
            template: 'Reactivation',
            replace: {
              activationUrl: app.config.comitium.baseUrl + 'user/action/activate/id/' + params.session.user_id + '/activationCode/' + activationCode + '/reactivation/true'
            }
          })

          app.toolbox.mail.sendMail({
            from: app.config.comitium.email,
            to: email,
            subject: mail.subject,
            text: mail.text
          })

          return {
            redirect: app.config.comitium.basePath + 'sign-out/reason/reactivation-required'
          }
        } else {
          let user = await app.models.user.info({ userID: params.session.user_id })

          user.userID = user.id
          delete user.id
          params.form.password = ''

          return {
            // Update the user's session with their new settings
            session: user,
            public: {
              general: {
                success: true,
                messages: {
                  success: 'Your changes were saved.'
                }
              },
              timezones: app.toolbox.moment.tz.names(),
              themes: app.config.comitium.themes
            }
          }
        }
      } else {
        return {
          public: {
            general: {
              messages: messages
            },
            timezones: app.toolbox.moment.tz.names(),
            themes: app.config.comitium.themes
          }
        }
      }
    // If it's a GET, fall back to the default topic start action
    } else {
      return handler(params, context)
    }
  } else {
    return {
      redirect: params.session.user_id ? app.config.comitium.basePath + 'sign-in/password/true' : app.config.comitium.basePath + 'sign-in'
    }
  }
}


export const avatarForm = async (params, request, response, context) => {
  // For now, all avatars are converted to JPEG. Storing custom avatars has many complications
  // (topic caches, static file caches, etc.).

  if ( params.session.authenticated ) {
    if ( request.method === 'POST' ) {
      params.form.email = params.session.email
      params.form.password = ''
      params.form.signature = params.session.signature
      params.form.timezone = params.session.timezone
      params.form.dateFormat = params.session.dateFormat
      params.form.theme = params.session.theme
      params.form.privateTopicEmailNotification = params.session.privateTopicEmailNotification

      let content = {
        timezones: app.toolbox.moment.tz.names(),
        themes: app.config.comitium.themes,
        avatarForm: {}
      }

      if ( params.form.avatar && Object.keys(params.form.avatar).length && Object.keys(params.form.avatar).length === 1 ) {
        await writeFile('/tmp/comitium-avatar-' + params.session.user_id + '.jpg', params.form.avatar[Object.keys(params.form.avatar)[0]].binary, 'binary')

        let processImage = await new Promise((resolve, reject) => {
          gm('/tmp/comitium-avatar-' + params.session.user_id + '.jpg').identify( function (err, stats) {
            let file = app.config.citizen.directories.web + '/avatars/' + params.session.user_id + '.jpg'

            if ( !stats ) {
              content.avatarForm.message = 'There was a problem with your upload, possibly because the file is corrupt.'
              resolve({ public: content })
            } else if ( !stats.size ) {
              content.avatarForm.message = 'Only image files are allowed.'
              resolve({ public: content })
            } else {
              let width = stats.size.width,
                  height = stats.size.height
  
              if ( stats.format === 'GIF' && stats.Scene ) {
                content.avatarForm.message = 'Animated GIFs aren\'t allowed.'
                resolve({ public: content })
              } else {
                if ( stats.size.width !== stats.size.height ) {
                  if ( stats.size.width > stats.size.height ) {
                    width = stats.size.height
                  } else {
                    height = stats.size.width
                  }
                }
  
                gm('/tmp/comitium-avatar-' + params.session.user_id + '.jpg')
                  .gravity('Center')
                  .crop(width, height)
                  .resize(200, 200)
                  .sharpen(10)
                  .autoOrient()
                  .noProfile()
                  .write(file, function (err) {
                    if ( err ) {
                      reject(err)
                    } else {
                      app.cache.clear({ file: file })
                      content.avatarForm.success = true
                      content.avatarForm.message = 'Your avatar was saved successfully!'
                      resolve({ public: content })
                    }
                  })
              }
            }
          })
        })

        return processImage
      } else {
        content.avatarForm.message = 'You need to specify a file to upload.'
        return {
          public: content
        }
      }
    } else {
      return handler(params, context)
    }
  } else {
    return {
      redirect: params.session.user_id ? app.config.comitium.basePath + 'sign-in/password/true' : app.config.comitium.basePath + 'sign-in'
    }
  }
}
