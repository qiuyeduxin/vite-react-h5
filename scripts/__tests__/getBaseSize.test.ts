import { getBaseSize } from '../utils' // 替换为实际模块路径
import { View } from '../plugins/htmlMpa/types' // 替换为实际模块路径

describe('getBaseSize', () => {
  const VIEW_WIDTH = Number(process.env.VIEW_WIDTH) || 750
  const baseView = { entry: '', filename: '', key: '', entryDir: '' }

  it('should return VIEW_WIDTH for an empty array', () => {
    expect(getBaseSize([])).toBe(VIEW_WIDTH)
  })

  it('should return VIEW_WIDTH for a single view with undefined baseSize', () => {
    const views: View[] = [{ ...baseView, data: {} }]
    expect(getBaseSize(views)).toBe(VIEW_WIDTH)
  })

  it('should return the defined baseSize for a single view', () => {
    const baseSize = 200
    const views: View[] = [{ ...baseView, data: { baseSize } }]
    expect(getBaseSize(views)).toBe(baseSize)
  })

  it('should return the baseSize for multiple views with the same baseSize', () => {
    const baseSize = 300
    const views: View[] = [1, 2, 3].map((i) => ({ ...baseView, data: { baseSize } }))
    expect(getBaseSize(views)).toBe(baseSize)
  })

  it('should throw an error for multiple views with different baseSizes', () => {
    const views: View[] = [
      { ...baseView, data: { baseSize: 400 } },
      { ...baseView, data: { baseSize: 500 } }
    ]
    expect(() => getBaseSize(views)).toThrow('baseSize must be the same')
  })
})
