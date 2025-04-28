import { pxToRemVw } from '../dom' // 根据实际路径调整

describe('utils/pxToRemVw', () => {
  it('should convert px to rem with default targetUnit', () => {
    process.env.VIEW_WIDTH = '16' // 假设基础像素值为16px
    expect(pxToRemVw(32)).toBe('2.000000rem')
  })

  it('should convert px to vw when targetUnit is vw', () => {
    process.env.VIEW_WIDTH = '1000' // 假设基础像素值为1000px
    expect(pxToRemVw(50, 'vw')).toBe('5.000000vw')
  })

  it('should handle undefined VIEW_WIDTH gracefully', () => {
    delete process.env.VIEW_WIDTH // 删除环境变量
    expect(pxToRemVw(32)).toBe('NaNrem') // 由于未定义的VIEW_WIDTH，预期结果为NaN
  })
})
