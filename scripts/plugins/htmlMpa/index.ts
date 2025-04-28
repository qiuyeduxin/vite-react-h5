import type { Plugin } from 'vite'
import createHtmlPlugin from './html'
import createHistoryRewritePlugin from './historyRewrites'
import type { Options, Pages, Rewrite, View } from './types'

function createHtmlMpaPlugin(options: Options): Plugin[] {
  return [
    createHtmlPlugin(options.pages, options.minify),
    createHistoryRewritePlugin(options)
  ].filter(Boolean)
}

export default function htmlPlugin(views: View[]) {
  const rewrites: Rewrite[] = []
  const pages: Pages = []

  views.forEach((item) => {
    pages.push({
      entry: item.entry,
      filename: item.filename,
      template: 'index.html',
      inject: {
        data: item.data
      }
    })

    rewrites.push({
      from: new RegExp(`${item.filename}`),
      to: item.filename
    })
  })

  return createHtmlMpaPlugin({
    pages,
    historyApiFallback: {
      rewrites
    },
    minify: {
      collapseWhitespace: true,
      keepClosingSlash: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true
    }
  })
}
