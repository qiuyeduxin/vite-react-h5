import { lockAsyncFunction } from '../index' // 假设文件名为 lockAsyncFunction.ts

describe('utils/lockAsyncFunction', () => {
  it('should execute the function if it is not already running', async () => {
    let called = false
    const fn = async () => {
      called = true
      return 'result'
    }

    const lockedFn = lockAsyncFunction(fn)
    const result = await lockedFn()

    expect(called).toBe(true)
    expect(result).toBe('result')
  })

  it('should ignore subsequent calls while the function is running', async () => {
    let callCount = 0
    const fn = async () => {
      callCount++
      await new Promise((resolve) => setTimeout(resolve, 100))
      return 'result'
    }

    const lockedFn = lockAsyncFunction(fn)
    const promise1 = lockedFn()
    const promise2 = lockedFn()

    const result1 = await promise1
    const result2 = await promise2

    expect(callCount).toBe(1)
    expect(result1).toBe('result')
    expect(result2).toBeUndefined()
  })

  it('should allow subsequent calls after the function has finished running', async () => {
    let callCount = 0
    const fn = async () => {
      callCount++
      await new Promise((resolve) => setTimeout(resolve, 100))
      return 'result'
    }

    const lockedFn = lockAsyncFunction(fn)
    const promise1 = lockedFn()
    await promise1

    const promise2 = lockedFn()
    const result2 = await promise2

    expect(callCount).toBe(2)
    expect(result2).toBe('result')
  })
})
