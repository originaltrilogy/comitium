// app start

'use strict';

global.app = require('citizen');

var fs = require('fs');

app.toolbox = {
  // Native modules
  access:   require('./toolbox/access'),
  helpers:  require('./toolbox/helpers'),
  markdown: require('./toolbox/markdown'),
  validate: require('./toolbox/validate'),

  // Third party modules
  bcrypt:   require('bcryptjs'),
  mail:     require('nodemailer').createTransport(app.config.comitium.mail),
  moment:   require('moment-timezone'),
  numeral:  require('numeral'),
  pg:       require('pg'),
  slug:     require('slug')
};

// Overwrite pg's default date handler to convert to GMT
app.toolbox.pg.types.setTypeParser(1114, function (stringValue) {
  return new Date(Date.parse(stringValue + ' +0000')).toISOString();
});
// Create a connection pool
app.toolbox.dbPool = new app.toolbox.pg.Pool(app.config.comitium.db);
// Log errors in the connection pool
app.toolbox.dbPool.on('error', function (err, client) {
  app.log({
    type: 'error',
    label: 'Database pool error',
    contents: err
  });
});

// Overwrite slug's character map to avoid funky URLs
app.toolbox.slug.charmap['~'] = '-';
app.toolbox.slug.charmap['_'] = '-';
app.toolbox.slug.charmap['---'] = '-';
app.toolbox.slug.charmap['--'] = '-';

// Static resources
app.resources = {
  images: {
    defaultAvatar: fs.readFileSync(app.config.citizen.directories.app + '/resources/images/default-avatar.jpg')
  }
};

// Start the server
app.start();
