import type { Plugin, ResolvedConfig } from 'vite'
import type { Pages } from './types'
import { resolve } from 'path'
import { normalizePath as _normalizePath, loadEnv } from 'vite'
import fs from 'node:fs'
import { renderHtml } from './utils'
import chalk from 'chalk'
import type { Options as MinifyOptions } from 'html-minifier-terser'
import { minifyHtml } from './minify'
import { HTML_PLUGIN_NAME } from './constants'

const PREFIX = '\0virtual-entry:'

function createBuildHtmlPlugin(pages: Pages, minifyOptoins?: MinifyOptions): Plugin {
  // 存储解析后的Vite配置
  let viteConfig: ResolvedConfig
  // 输入配置，用于Rollup构建配置，键为入口文件名，值为对应的输出文件路径
  const input: Record<string, string> = {}
  let env: Record<string, any>

  // 遍历页面配置，设置每个页面的输入输出路径
  pages.forEach((page) => {
    input[page.entry] = `${PREFIX}${page.filename}`
  })

  // 返回一个Vite插件对象
  return {
    name: HTML_PLUGIN_NAME,
    enforce: 'pre',
    // 配置插件的构建配置
    config() {
      return {
        appType: 'mpa',
        optimizeDeps: {
          entries: pages.map((v) => v.entry).filter((v) => !!v) as string[]
        },
        build: {
          rollupOptions: {
            input
          }
        }
      }
    },
    // 在配置解析后，加载环境变量并进行页面HTML的渲染和写入
    async configResolved(config) {
      viteConfig = config
      env = loadEnv(config.mode, process.cwd())
    },
    resolveId(id) {
      return id.startsWith(PREFIX) ? resolve(process.cwd(), id.slice(PREFIX.length)) : undefined
    },
    load(id) {
      const page = pages.find((page) => {
        return id === resolve(process.cwd(), page.filename)
      })
      if (!page) return null

      const templateContent = fs.readFileSync(page.template, 'utf-8')

      return renderHtml(
        templateContent,
        {
          inject: page.inject,
          entry: page.entry
        },
        viteConfig,
        env
      )
    },
    // 在构建完成后，打印页面构建完成的信息和访问链接
    closeBundle() {
      if (minifyOptoins) {
        try {
          pages.forEach(async (page) => {
            const htmlPath = resolve(process.cwd(), `dist/${page.filename}`)
            const html = fs.readFileSync(htmlPath, 'utf-8')
            const minifiedHtml = await minifyHtml(html, minifyOptoins)
            fs.writeFileSync(htmlPath, minifiedHtml, 'utf-8')
          })
        } catch (err) {
          console.error(`[${HTML_PLUGIN_NAME}]: minify html error: ${err}`)
        }
      }

      console.log()
      console.log(chalk.green('页面构建完成，点击以下链接访问：'))
      pages.forEach((page) => {
        const title = page?.inject?.data?.title || ''
        console.log()
        console.log(chalk.white(title), chalk.blue(`${page.filename}`))
      })
    }
  }
}

export default createBuildHtmlPlugin
