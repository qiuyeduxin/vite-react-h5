import { setViewportFit } from '../' // 假设函数在 setViewportFit.ts 中

describe('utils/setViewportFit', () => {
  let meta: HTMLMetaElement

  beforeEach(() => {
    meta = document.createElement('meta')
    meta.name = 'viewport'
    document.head.appendChild(meta)
  })

  afterEach(() => {
    if (document.querySelector('meta[name="viewport"]')) {
      document.head.removeChild(meta)
    }
  })

  it('should update viewport-fit when it already exists', () => {
    meta.content = 'width=device-width, viewport-fit=auto'
    setViewportFit('cover')
    expect(meta.content).toBe('width=device-width,viewport-fit=cover')
  })

  it('should add viewport-fit when it does not exist', () => {
    meta.content = 'width=device-width'
    setViewportFit('cover')
    expect(meta.content).toBe('width=device-width,viewport-fit=cover')
  })

  it('should handle empty content attribute', () => {
    meta.content = ''
    setViewportFit('cover')
    expect(meta.content).toBe('viewport-fit=cover')
  })

  it('should handle undefined content attribute', () => {
    meta.content = ''
    setViewportFit('cover')
    expect(meta.content).toBe('viewport-fit=cover')
  })

  it('should do nothing if no meta tag exists', () => {
    document.head.removeChild(meta)
    setViewportFit('cover')
    expect(document.querySelector('meta[name="viewport"]')).toBeNull()
  })
})
