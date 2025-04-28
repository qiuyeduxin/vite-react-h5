import { getSingleton } from '..' // 假设文件名为 getSingleton.ts

describe('utils/getSingleton', () => {
  it('should call the function once and return the result on subsequent calls', () => {
    let callCount = 0
    const fn = (x: number) => {
      callCount++
      return x * 2
    }

    const singleton = getSingleton(fn)

    expect(singleton(5)).toBe(10) // 第一次调用，应返回 10
    expect(callCount).toBe(1) // 验证 fn 被调用了一次

    expect(singleton(5)).toBe(10) // 后续调用，应返回相同的 10
    expect(callCount).toBe(1) // 验证 fn 没有被再次调用
  })

  it('should handle functions with different arguments', () => {
    const fn = (x: number, y: number) => x + y
    const singleton = getSingleton(fn)

    expect(singleton(3, 4)).toBe(7) // 第一次调用，应返回 7
    expect(singleton(5, 6)).toBe(7) // 后续调用，应返回相同的 7
  })

  it('should handle functions with no arguments', () => {
    const fn = () => 42
    const singleton = getSingleton(fn)

    expect(singleton()).toBe(42) // 第一次调用，应返回 42
    expect(singleton()).toBe(42) // 后续调用，应返回相同的 42
  })

  it('should handle functions with side effects', () => {
    let sideEffect = 0
    const fn = () => {
      sideEffect++
      return sideEffect
    }
    const singleton = getSingleton(fn)

    expect(singleton()).toBe(1) // 第一次调用，应返回 1
    expect(singleton()).toBe(1) // 后续调用，应返回相同的 1
    expect(sideEffect).toBe(1) // 验证副作用只发生了一次
  })
})
