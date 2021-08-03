// app start

import fs from 'fs'

import access from './toolbox/access.js'
import helpers from './toolbox/helpers.js'
import markdown from './toolbox/markdown.js'
import validate from './toolbox/validate.js'

import bcrypt from 'bcryptjs'
import citizen from 'citizen'
import moment from 'moment-timezone'
import numeral from 'numeral'
import pg from 'pg'
import slug from 'slug'

global.app = citizen

app.toolbox = {
  // Native modules
  access   : access,
  helpers  : helpers,
  markdown : markdown,
  validate : validate,

  // Third party modules
  bcrypt   : bcrypt,
  // Log e-mails to app/logs/email.txt instead of sending them
  mail: {
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
  moment   : moment,
  numeral  : numeral,
  pg       : pg,
  slug     : slug
}

// Overwrite pg's default date handler to convert to GMT
app.toolbox.pg.types.setTypeParser(1114, function (stringValue) {
  return new Date(Date.parse(stringValue + ' +0000')).toISOString()
})
// Create a connection pool
app.toolbox.dbPool = new app.toolbox.pg.Pool(app.config.comitium.db)
// Log errors in the connection pool
app.toolbox.dbPool.on('error', function (err) {
  app.log({
    type: 'error',
    label: 'Database pool error',
    contents: err
  })
})

// slug options
app.toolbox.slug.mode = 'pretty'
app.toolbox.slug.defaults.modes['pretty'] = {
  replacement: '-',
  remove: null,
  lower: false,
  charmap: app.toolbox.slug.charmap,
  multicharmap: app.toolbox.slug.multicharmap
}
// Overwrite slug's character map to avoid funky URLs
app.toolbox.slug.charmap['.'] = '-'
app.toolbox.slug.charmap['~'] = '-'
app.toolbox.slug.charmap['_'] = '-'
app.toolbox.slug.charmap['---'] = '-'
app.toolbox.slug.charmap['--'] = '-'

// Static resources
app.resources = {
  images: {
    defaultAvatar: fs.readFileSync(app.config.citizen.directories.app + '/resources/images/default-avatar.jpg')
  }
}

// Start the server
app.server.start()
