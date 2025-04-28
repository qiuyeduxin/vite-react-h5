import type { Plugin, ResolvedConfig } from 'vite'
import type { Pages } from './types'
import { resolve } from 'path'
import { normalizePath as _normalizePath, loadEnv } from 'vite'
import { renderHtml } from './utils'
import chalk from 'chalk'
import { HTML_PLUGIN_NAME } from './constants'

/**
 * 创建开发环境HTML插件
 * @param pages 页面配置数组，包含每个页面的入口文件、模板文件等信息
 * @returns 返回一个Vite插件对象，用于在开发环境中处理多页面应用的HTML
 */
export default function createDevHtmlPlugin(pages: Pages): Plugin {
  // 开发环境
  let viteConfig: ResolvedConfig
  const input: Record<string, string> = {}
  let env: Record<string, any>

  // 根据页面配置，生成输入文件路径映射
  pages.forEach((page) => {
    input[page.entry] = resolve(process.cwd(), page.template)
  })

  return {
    name: HTML_PLUGIN_NAME,
    enforce: 'pre',
    config() {
      // 配置Vite构建选项，设置应用类型为多页面应用，并配置入口文件
      return {
        appType: 'mpa',
        build: {
          rollupOptions: {
            input
          }
        }
      }
    },
    async configResolved(config) {
      // 加载环境变量并解析配置
      viteConfig = config
      env = loadEnv(config.mode, process.cwd())
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html, ctx) {
        // 查找与当前URL匹配的页面配置
        const page = pages.find((page) => ctx.originalUrl?.includes(page.filename))
        if (!page) {
          // 如果找不到匹配的页面，返回空HTML和标签
          return {
            html: '',
            tags: []
          }
        }

        // 渲染HTML，注入页面特定的脚本和数据
        const _html = await renderHtml(
          html,
          {
            inject: page.inject,
            entry: page.entry
          },
          viteConfig,
          env
        )

        return {
          html: _html,
          tags: []
        }
      }
    },
    configureServer(server) {
      server.printUrls = () => {
        const network = server.resolvedUrls?.network[0]
        const local = server.resolvedUrls?.local[0]
        if (!network && !local) {
          console.log(
            chalk.red('获取IP地址失败,请检查vite.config.ts文件中server.host配置是否正确!\n')
          )
        }

        console.log(chalk.green('页面构建完成，点击以下链接访问：'))
        console.log()
        pages.forEach((page) => {
          const title = page?.inject?.data?.title || ''
          console.log(chalk.white(title), chalk.blue(`${network}${page.filename}`))
          console.log(chalk.white(title), chalk.blue(`${local}${page.filename}`))
          console.log()
        })
      }
    }
  }
}
