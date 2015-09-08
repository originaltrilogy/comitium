// app start

'use strict';

// REMOVE from shipping version
require('newrelic');

global.app = require('citizen');

var fs = require('fs');

app.toolbox = {
  // Native modules
  access:   require('./toolbox/access'),
  helpers:  require('./toolbox/helpers'),
  markdown: require('./toolbox/markdown'),
  validate: require('./toolbox/validate'),

  // Third party modules
  bcrypt:   require('bcrypt'),
  mail:     require('nodemailer').createTransport(app.config.comitium.mail),
  moment:   require('moment-timezone'),
  numeral:  require('numeral'),
  pg:       require('pg'),
  slug:     require('slug')
};

app.toolbox.pg.defaults.poolSize = 100;
app.toolbox.pg.types.setTypeParser(1114, function (stringValue) {
  return new Date(Date.parse(stringValue + ' +0000')).toISOString();
});

// Static resources
app.resources = {
  images: {
    defaultAvatar: fs.readFileSync(app.config.citizen.directories.app + '/resources/images/default-avatar.jpg')
  }
};

// Start the server
app.start();
