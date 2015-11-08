// content model

'use strict';

module.exports = {
  mail: mail
};

function mail(args, emitter) {
  var format = args.format || 'text',
      parsedSubject,
      parsedText,
      replace = args.replace || {},
      regex;

  app.toolbox.pg.connect(app.config.comitium.db.connectionString, function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err);
    } else {
      client.query({
          name: 'content_mail',
          text: 'select "subject", "text", "html" from "emailTemplates" where lower("name") = lower($1);',
          values: [ args.template ]
        }, function (err, result) {
          done();
          if ( err ) {
            emitter.emit('error', err);
          } else {
            if ( result.rows.length ) {
              // Parse the text and html, replacing placeholders with args.
              // Default to text format, use HTML if specified and it exists.
              parsedSubject = result.rows[0].subject;
              if ( format === 'text' || !result.rows[0].html || !result.rows[0].html.length ) {
                parsedText = result.rows[0].text;
              } else {
                parsedText = result.rows[0].html;
              }

              for ( var property in replace ) {
                if ( replace.hasOwnProperty(property) ) {
                  regex = '\\[' + property + '\\]';
                  regex = new RegExp(regex, 'gim');
                  parsedSubject = parsedSubject.replace(regex, replace[property]);
                  parsedText = parsedText.replace(regex, replace[property]);
                }
              }

              emitter.emit('ready', {
                success: true,
                subject: parsedSubject,
                text: parsedText
              });
            } else {
              emitter.emit('error', {
                success: false,
                message: 'The e-mail template you specificed doesn\'t exist.'
              });
            }
          }
      });
    }
  });
}
