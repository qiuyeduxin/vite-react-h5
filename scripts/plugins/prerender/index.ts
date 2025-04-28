import type { View } from '../htmlMpa/types'
import prerenderPlugin from './plugin'
import path from 'node:path'
import { htmlAflterRender } from './utils'

export default function createPrerenderPlugin(pages: View[], publicPath: string) {
  return prerenderPlugin({
    publicPath,
    routes: pages.map((page) => `/${page.filename}`),
    staticDir: path.resolve(process.cwd(), 'dist'),
    server: {
      // Normally a free port is autodetected, but feel free to set this if needed.
      port: 6001
    },
    postProcess: (renderedRoute) => {
      // Add a custom header to each rendered route
      renderedRoute.html = htmlAflterRender(renderedRoute.html)
    },
    rendererOptions: {
      renderAfterElementExists: '#root',
      renderAfterTime: 1000,
      viewport: {
        width: 375,
        height: 800
      },
      // 默认是mac下的chrome，如果是其他路径可以自己修改
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH ||
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    },
    ignoreApis: ['api/v1']
  })
}
