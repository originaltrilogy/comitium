// content model

'use strict'

module.exports = {
  getContent: getContent,
  edit: edit
}


function getContent(contentID, emitter) {
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
                emitter.emit('ready', result.rows[0])

                if ( !app.cache.exists({ scope: 'content', key: contentID }) ) {
                  app.cache.set({
                    scope: 'content',
                    key:   contentID,
                    value: result.rows[0]
                  })
                }
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