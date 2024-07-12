// content model

export const edit = async (args) => {
  if ( !args.title_markdown.length || !args.content_markdown.length ) {
    return {
      success: false,
      reason: 'requiredFieldsEmpty',
      message: 'All fields are required.'
    }
  } else {
    const client = await app.helpers.dbPool.connect()
  
    try {
      await client.query({
        name: 'content_edit',
        text: 'update content set title_markdown = $1, title_html = $2, url = $3, content_markdown = $4, content_html = $5, modified = now() at time zone \'utc\', modified_by_id = $6 where id = $7 returning *',
        values: [ args.title_markdown, args.title_html, args.url, args.content_markdown, args.content_html, args.modified_by_id, args.id ]
      })
  
      app.cache.clear({ scope: 'content', key: args.id })

      return {
        success: true
      }
    } finally {
      client.release()
    }
  }
}


export const info = async (contentID) => {
  let cache = app.cache.get({ scope: 'content', key: contentID })

  if ( cache ) {
    return cache
  } else {
    const client = await app.helpers.dbPool.connect()
    
    try {
      const result = await client.query({
        name: 'content_info',
        text: 'select id, title_markdown, title_html, url, content_markdown, content_html, author_id from content where id = $1;',
        values: [ contentID ]
      })

      // Cache the result for future requests
      if ( !app.cache.exists({ scope: 'content', key: contentID }) ) {
        app.cache.set({
          scope: 'content',
          key:   contentID,
          value: result.rows[0]
        })
      }

      return result.rows[0]
    } finally {
      client.release()
    }
  }
}


export const mail = async (args) => {
  var format = args.format || 'text',
      parsedSubject,
      parsedText,
      replace = args.replace || {},
      regex

  const client = await app.helpers.dbPool.connect()

  try {
    const result = await client.query({
      name: 'content_mail',
      text: 'select subject, text, html from email_templates where lower(name) = lower($1);',
      values: [ args.template ]
    })

    if ( result.rows.length ) {
      // Parse the text and html, replacing placeholders with args.
      // Default to text format, use HTML if specified and it exists.
      parsedSubject = result.rows[0].subject
      if ( format === 'text' || !result.rows[0].html || !result.rows[0].html.length ) {
        parsedText = result.rows[0].text
      } else {
        parsedText = result.rows[0].html
      }

      Object.keys(replace).forEach( property => {
        regex = '\\[' + property + '\\]'
        regex = new RegExp(regex, 'gim')
        parsedSubject = parsedSubject.replace(regex, replace[property])
        parsedText = parsedText.replace(regex, replace[property])
      })

      return {
        success: true,
        subject: parsedSubject,
        text: parsedText
      }
    } else {
      throw new Error('The requested e-mail template doesn\'t exist.')
    }
  } finally {
    client.release()
  }
}
