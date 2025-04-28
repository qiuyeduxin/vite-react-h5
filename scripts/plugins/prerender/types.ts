import type { PrerendererOptions } from '@prerenderer/prerenderer'

export interface VitePluginPrerenderOptions extends PrerendererOptions {
  publicPath: string

  /**
   * Routes to render
   * @default: []
   */
  routes: Array<string>

  ignoreApis?: Array<string>
}
