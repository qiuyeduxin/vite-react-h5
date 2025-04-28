import { getHrefByBridge } from '../index'

describe('getHrefByBridge', () => {
  const originalLocation = window.location

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:3000?name=John&age=30&city=York',
        origin: 'http://localhost:3000'
      }
    })
  })

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    })
  })

  it('should return "javascript: void(0)" when url is empty', () => {
    expect(getHrefByBridge('')).toBe('javascript: void(0)')
  })

  it('should append hash to the URL if provided', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:3000?htmlBar=true',
        origin: 'http://localhost:3000'
      }
    })
    expect(getHrefByBridge('/test', {}, 'hash')).toBe(
      'http://localhost:3000/test?htmlBar=true#hash'
    )
  })

  it('should handle empty search object', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost:3000?htmlBar=true',
        origin: 'http://localhost:3000'
      }
    })
    expect(getHrefByBridge('/test', {})).toBe('http://localhost:3000/test?htmlBar=true')
  })

  // it('should handle complex search object', () => {
  //   Object.defineProperty(window, 'location', {
  //     writable: true,
  //     value: {
  //       href: 'http://localhost:3000?htmlBar=true',
  //       origin: 'http://localhost:3000'
  //     }
  //   })
  //   expect(getHrefByBridge('/test', { param1: { nested: 'value' } })).toBe(
  //     'http://localhost:3000/test?htmlBar=true&param1=%7B%22nested%22%3A%22value%22%7D'
  //   )
  // })
})
