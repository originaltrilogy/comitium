// content model

'use strict'

module.exports = {
  getContent: getContent
}


function getContent(contentID, emitter) {
  app.toolbox.dbPool.connect(function (err, client, done) {
    if ( err ) {
      emitter.emit('error', err)
    } else {
      client.query(
        'select id, title_markdown, title_html, title_url, content_markdown, content_html, author_id from content where lower(title_url) = $1;',
        [ contentID ],
        function (err, result) {
          done()
          if ( err ) {
            emitter.emit('error', err)
          } else {
            if ( result.rows.length ) {
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
