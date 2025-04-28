import { getIosVersion, getAndroidVersion, getWeixinVersion } from '../index' // Adjust the import path as necessary

describe('utils/getVersion', () => {
  describe('getIosVersion', () => {
    it('should return the correct version for iOS 9.3.2', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13E233 Safari/601.1',
        writable: true
      })
      expect(getIosVersion()).toBe('9.3.2')
    })

    it('should return the correct version for iOS 9.0', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13E233 Safari/601.1',
        writable: true
      })
      expect(getIosVersion()).toBe('9.0')
    })

    it('should return an empty string for non-iOS user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        writable: true
      })
      expect(getIosVersion()).toBe('')
    })
  })

  describe('getAndroidVersion', () => {
    it('should return an empty string when the user agent does not contain "android"', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        writable: true
      })
      expect(getAndroidVersion()).toBe('')
    })

    it('should return the correct Android version when the user agent contains "android"', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
        writable: true
      })
      expect(getAndroidVersion()).toBe('10')
    })

    it('should return the first Android version when multiple versions are present in the user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Linux; Android 9; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36 Android 10',
        writable: true
      })
      expect(getAndroidVersion()).toBe('9')
    })
  })

  describe('getWeixinVersion', () => {
    let originalUserAgent: string

    beforeEach(() => {
      originalUserAgent = navigator.userAgent
    })

    afterEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        writable: true
      })
    })

    it('should return the correct version when MicroMessenger is present in the userAgent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1 MicroMessenger/1.2.3',
        writable: true
      })

      expect(getWeixinVersion()).toBe('1.2.3')
    })

    it('should return an empty string when MicroMessenger is not present in the userAgent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
        writable: true
      })

      expect(getWeixinVersion()).toBe('')
    })

    it('should return an empty string when MicroMessenger is present but without a version number', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1 MicroMessenger/',
        writable: true
      })

      expect(getWeixinVersion()).toBe('')
    })
  })
})
