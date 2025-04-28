import pxToRemVwPlugin from './index'

type AnyObj = Record<string, any>

describe('pxToRemVwPlugin', () => {
  it('should add pluginInfo to existing postcss plugins when config.css.postcss is an object', async () => {
    const config = {
      css: {
        postcss: {
          plugins: [{ postcssPlugin: 'existing-plugin' }]
        }
      }
    }
    const opts = {
      /* 一些选项 */
    }

    const plugin: AnyObj = pxToRemVwPlugin(opts)
    const result = await plugin.config(config)

    expect(result.css.postcss.plugins).toHaveLength(1)
    expect(result.css.postcss.plugins[0].postcssPlugin).toEqual('postcss-pxtorem')
  })

  it('should add pluginInfo to default config when config.css.postcss does not exist', async () => {
    const config = {
      root: process.cwd()
    }
    const opts = {
      /* 一些选项 */
    }

    const plugin: AnyObj = pxToRemVwPlugin(opts)
    const result = await plugin.config(config)

    expect(result.css.postcss.plugins).toHaveLength(1)
    expect(result.css.postcss.plugins[0].postcssPlugin).toEqual('postcss-pxtorem')
  })

  it('should add pluginInfo to default config when postcssrc fails to load config', async () => {
    const plugin: AnyObj = pxToRemVwPlugin({})
    const result = await plugin.config({})

    expect(result.css.postcss.plugins).toHaveLength(1)
    expect(result.css.postcss.plugins[0].postcssPlugin).toEqual('postcss-pxtorem')
  })
})
