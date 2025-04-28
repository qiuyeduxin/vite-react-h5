import '@testing-library/jest-dom/vitest'
import externalGlobals from 'rollup-plugin-external-globals'
import externalGlobalsPlugin, { type ExternalGlobalsOptions } from './index'

function json(obj: any): string {
  return JSON.stringify(obj)
}

describe('vite externalGlobalsPlugin', () => {
  it('should handle empty modules array', () => {
    const options: ExternalGlobalsOptions = { modules: [] }
    const plugin: Record<string, any> = externalGlobalsPlugin(options)
    expect(json(plugin.config())).toEqual(
      json({
        build: {
          rollupOptions: {
            external: [],
            plugins: [externalGlobals({})]
          }
        }
      })
    )
  })

  it('should handle non-empty modules array', () => {
    const options: ExternalGlobalsOptions = {
      modules: [
        {
          name: 'react',
          var: 'React',
          tag: 'script',
          injectTo: 'head',
          attrs: { src: 'https://cdn.example.com/react.js' }
        }
      ]
    }
    const plugin: Record<string, any> = externalGlobalsPlugin(options)
    expect(json(plugin.config())).toEqual(
      json({
        build: {
          rollupOptions: {
            external: ['react'],
            plugins: [externalGlobals({ react: 'React' })]
          }
        }
      })
    )
  })

  it('should handle different tag and injectTo values', () => {
    const options: ExternalGlobalsOptions = {
      modules: [
        {
          name: 'react',
          var: 'React',
          tag: 'link',
          injectTo: 'body',
          attrs: { href: 'https://cdn.example.com/react.css' }
        }
      ]
    }
    const plugin: Record<string, any> = externalGlobalsPlugin(options)
    expect(plugin.transformIndexHtml.handler('<html></html>')).toEqual({
      html: '<html></html>',
      tags: [
        { tag: 'link', injectTo: 'body', attrs: { href: 'https://cdn.example.com/react.css' } }
      ]
    })
  })

  it('should handle different attrs values', () => {
    const options: ExternalGlobalsOptions = {
      modules: [
        {
          name: 'react',
          var: 'React',
          tag: 'script',
          injectTo: 'head',
          attrs: { src: 'https://cdn.example.com/react.js', async: true }
        }
      ]
    }
    const plugin: Record<string, any> = externalGlobalsPlugin(options)
    expect(plugin.transformIndexHtml.handler('<html></html>')).toStrictEqual({
      html: '<html></html>',
      tags: [
        {
          tag: 'script',
          injectTo: 'head',
          attrs: { src: 'https://cdn.example.com/react.js', async: true }
        }
      ]
    })
  })
})
