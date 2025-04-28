import type { Plugin, ViteDevServer } from 'vite'
import type { View } from '../htmlMpa/types'
import serviceMockMiddleware from './mock'
import serviceProxyMiddleware from './proxy'

function devServerPlugin(pages: View[]): Plugin {
  return {
    name: 'dev-server',
    apply: 'serve',
    enforce: 'post',
    async configureServer(server: ViteDevServer) {
      server.middlewares.use(serviceMockMiddleware({ server, publicPath: '/', pages }))
      server.middlewares.use(await serviceProxyMiddleware({ pages, server, realtimeLog: true }))
    }
  }
}

export default devServerPlugin
