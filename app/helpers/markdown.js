// Markdown processing

import Markdown          from 'markdown-it'
import { full as emoji } from 'markdown-it-emoji'


export const emojiMarkup = (token, idx) => {
  return '<span class="emoji emoji_' + token[idx].markup + '">' + token[idx].content + '</span>'
}


export const content = (markdown) => {
  var md = new Markdown({
             breaks: true,
             linkify: true,
             typographer: true
           }).use(emoji)

  md.renderer.rules.emoji = emojiMarkup

  return md.render(markdown)
}


export const inline = (markdown) => {
  var md = new Markdown({
             linkify: true,
             typographer: true
           }).use(emoji)

  md.renderer.rules.emoji = emojiMarkup

  return md.renderInline(markdown)
}


export const title = (markdown) => {
  var md = new Markdown().disable(['link', 'image'])

  return md.renderInline(markdown)
}
