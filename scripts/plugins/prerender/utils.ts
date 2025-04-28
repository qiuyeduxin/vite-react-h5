import * as cheerio from 'cheerio'

function removePrenderJsonpResource(html: string) {
  const scriptReg = /<script charset="utf-8" src="\S+"><\/script>/g
  const styleReg = /<link rel="stylesheet" type="text\/css" href="\S+">/g

  // 因为首屏有异步组件, 如果预渲染时候去掉异步css就容易引发样式闪动
  return html.replace(scriptReg, '').replace(styleReg, '')
}

export function htmlAflterRender(html: string): string {
  // 始终保证有一个slash
  const $ = cheerio.load(html)
  $('meta[name="viewport"]').remove()

  const htmlTag = $('html').get(0)
  if (htmlTag?.attribs['data-prerendered']) {
    htmlTag.attribs['data-prerendered'] = 'true'
  }

  return removePrenderJsonpResource($.html())
}
