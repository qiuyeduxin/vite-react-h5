import './scripts/env.ts'
import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viewConfig from './src/views/index.ts'
import { resolve } from 'path'
import { getHashDigest, interpolateName } from 'loader-utils'
import htmlPlugin from './scripts/plugins/htmlMpa'
import pxToRemVwPlugin from './scripts/plugins/pxToRemVw'
import devServerPlugin from './scripts/plugins/devServer'
import prerenderPlugin from './scripts/plugins/prerender'
import externalGlobalsPlugin from './scripts/plugins/externalGlobals'
import assetManifestPlugin from './scripts/plugins/assetManifest'
import { visualizer } from 'rollup-plugin-visualizer'
import { getViewsConfig, getBaseSize } from './scripts/utils'

const CDN_PATH = process.env.CDN_PATH || ''
const views = getViewsConfig(viewConfig)
const baseSize = getBaseSize(views)

interface UserConfigWithTest extends UserConfig {
  test?: any
}

/// <reference types="vitest" />
export default defineConfig(({ command, mode, isPreview }) => {
  const config: UserConfigWithTest = {
    mode,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        src: resolve(__dirname, 'src'),
        components: resolve(__dirname, 'src/components'),
      }
    },
    css: {
      modules: {
        scopeBehaviour: 'local',
        // css module 生成类名
        generateScopedName: (name, filename) => {
          const fileNameOrFolder = filename.match(/index\.module\.(css|scss|less)$/)
            ? '[folder]'
            : '[name]'

          const str: any = filename.replace(__dirname, '') + name
          // Create a hash based on a the file location and class name. Will be unique across a project, and close to globally unique.
          const hash = getHashDigest(str, 'md5', 'base32', 5)
          // Use loaderUtils to find the file or folder name
          const className = interpolateName(
            { resourcePath: filename, resourceQuery: '' } as any,
            fileNameOrFolder + '_' + name + '__' + hash
          )

          // // Remove the .module that appears in every classname when based on the file and replace all "." with "_".
          return className.replace('.module_', '_').replace(/\./g, '_')
        }
      }
    },
    clearScreen: true,
    assetsInclude: [/\.svga$/i]
  }

  if (isPreview) {
    return config
  }

  config.plugins = [
    react({
      babel: {
        plugins: [
          '@babel/plugin-transform-react-jsx',
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-transform-class-properties', { loose: true }]
        ]
      }
    }),
    htmlPlugin(views),
    pxToRemVwPlugin({
      rootValue: baseSize
    })
  ]

  if (command === 'serve') {
    config.server = {
      port: 3001,
      host: '0.0.0.0'
    }
    config.plugins?.push(devServerPlugin(views))

    if (mode === 'test') {
      config.test = {
        globals: true, // 启用全局 API
        environment: 'jsdom', // 浏览器环境模拟
        exclude: [
          '**/node_modules/**',
          'src/views/**',
          'src/resources/**',
          'src/styles/**',
          'src/pages/**',
          'public/**',
          'dist/**',
          '*env*'
        ],
        setupFiles: './src/setupTest.ts', // 测试初始化文件
        coverage: {
          exclude: [
            '**/node_modules/**',
            'src/views/**',
            'src/resources/**',
            'src/styles/**',
            'src/pages/**',
            'public/**',
            'dist/**',
            '*env*'
          ],
          provider: 'istanbul', // 覆盖率工具
          reporter: ['text', 'json', 'html'], // 覆盖率报告格式
          thresholds: {
            lines: 80,
            functions: 80,
            branches: 80,
            statements: 80
          }
        },
        // 支持源码映射调试
        sourcemap: true,
        // 别名解析（与vite配置保持一致）
        alias: config.resolve?.alias
      }
    }
    // dev 独有配置
  } else if (command === 'build') {
    // command === 'build'
    config.esbuild = {
      pure: ['console.log'], // 删除 console.log
      drop: ['debugger'] // 删除 debugger
    }

    config.build = {
      // target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      assetsDir: '',
      rollupOptions: {
        output: {
          experimentalMinChunkSize: 10 * 1024, // 单位b 没有副作用，合并较小的模块
          entryFileNames: (entryItem) => {
            const name = entryItem.name || ''
            const pathName = name
              .replace('/index.html', '')
              .replace('src/pages/', '')
              .replace('.ts', '')
              .replace('.js', '')
              .replace(/\//g, '-')
            const newEntryFileName = `${name.replace(
              /.*index.(t|j)s$/,
              `static/js/runtime/${pathName}-[hash].js`
            )}`
            return newEntryFileName
          },
          manualChunks: (id) => {
            if (/(axios|redux|redux-thunk|react-redux|react-router|react-router-dom)/.test(id)) {
              return 'libs'
            }
          },
          assetFileNames: (assetItem) => {
            if (assetItem.names.join().includes('.css')) {
              if (assetItem.names.includes('index.css') && assetItem.originalFileNames.length) {
                const map = new Map<string, number>()
                let entryName = ''
                assetItem.originalFileNames.forEach((moduleId) => {
                  const key = moduleId.split('/').at(-2)
                  if (key && !map.has(moduleId)) {
                    map.set(key, 1)
                  }
                  if (!entryName && moduleId.includes('src/pages')) {
                    entryName += moduleId
                      .replace(/.*src\/pages\//, '')
                      .replace(new RegExp(`components.*|common.*|${key}.*`), '')
                  }
                })
                const path: string = `static/css/${entryName}${[...map].reduce(
                  (pre, cur) => `${pre}${pre ? '-' : ''}${cur[0].toLowerCase()}`,
                  ''
                )}-[hash][extname]`
                return path
              }
              return 'static/css/[name].[hash][extname]'
            }
            return 'static/media/[name].[hash][extname]'
          },
          chunkFileNames(chunkItem) {
            if (chunkItem.name === 'index' && chunkItem.moduleIds.length) {
              const map = new Map<string, number>()
              let entryName = ''
              chunkItem.moduleIds.forEach((moduleId) => {
                if (!moduleId.includes('src/pages')) {
                  return
                }
                const key = moduleId.split('/').at(-2)
                if (key && !map.has(moduleId)) {
                  map.set(key, 1)
                }
                if (!entryName && moduleId.includes('src/pages')) {
                  entryName += moduleId
                    .replace(/.*src\/pages\//, '')
                    .replace(new RegExp(`components.*|common.*|${key}.*`), '')
                }
              })
              const fileName = [...map].reduce(
                (pre, cur) => `${pre}${pre ? '-' : ''}${cur[0].toLowerCase()}`,
                ''
              )
              const path: string = `static/js/${entryName}${fileName || 'common'}-[hash].js`
              return path
            }
            return 'static/js/[name]-[hash].js'
          }
        }
      }
    }

    if (mode === 'online') {
      config.base = CDN_PATH
    }

    /** @WARRING prerenderPlugin 可以使用，想用就自己打开 */
    config.plugins?.push(prerenderPlugin(views, mode === 'online' ? CDN_PATH : ''))

    /** @WARRING 分析构建产物 */
    // config.plugins?.push(visualizer({ open: true }))

    config.plugins?.push(
      externalGlobalsPlugin({
        modules: [
          {
            name: 'react',
            var: 'React',
            injectTo: 'body',
            tag: 'script',
            attrs: {
              src: 'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
              crossorigin: '',
              rel: 'preload'
            }
          },
          {
            name: 'react-dom',
            var: 'ReactDOM',
            injectTo: 'body',
            tag: 'script',
            attrs: {
              src: 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
              crossorigin: '',
              rel: 'preload'
            }
          }
        ]
      })
    )
    config.plugins?.push(assetManifestPlugin())
  }
  return config
})
