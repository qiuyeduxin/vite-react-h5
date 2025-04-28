import { type Plugin } from 'vite'
import { minify as minifyTerser } from 'html-minifier-terser'
import type { Options as MinifyOptions } from 'html-minifier-terser'
import fs from 'node:fs'
import { resolve } from 'node:path'
import type { Pages } from './types'
import { MINIFY_PLUGIN_NAME } from './constants'

export async function minifyHtml(html: string, minifyOptions: MinifyOptions) {
  return await minifyTerser(html, minifyOptions)
}

export { MinifyOptions }

export default function createMinifyHtmlPlugin(views: Pages, options: MinifyOptions): Plugin {
  return {
    name: MINIFY_PLUGIN_NAME,
    enforce: 'post',
    async closeBundle() {
      try {
        // 构建完成后，对每个页面的HTML进行压缩
        views.forEach(async (view) => {
          const htmlPath = resolve(process.cwd(), `dist/${view.filename}`)
          const html = fs.readFileSync(htmlPath, 'utf-8')
          const minifiedHtml = await minifyHtml(html, options)
          fs.writeFileSync(htmlPath, minifiedHtml, 'utf-8')
        })
      } catch (error) {
        console.error(`[${MINIFY_PLUGIN_NAME}]: Error during HTML minification\n`, error)
      }
    }
  }
}
