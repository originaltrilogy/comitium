// app start

'use strict';

global.app = require('citizen');

var fs = require('fs');

app.toolbox = {
  // Native modules
  access: require('./toolbox/access'),
  helpers: require('./toolbox/helpers'),
  markdown: require('./toolbox/markdown'),
  validate: require('./toolbox/validate'),

  // Third party modules
  bcrypt: require('bcrypt'),
  // Log e-mails to app/logs/email.txt instead of sending them
  mail: {
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
  },
  moment: require('moment-timezone'),
  numeral: require('numeral'),
  pg: require('pg'),
  slug: require('slug')
};

app.toolbox.pg.defaults.poolSize = 100;

app.toolbox.pg.types.setTypeParser(1114, function (stringValue) {
  return new Date(Date.parse(stringValue + ' +0000')).toISOString();
});

// Static resources
app.resources = {
  images: {
    defaultAvatar: fs.readFileSync(app.config.citizen.directories.app + '/resources/images/default-avatar.jpg'),
    logo: fs.readFileSync(app.config.citizen.directories.app + '/resources/images/logo.svg')
  }
};

// Start the server
app.start();
