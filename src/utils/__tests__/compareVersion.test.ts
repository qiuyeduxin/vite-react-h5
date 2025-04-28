import { compareVersion } from '../index' // 假设文件名为 compareVersion.ts

describe('utils/compareVersion', () => {
  it('should return 0 when versions are equal', () => {
    expect(compareVersion('1.0.0', '1.0.0')).toBe(0)
  })

  it('should return 1 when currentVersion is greater', () => {
    expect(compareVersion('1.0.1', '1.0.0')).toBe(1)
  })

  it('should return -1 when currentVersion is less', () => {
    expect(compareVersion('1.0.0', '1.0.1')).toBe(-1)
  })

  it('should return 1 when currentVersion is longer with non-zero extra parts', () => {
    expect(compareVersion('1.0.0.1', '1.0.0')).toBe(1)
  })

  it('should return -1 when preVersion is longer with non-zero extra parts', () => {
    expect(compareVersion('1.0.0', '1.0.0.1')).toBe(-1)
  })

  it('should return 0 when currentVersion is longer with zero extra parts', () => {
    expect(compareVersion('1.0.0.0', '1.0.0')).toBe(0)
  })

  it('should return 0 when preVersion is longer with zero extra parts', () => {
    expect(compareVersion('1.0.0', '1.0.0.0')).toBe(0)
  })

  it('should handle non-numeric characters gracefully', () => {
    expect(compareVersion('1.0.a', '1.0.0')).toBe(0)
  })

  it('should handle empty version strings', () => {
    expect(compareVersion('', '')).toBe(0)
  })

  it('should handle different length versions with leading zeros', () => {
    expect(compareVersion('1.0.00', '1.0.0')).toBe(0)
  })
})
