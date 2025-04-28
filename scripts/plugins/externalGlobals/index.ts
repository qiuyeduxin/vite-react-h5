import externalGlobals from 'rollup-plugin-external-globals'
import type { HtmlTagDescriptor, Plugin, UserConfig } from 'vite'

interface CdnModule extends HtmlTagDescriptor {
  /**
   * 模块名称
   */
  name: string
  /**
   * 注入的global变量
   */
  var: string
}

export interface ExternalGlobalsOptions {
  /**
   * 模块列表
   */
  modules: CdnModule[]
}

/**
 * @name cdn资源引入external插件
 * 使用方式
 * @example
 * ```javascript
 * cdnPlugin({
 *  modules: [
 *     {
 *       name: "react",
 *       var: "React",
 *       injectTo: "body",
 *       tag: "script",
 *       attrs: {
 *          src: "https://unpkg.com/react@18.3.1/umd/react.production.min.js",
 *          type: "text/javascript",
 *          crossorigin: "anonymous",
 *       },
 *     },
 *   ],
 * })
 * ```
 */

export default function externalGlobalsPlugin(options: ExternalGlobalsOptions): Plugin {
  return {
    name: 'vite-plugin-external-globals',
    enforce: 'pre',
    config(): UserConfig {
      const varMap: externalGlobals.ModuleNameMap = {}
      options.modules.forEach((item) => {
        varMap[item.name] = item.var
      })

      return {
        build: {
          rollupOptions: {
            external: options.modules.map((item) => item.name),
            plugins: [externalGlobals(varMap)]
          }
        }
      }
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return {
          html,
          tags: options.modules.map(({ tag, injectTo, attrs }) => {
            return {
              tag,
              injectTo,
              attrs
            }
          })
        }
      }
    }
  }
}
