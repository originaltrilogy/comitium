// app start

import fs         from 'node:fs'

import bcrypt     from 'bcryptjs'
import citizen    from 'citizen'
import moment     from 'moment-timezone'
import nodemailer from 'nodemailer'
import numeral    from 'numeral'
import pg         from 'pg'
import slug       from 'slug'

global.app = citizen

app.helpers.bcrypt  = bcrypt,
app.helpers.mail    = nodemailer.createTransport(app.config.comitium.mail),
app.helpers.moment  = moment,
app.helpers.numeral = numeral,
app.helpers.pg      = pg,
app.helpers.slug    = slug

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
app.start()
