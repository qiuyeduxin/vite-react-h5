import type { Plugin } from 'vite'
import type { Pages } from './types'
import { normalizePath as _normalizePath, loadEnv } from 'vite'
import type { Options as MinifyOptions } from 'html-minifier-terser'
import createDevHtmlPlugin from './htmlDev'
import createBuildHtmlPlugin from './htmlBuild'

export default function createHtmlPlugin(pages: Pages, minifyOptions?: MinifyOptions): Plugin {
  if (process.env.NODE_ENV === 'production') {
    // 生产环境
    return createBuildHtmlPlugin(pages, minifyOptions)
  }

  return createDevHtmlPlugin(pages)
}
