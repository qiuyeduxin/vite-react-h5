import { vi as jest } from 'vitest'
import ImgUtils from '../imgUtils'

const retrieveGlobalObject = () => {
  if (typeof window !== 'undefined') {
    return window
  }

  return global
}

describe('utils/imgUtils', () => {
  let mockImage: Record<string, any>

  beforeEach(() => {
    mockImage = {
      src: '',
      onload: jest.fn,
      onerror: jest.fn,
      addEventListener(type: string, fn: Function) {
        if (type === 'load') {
          mockImage.onload(fn)
        } else if (type === 'error') {
          mockImage.onerror(new Error('Image load failed'))
        }
      }
    }
    const globalObj = retrieveGlobalObject()
    globalObj.Image = jest.fn(() => mockImage) as any
    jest.spyOn(mockImage, 'onload')
    jest.spyOn(mockImage, 'onerror')
    jest.spyOn(mockImage, 'addEventListener')
  })

  afterEach(() => {
    mockImage.src = ''
    ImgUtils.IMGS_CACHE = {}
  })

  it('should return the URL if it exists in the cache', async () => {
    const url = 'http://example.com/image.jpg'
    mockImage.onload.mockImplementation((successCallback: Function) => {
      successCallback()
    })
    const resUrl = await ImgUtils.load(url)
    expect(resUrl).toBe(url)
  })

  it('should load the image and add it to the cache if not in cache', async () => {
    const url = 'http://example.com/image.jpg'
    mockImage.onload.mockImplementation((successCallback: Function) => {
      successCallback()
    })

    const resUrl = await ImgUtils.load(url)
    expect(resUrl).toBe(url)
    expect(ImgUtils.IMGS_CACHE[url]).toBe(url)
  })

  it('should reject the promise if the image fails to load', async () => {
    const url = 'http://example.com/image.jpg'
    const error = new Error('Image load failed')
    mockImage.onload.mockImplementation(() => {
      throw error
    })

    try {
      await ImgUtils.load(url)
    } catch (err) {
      expect(err).toBe(error)
    }
  })
})
