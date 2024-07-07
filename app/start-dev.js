// app start with alternate functionality for develompent mode

import fs from 'fs'

import bcrypt  from 'bcryptjs'
import citizen from 'citizen'
import moment  from 'moment-timezone'
import numeral from 'numeral'
import pg      from 'pg'
import slug    from 'slug'

global.app = citizen

// Third party modules
app.helpers.bcrypt   = bcrypt,
// Log e-mails to app/logs/email.txt instead of sending them
app.helpers.mail     = {
  sendMail: function (args) {
    app.helpers.log({
      label: 'E-mail debug log (not sent)',
      content: {
        from: args.from,
        to: args.to,
        subject: args.subject,
        text: args.text
      },
      file: 'email.log'
    })
  }
},
app.helpers.moment   = moment,
app.helpers.numeral  = numeral,
app.helpers.pg       = pg,
app.helpers.slug     = slug

// Overwrite pg's default date handler to convert to GMT
app.helpers.pg.types.setTypeParser(1114, function (stringValue) {
  return new Date(Date.parse(stringValue + ' +0000')).toISOString()
})
// Create a connection pool
app.helpers.dbPool = new app.helpers.pg.Pool(app.config.comitium.db)
// Log errors in the connection pool
app.helpers.dbPool.on('error', function (err) {
  app.log({
    type: 'error',
    label: 'Database pool error',
    contents: err
  })
})

// slug options
app.helpers.slug.mode = 'pretty'
app.helpers.slug.defaults.modes['pretty'] = {
  replacement: '-',
  remove: null,
  lower: false,
  charmap: app.helpers.slug.charmap,
  multicharmap: app.helpers.slug.multicharmap
}
// Overwrite slug's character map to avoid funky URLs
app.helpers.slug.charmap['.'] = '-'
app.helpers.slug.charmap['~'] = '-'
app.helpers.slug.charmap['_'] = '-'
app.helpers.slug.charmap['---'] = '-'
app.helpers.slug.charmap['--'] = '-'

// Static resources
app.resources = {
  images: {
    defaultAvatar: fs.readFileSync(app.config.citizen.directories.app + '/resources/images/default-avatar.jpg'),
    logo: fs.readFileSync(app.config.citizen.directories.app + '/resources/images/logo.svg')
  }
}

// Start the server
await app.start({
  citizen: {
    mode: 'development'
  }
})
