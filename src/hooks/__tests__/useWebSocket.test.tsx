import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { vi as jest } from 'vitest'
import { mockTracking } from './moduleMock'
import useWebSocket from '../useWebSocket'

const retrieveGlobalObject = () => {
  if (typeof window !== 'undefined') {
    return window
  }

  return global
}

const setUp = (url: string, options: Record<string, any>) =>
  renderHook(() => useWebSocket(url, options))

describe('useWebSocket', () => {
  let mockWebSocket: Record<string, any>
  jest.useFakeTimers()

  beforeEach(() => {
    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn(),
      onopen: jest.fn(),
      onclose: null,
      onerror: null,
      onmessage: null,
      readyState: 1
    } as any

    const globalObj = retrieveGlobalObject()
    globalObj.WebSocket = jest.fn(() => mockWebSocket) as any
    jest.spyOn(mockWebSocket, 'send')
    jest.spyOn(mockTracking, 'report')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create WebSocket connection when URL and joinParams are provided', () => {
    setUp('ws://example.com', { joinParams: 'join' })
    jest.advanceTimersByTime(100)
    act(() => {
      mockWebSocket.onopen()
    })
    expect(global.WebSocket).toHaveBeenCalledWith('ws://example.com')
    expect(mockWebSocket.send).toHaveBeenCalledWith('join')
  })

  it('should not create WebSocket connection when URL are missing', () => {
    setUp('', { joinParams: 'join' })
    expect(global.WebSocket).not.toHaveBeenCalled()
  })

  it('should not create WebSocket connection when joinParams are missing', () => {
    setUp('ws://example.com', {})
    expect(global.WebSocket).not.toHaveBeenCalled()
  })

  it('should handle WebSocket open event', () => {
    setUp('ws://example.com', { joinParams: 'join', pageName: '/open' })

    act(() => {
      mockWebSocket.onopen()
    })

    expect(mockWebSocket.send).toHaveBeenCalledWith('join')
    expect(mockTracking.report).toHaveBeenCalledWith('WebSocket-open', {
      msg: '连接成功'
    })
  })

  it('should handle WebSocket error event', () => {
    setUp('ws://example.com', { joinParams: 'join', pageName: '/error' })

    act(() => {
      mockWebSocket.onerror({ code: 1000 })
    })

    expect(mockTracking.report).toHaveBeenCalledWith('WebSocket-error', {
      msg: '连接失败',
      error: { code: 1000 }
    })
  })

  it('should handle WebSocket close event', () => {
    setUp('ws://example.com', { joinParams: 'join', pageName: '/close' })

    act(() => {
      mockWebSocket.onclose({ code: 1000 })
    })

    expect(mockTracking.report).toHaveBeenCalledWith('WebSocket-close', {
      msg: '断开连接',
      error: { code: 1000 }
    })
  })

  it('should handle WebSocket message event', async () => {
    const { result } = setUp('ws://example.com', { joinParams: 'join' })

    act(() => {
      mockWebSocket.onmessage({ data: JSON.stringify({ key: 'value' }) })
    })

    const c = await result.current
    expect(c[1]).toEqual({ key: 'value' })
  })

  it('should send heartbeat messages', () => {
    setUp('ws://example.com', { joinParams: 'join', heartParams: 'heartbeat' })

    act(() => {
      mockWebSocket.onopen()
    })

    expect(mockWebSocket.send).toHaveBeenCalledWith('join')
  })
})
