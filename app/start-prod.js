// app start

'use strict';

// REMOVE from shipping version
require('./toolbox/newrelic');

global.app = require('citizen');

app.toolbox = {
  // Native modules
  access: require('./toolbox/access'),
  helpers: require('./toolbox/helpers'),
  validate: require('./toolbox/validate'),

  // Third party modules
  bcrypt: require('bcrypt'),
  moment: require('moment-timezone'),
  numeral: require('numeral'),
  pg: require('pg').native,
  slug: require('slug')
};

app.toolbox.pg.types.setTypeParser(1114, function (stringValue) {
  return new Date(Date.parse(stringValue + ' +0000')).toISOString();
});

app.mail = require('nodemailer').createTransport(app.config.mail);

// Start the server
app.start();
