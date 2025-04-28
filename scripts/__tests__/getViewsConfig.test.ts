import { getViewsConfig } from '../utils' // 替换为实际路径
import mock from 'mock-fs'

describe('getViewsConfig', () => {
  afterEach(() => {
    mock.restore()
  })

  it('should return default views config when no customizations are provided', () => {
    const viewConfig = {
      home: {}
    }
    const expected = [
      {
        key: 'home',
        entry: 'src/pages/home/index.ts',
        filename: 'home/index.html',
        entryDir: 'src/pages/home',
        data: {
          PUBLIC_URL: 'home',
          headFirst: '',
          headLast: '',
          bodyFirst: '',
          bodyLast: ''
        }
      }
    ]
    expect(getViewsConfig(viewConfig)).toEqual(expected)
  })

  it('should return views config with customizations when provided', () => {
    const viewConfig = {
      home: {
        headFirst: ['<meta charset="UTF-8">'],
        headLast: ['<title>Home</title>'],
        bodyFirst: ['<script src="script.js"></script>'],
        bodyLast: ['<script src="script2.js"></script>']
      }
    }
    const expected = [
      {
        key: 'home',
        entry: 'src/pages/home/index.ts',
        filename: 'home/index.html',
        entryDir: 'src/pages/home',
        data: {
          PUBLIC_URL: 'home',
          headFirst: '<meta charset="UTF-8">',
          headLast: '<title>Home</title>',
          bodyFirst: '<script src="script.js"></script>',
          bodyLast: '<script src="script2.js"></script>'
        }
      }
    ]
    expect(getViewsConfig(viewConfig)).toEqual(expected)
  })

  it('should set entry to .js file if it exists', () => {
    mock({
      'src/pages/home/index.js': ''
    })
    const viewConfig = {
      home: {}
    }
    const expected = [
      {
        key: 'home',
        entry: 'src/pages/home/index.js',
        filename: 'home/index.html',
        entryDir: 'src/pages/home',
        data: {
          PUBLIC_URL: 'home',
          headFirst: '',
          headLast: '',
          bodyFirst: '',
          bodyLast: ''
        }
      }
    ]
    expect(getViewsConfig(viewConfig)).toEqual(expected)
  })

  it('should set entry to .ts file if .js file does not exist', () => {
    const viewConfig = {
      home: {}
    }
    const expected = [
      {
        key: 'home',
        entry: 'src/pages/home/index.ts',
        filename: 'home/index.html',
        entryDir: 'src/pages/home',
        data: {
          PUBLIC_URL: 'home',
          headFirst: '',
          headLast: '',
          bodyFirst: '',
          bodyLast: ''
        }
      }
    ]
    expect(getViewsConfig(viewConfig)).toEqual(expected)
  })
})
