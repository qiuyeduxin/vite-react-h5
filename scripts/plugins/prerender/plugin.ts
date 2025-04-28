import { mergeConfig, type Plugin } from 'vite'
import path from 'path'
import Prerenderer from '@prerenderer/prerenderer'
import fs from 'node:fs'
import PuppeteerRenderer, { type PuppeteerRendererOptions } from '@prerenderer/renderer-puppeteer'
import { VitePluginPrerenderOptions } from './types'

export default function RollupPrerenderPlugin(options: VitePluginPrerenderOptions): Plugin {
  let bundle = {} as Record<string, any>
  let outDir = ''
  const {
    publicPath,
    rendererOptions: _rendererOptions,
    ignoreApis = [],
    ...prerendererOptions
  } = options

  return {
    name: 'vite-plugin-prerender',
    apply: 'build',
    enforce: 'post',
    generateBundle: {
      order: 'post',
      async handler(output, _bundle) {
        bundle = _bundle
        outDir = output.dir || '/'

        const rendererOptions: PuppeteerRendererOptions = mergeConfig(
          {
            injectProperty: '__PRERENDER_INJECTED__',
            inject: 'prerender'
          },
          _rendererOptions || {}
        )

        if (publicPath) {
          rendererOptions.pageSetup = (page) => {
            page.removeAllListeners('request')
            page.on('request', async (req) => {
              const url = req.url()
              // 忽略的接口请求
              const isIgnoreUrl = ignoreApis.find((api) => url.includes(api))
              if (url.includes(publicPath) || isIgnoreUrl) {
                let pathname = new URL(url).pathname
                if (pathname.startsWith('/')) {
                  pathname = pathname.slice(1)
                }
                if (pathname in bundle || isIgnoreUrl) {
                  const headers = req.headers()
                  await req.continue({
                    url: `${headers.origin}/${pathname}`
                  })
                  return
                }
              }
              void req.continue()
            })
          }
        }

        const renderer = new PuppeteerRenderer(rendererOptions)

        const PrerendererInstance = new Prerenderer({
          ...prerendererOptions,
          staticDir: outDir,
          renderer
        })
        PrerendererInstance.hookServer((server) => {
          const express = server.getExpressServer()

          // 去掉已经监听path为*的route
          // Express doesn't have complete typings yet
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const routes = express._router.stack as Array<{
            route: { path: string }
          }>
          routes.forEach((route, i) => {
            if (route.route?.path === '*') {
              routes.splice(i, 1)
            }
          }, 'post-fallback')

          express.get('*', (req, res) => {
            res.set({
              'Access-Control-Allow-Origin': '*', // 允许所有域访问
              'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
              'Access-Control-Allow-Headers': 'Content-Type'
            })

            let url = req.path.slice(1, req.path.endsWith('/') ? -1 : undefined)
            if (url.startsWith('/')) {
              url = url.slice(1)
            }

            if (url in bundle) {
              // 如果在bundle中就返回文件内容
              const chunk = bundle[url]
              if (url.endsWith('.json') && 'source' in chunk) {
                const source = chunk.source
                res.json(JSON.parse(typeof source === 'string' ? source : source.toString()))
              } else {
                try {
                  res.type(path.extname(url))
                  res.send('code' in chunk ? chunk.code : chunk.source)
                } catch (e) {
                  res.status(500)
                  this.error('Failed to deliver ' + url + ', is the type of the file correct?')
                }
              }
            } else if (fs.existsSync(path.join(outDir, url))) {
              // 如果本地outDir目录下有就返回文件
              res.send(fs.readFileSync(path.join(outDir, url), 'utf-8'))
            } else if (url.includes('api/v') || ignoreApis.find((api) => url.includes(api))) {
              // 所有接口请求一律返回null，保证接口请求成功，但是没有数据，免得终端报错
              res.send({
                data: null,
                dm_error: 0,
                error_msg: '预渲染不请求'
              })
            } else {
              res.status(404)
              this.error(url + ' not found during prerender')
            }
          })
        })
        try {
          await PrerendererInstance.initialize()

          const renderedRoutes = await PrerendererInstance.renderRoutes([
            ...new Set((options.routes || []) as string[])
          ])

          renderedRoutes.forEach((processedRoute) => {
            let outputPath = processedRoute.route
            if (outputPath.startsWith('/') || outputPath.startsWith('\\')) {
              outputPath = outputPath.slice(1)
            }
            bundle[outputPath].source = processedRoute.html.trim()
          })
        } catch (err: unknown) {
          this.warn('Unable to prerender all routes!' + err)
          if (err instanceof Error) {
            this.error(err.message)
          } else if (typeof err === 'object' && err) {
            this.error(JSON.stringify(err))
          }
        } finally {
          await PrerendererInstance.destroy()
        }
      }
    }
  }
}
