// Markdown processing

'use strict'

var Markdown = require('markdown-it'),
    emoji = require('markdown-it-emoji')

module.exports = {
  content: content,
  inline: inline,
  title: title
}


function emojiMarkup(token, idx) {
  return '<span class="emoji emoji_' + token[idx].markup + '">' + token[idx].content + '</span>'
}



function content(markdown) {
  var md = new Markdown({
             breaks: true,
             linkify: true,
             typographer: true
           }).use(emoji)

  md.renderer.rules.emoji = emojiMarkup

  return md.render(markdown)
}



function inline(markdown) {
  var md = new Markdown({
             linkify: true,
             typographer: true
           }).use(emoji)

  md.renderer.rules.emoji = emojiMarkup

  return md.renderInline(markdown)
}



function title(markdown) {
  var md = new Markdown().disable(['link', 'image'])

  return md.renderInline(markdown)
}
