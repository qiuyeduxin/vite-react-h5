import '@testing-library/jest-dom/vitest'
import assetManifestPlugin from './index'
import * as fs from 'node:fs'
import * as path from 'path'
import mock from 'mock-fs'

describe('vite assetManifestPlugin', () => {
  let plugin: Record<string, any>

  beforeEach(() => {
    plugin = assetManifestPlugin()
    mock({
      dist: { demo: {}, about: {} },
      'src/pages/demo/index.js': '',
      'src/pages/demo/about.js': '',
      'src/assets/demo/image.png': '',
      'src/assets/demo/style.css': ''
    })
  })

  afterEach(() => {
    mock.restore()
  })

  it('should generate asset manifest for entry chunks', () => {
    const bundle = {
      'src/pages/demo/index.ts': {
        isEntry: true,
        name: 'src/pages/demo/index.js',
        fileName: 'static/js/runtime/demo-index-asb1.js'
      },
      'src/pages/about/index.js': {
        isEntry: true,
        name: 'src/pages/about/index.js',
        fileName: 'static/js/runtime/about-index-asb1.js'
      }
    }
    plugin.generateBundle({}, bundle)
    plugin.closeBundle()

    const manifestDemoPath = path.resolve(process.cwd(), 'dist/demo/asset-manifest.json')
    const manifestAboutPath = path.resolve(process.cwd(), 'dist/about/asset-manifest.json')
    const manifestDemo = JSON.parse(fs.readFileSync(manifestDemoPath, 'utf-8'))
    const manifestAbout = JSON.parse(fs.readFileSync(manifestAboutPath, 'utf-8'))
    expect(manifestDemo).toEqual({
      'src/pages/demo/index.html': '/demo/index.html',
      'src/pages/demo/index.js': 'static/js/runtime/demo-index-asb1.js'
    })
    expect(manifestAbout).toEqual({
      'src/pages/about/index.html': '/about/index.html',
      'src/pages/about/index.js': 'static/js/runtime/about-index-asb1.js'
    })
  })

  it('should include dynamic imports in the manifest', () => {
    const bundle = {
      'src/pages/demo/index.ts': {
        isEntry: true,
        name: 'src/pages/demo/index.js',
        fileName: 'static/js/runtime/demo-index-asb1.js',
        dynamicImports: ['static/js/demo/comp1-asb1.js', 'static/js/demo/comp2-cdss1.js']
      },
      'static/js/demo/comp1-asb1.js': {
        originalFileName: 'src/pages/demo/components/comp1.js',
        fileName: 'static/js/demo/comp1-asb1.js'
      },
      'static/js/demo/comp2-cdss1.js': {
        originalFileName: 'src/pages/demo/components/comp2.js',
        fileName: 'static/js/demo/comp2-cdss1.js'
      }
    }
    plugin.generateBundle({}, bundle)
    plugin.closeBundle()

    const manifestPath = path.resolve(process.cwd(), 'dist/demo/asset-manifest.json')
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    expect(manifest).toEqual({
      'src/pages/demo/index.html': '/demo/index.html',
      'src/pages/demo/index.js': 'static/js/runtime/demo-index-asb1.js',
      'src/pages/demo/components/comp1.js': 'static/js/demo/comp1-asb1.js',
      'src/pages/demo/components/comp2.js': 'static/js/demo/comp2-cdss1.js'
    })
  })

  it('should include imported assets in the manifest', () => {
    const bundle = {
      'src/pages/demo/index.ts': {
        isEntry: true,
        name: 'src/pages/demo/index.js',
        fileName: 'static/js/runtime/demo-index-asb1.js',
        viteMetadata: {
          importedAssets: ['static/media/image-asb1.png', 'static/media/avatar-fas1.png']
        }
      },
      'static/media/image-asb1.png': {
        originalFileName: 'src/assets/demo/image.png',
        fileName: 'static/media/image-asb1.png'
      },
      'static/media/avatar-fas1.png': {
        originalFileName: 'src/assets/demo/avatar.png',
        fileName: 'static/media/avatar-fas1.png'
      }
    }
    plugin.generateBundle({}, bundle)
    plugin.closeBundle()

    const manifestPath = path.resolve(process.cwd(), 'dist/demo/asset-manifest.json')
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    expect(manifest).toEqual({
      'src/pages/demo/index.html': '/demo/index.html',
      'src/pages/demo/index.js': 'static/js/runtime/demo-index-asb1.js',
      'src/assets/demo/image.png': 'static/media/image-asb1.png',
      'src/assets/demo/avatar.png': 'static/media/avatar-fas1.png'
    })
  })

  it('should include imported CSS in the manifest', () => {
    const bundle = {
      'src/pages/demo/index.ts': {
        isEntry: true,
        name: 'src/pages/demo/index.js',
        fileName: 'static/js/runtime/demo-index-asb1.js',
        viteMetadata: {
          importedCss: ['static/css/demo/style-fsasfa.css', 'static/css/common-ascs1.css']
        }
      },
      'static/css/demo/style-fsasfa.css': {
        originalFileName: 'src/pages/demo/style.css',
        fileName: 'static/css/demo/style-fsasfa.css'
      },
      'static/css/common-ascs1.css': {
        originalFileName: 'src/pages/demo/common.css',
        fileName: 'static/css/common-ascs1.css'
      }
    }
    plugin.generateBundle({}, bundle)
    plugin.closeBundle()

    const manifestPath = path.resolve(process.cwd(), 'dist/demo/asset-manifest.json')
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    expect(manifest).toEqual({
      'src/pages/demo/index.html': '/demo/index.html',
      'src/pages/demo/index.js': 'static/js/runtime/demo-index-asb1.js',
      'src/pages/demo/style.css': 'static/css/demo/style-fsasfa.css',
      'src/pages/demo/common.css': 'static/css/common-ascs1.css'
    })
  })
})
