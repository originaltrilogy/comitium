// content model

'use strict'

module.exports = {
  info: info,
  edit: edit,
  mail: mail
}


function info(contentID, emitter) {
  let cache = app.cache.get({ scope: 'content', key: contentID })

  if ( cache ) {
    emitter.emit('ready', cache)
  } else {
    app.toolbox.dbPool.connect(function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err)
      } else {
        client.query(
          'select id, title_markdown, title_html, url, content_markdown, content_html, author_id from content where id = $1;',
          [ contentID ],
          function (err, result) {
            done()
            if ( err ) {
              emitter.emit('error', err)
            } else {
              if ( result.rows.length ) {
                if ( !app.cache.exists({ scope: 'content', key: contentID }) ) {
                  app.cache.set({
                    scope: 'content',
                    key:   contentID,
                    value: result.rows[0]
                  })
                }

                emitter.emit('ready', result.rows[0])
              } else {
                emitter.emit('ready', false)
              }
            }
          }
        )
      }
    })
  }
}


function edit(args, emitter) {
  if ( !args.title_markdown.length || !args.content_markdown.length ) {
    emitter.emit('error', {
      success: false,
      reason: 'requiredFieldsEmpty',
      message: 'Title and content can\'t be empty.'
    });
  } else {
    app.toolbox.dbPool.connect(function (err, client, done) {
      if ( err ) {
        emitter.emit('error', err);
      } else {
        client.query(
          'update content set title_markdown = $1, title_html = $2, url = $3, content_markdown = $4, content_html = $5, modified = now() at time zone \'utc\', modified_by_id = $6 where id = $7 returning *',
          [ args.title_markdown, args.title_html, args.url, args.content_markdown, args.content_html, args.modified_by_id, args.id ],
          function (err, result) {
            done();
            if ( err ) {
              emitter.emit('error', err);
            } else {
              app.cache.clear({ scope: 'content', key: args.id })

              emitter.emit('ready', {
                success: true,
                affectedRows: result.rows
              });
            }
          }
        );
      }
    });
  }
}


function mail(args, emitter) {
  var format = args.format || 'text',
      parsedSubject,
      parsedText,
      replace = args.replace || {},
      regex;

  app.toolbox.dbPool.connect(function (err, client, done) {
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