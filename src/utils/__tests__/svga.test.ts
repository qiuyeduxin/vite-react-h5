import { vi as jest } from 'vitest'
import { SVGA } from './moduleMock'
import svgaMs from '../svga'

describe('utils/svga', () => {
  let parserMock: any
  let playerMock: any
  let documentMock: any

  beforeEach(() => {
    parserMock = {
      load: jest.fn()
    }
    playerMock = {
      onFinished: jest.fn(),
      onFrame: jest.fn(),
      setVideoItem: jest.fn(),
      startAnimation: jest.fn()
    }
    documentMock = {
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      },
      createElement: jest.fn(() => ({
        setAttribute: jest.fn(),
        style: {}
      }))
    }

    // 模拟 SVGA.Parser 和 SVGA.Player
    SVGA.Parser = jest.fn(() => parserMock)
    SVGA.Player = jest.fn(() => playerMock)
    jest.spyOn(parserMock, 'load')
    jest.spyOn(playerMock, 'setVideoItem')
    jest.spyOn(playerMock, 'onFinished')
    jest.spyOn(playerMock, 'onFrame')
    jest.spyOn(playerMock, 'startAnimation')
    document = documentMock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('load', () => {
    it('should return cached video item if URL exists in svgaMap', async () => {
      const url = 'test-url'
      const cachedVideoItem = { id: 1 }
      svgaMs.svgaMap[url] = cachedVideoItem
      const result = await svgaMs.load(url)
      expect(result).toBe(cachedVideoItem)
    })
    it('should load video item and cache it if URL does not exist in svgaMap', async () => {
      const url = 'test-url'
      const videoItem = { id: 1 }
      parserMock.load.mockImplementation((_url: string, successCallback: Function) => {
        successCallback(videoItem)
      })
      const result = await svgaMs.load(url)
      expect(result).toStrictEqual(videoItem)
      expect(svgaMs.svgaMap[url]).toStrictEqual(videoItem)
    })

    it('should reject promise if loading fails', async () => {
      const url = 'test-url'
      const error = new Error('Load failed')
      parserMock.load.mockImplementation(
        (_url: string, _successCallback: Function, errorCallback: Function) => {
          errorCallback(error)
        }
      )
      try {
        await svgaMs.load(url)
      } catch (err) {
        expect(err).toBe(error)
        expect(svgaMs.svgaMap[url]).toBeUndefined()
      }
    })
  })

  describe('preload', () => {
    it('should do nothing if URL array is empty', () => {
      svgaMs.preload()
      expect(parserMock.load).not.toHaveBeenCalled()
    })

    it('should preload URLs that do not exist in svgaMap', () => {
      const urls = ['url1', 'url2']
      svgaMs.preload(...urls)
      expect(parserMock.load).toHaveBeenCalledTimes(2)
    })

    it('should not preload URLs that already exist in svgaMap', () => {
      const url = 'existing-url'
      svgaMs.svgaMap[url] = { id: 1 }
      svgaMs.preload(url)
      expect(parserMock.load).not.toHaveBeenCalled()
    })
  })

  describe('play', () => {
    it('should play video if already loaded', async () => {
      const url = 'test-url'
      const videoItem = { id: 1 }
      svgaMs.svgaMap[url] = videoItem

      await svgaMs.play({ selector: '#svga-anim', url })

      expect(playerMock.setVideoItem).toHaveBeenCalledWith(videoItem)
      expect(playerMock.startAnimation).toHaveBeenCalled()
    })

    it('should load and play video if not already loaded', async () => {
      const url = 'test-url-not-already-loaded'
      const videoItem = { id: 1 }
      parserMock.load.mockImplementation((_url: string, successCallback: Function) => {
        successCallback(videoItem)
      })

      await svgaMs.play({ selector: '#svga-anim', url })

      expect(parserMock.load).toHaveBeenCalledWith(url, expect.any(Function), expect.any(Function))
      expect(playerMock.setVideoItem).toHaveBeenCalledWith(videoItem)
      expect(playerMock.startAnimation).toHaveBeenCalled()
    })

    it('should handle load failure', async () => {
      const url = 'test-url-failure'
      const error = new Error('Load failed failure')
      parserMock.load.mockImplementation(
        (_url: string, _successCallback: Function, errorCallback: Function) => {
          errorCallback(error)
        }
      )
      try {
        await svgaMs.play({ selector: '#svga-anim', url })
      } catch (err) {
        expect(err).toBe(error)
      }
    })

    it('should call onFinished callback when animation finishes', async () => {
      const url = 'test-url-animation-finishes'
      const videoItem = { id: 1 }
      svgaMs.svgaMap[url] = videoItem
      const onFinished = jest.fn()

      await svgaMs.play({ selector: '#svga-anim', url, onFinished })

      expect(playerMock.onFinished).toHaveBeenCalledWith(onFinished)
    })

    it('should call onFrame callback on each frame', async () => {
      const url = 'test-url-each-frame'
      const videoItem = { id: 1 }
      svgaMs.svgaMap[url] = videoItem
      const onFrame = jest.fn()

      await svgaMs.play({ selector: '#svga-anim', url, onFrame })

      expect(playerMock.onFrame).toHaveBeenCalledWith(onFrame)
    })
  })
})
