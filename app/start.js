// app start

'use strict';

// REMOVE from shipping version
require('newrelic');

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
  pg: require('pg'),
  slug: require('slug')
};

app.toolbox.pg.types.setTypeParser(1114, function (stringValue) {
  return new Date(Date.parse(stringValue + ' +0000')).toISOString();
});


if ( app.config.citizen.mode === 'production' ) {
  app.mail = require('nodemailer').createTransport(app.config.mail);
} else {
  app.mail = {
    // Log e-mails to app/logs/email.txt when debugging instead of sending them
    sendMail: function (args) {
      app.log({
        label: 'E-mail debug log (not sent)',
        content: {
          from: args.from,
          to: args.to,
          subject: args.subject,
          text: args.text
        },
        toFile: true,
        file: 'email.txt'
      });
    }
  };
}


// Start the server
app.start();
