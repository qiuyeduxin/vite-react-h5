import { vi as jest } from 'vitest'
import AudioUtils from '../audioUtils'

const retrieveGlobalObject = () => {
  if (typeof window !== 'undefined') {
    return window
  }

  return global
}

describe('utils/AudioUtils', () => {
  let mockAudio: Record<string, any>

  beforeEach(() => {
    mockAudio = {
      src: '',
      onload: jest.fn,
      onerror: jest.fn,
      play: jest.fn,
      pause: jest.fn,
      addEventListener(_type: string, _fn: Function) {}
    }
    const globalObj = retrieveGlobalObject()
    const documentMock = {
      createElement: jest.fn(() => mockAudio)
    }
    globalObj.document = documentMock as any
    jest.spyOn(mockAudio, 'onload')
    jest.spyOn(mockAudio, 'onerror')
    jest.spyOn(mockAudio, 'play')
    jest.spyOn(mockAudio, 'pause')
    jest.spyOn(mockAudio, 'addEventListener')
  })

  afterEach(() => {
    mockAudio.src = ''
    AudioUtils.cacheMap = {}
  })

  it('should return the URL if it exists in the cache', async () => {
    const url = 'http://example.com/test.mp3'
    const p = AudioUtils.load(url)
    mockAudio.onload()
    await p
    expect(AudioUtils.cacheMap[url].src).toBe(url)
  })

  it('should reject the promise if the audio fails to load', async () => {
    const url = 'http://example.com/test.mp3'
    const error = new Error('audio load failed')

    try {
      const p = AudioUtils.load(url)
      mockAudio.onerror(error)
      await p
    } catch (err) {
      expect(err).toBe(error)
    }
  })
})
