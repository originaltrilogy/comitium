// app start

'use strict';

var fs = require('fs'),
    path = require('path');

global.app = require('citizen');

// require('nodetime').profile({
//   accountKey: app.config.main.nodeTime.accountKey,
//   appName: app.config.main.nodeTime.appName
// });

app.db = {
  sql: {}
};

app.toolbox = {
  access: require('./toolbox/access'),
  helpers: require('./toolbox/helpers'),
  moment: require('moment'),
  numeral: require('numeral'),
  pg: require('pg'),
  slug: require('slug'),
  validate: require('./toolbox/validate')
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

// Parse and store SQL
fs.readdirSync(app.config.main.appPath + '/data/sql').forEach( function (file, index, array) {
  var fileName = path.basename(file, '.sql'),
      sql,
      sqlRegex = new RegExp(/^[A-Za-z0-9_-]*\.sql$/);

  if ( sqlRegex.test(file) ) {
    sql = fs.readFileSync(path.join(app.config.main.appPath + '/data/sql', '/', file), { encoding: 'utf-8' });
    app.db.sql[fileName] = sql.replace(/\r?\n|\r/g, ' ');
  }
});


// Start the server
app.start();

console.log(app.toolbox.helpers.hash('password'));