import type { IObject } from 'src/types'
import reportWebVitals, { PerfEntry } from './reportWebVitals'
import type { LogPerfOptions } from './types'

class PerformanceMonitor {
  private resourceWhiteList: string[] = [
    'edith',
    'api.ipfoxy.com',
    'sockjs-node/info',
    'speed.ilink'
  ]

  browser(userAgent: string, _vendor: string = '', opera?: string): string {
    if (opera || userAgent.includes(' OPR/')) {
      if (userAgent.includes('Mini')) {
        return 'Opera Mini'
      }
      return 'Opera'
    } else if (/(BlackBerry|PlayBook|BB10)/i.test(userAgent)) {
      return 'BlackBerry'
    } else if (userAgent.includes('IEMobile') || userAgent.includes('WPDesktop')) {
      return 'Internet Explorer Mobile'
    } else if (userAgent.includes('SamsungBrowser/')) {
      // https://developer.samsung.com/internet/user-agent-string-format
      return 'Samsung Internet'
    } else if (userAgent.includes('Edge') || userAgent.includes('Edg/')) {
      return 'Microsoft Edge'
    } else if (userAgent.includes('FBIOS')) {
      return 'Facebook Mobile'
    } else if (userAgent.includes('Chrome')) {
      return 'Chrome'
    } else if (userAgent.includes('CriOS')) {
      return 'Chrome iOS'
    } else if (userAgent.includes('UCWEB') || userAgent.includes('UCBrowser')) {
      return 'UC Browser'
    } else if (userAgent.includes('FxiOS')) {
      return 'Firefox iOS'
    } else if (userAgent.includes('Apple')) {
      if (userAgent.includes('Mobile')) {
        return 'Mobile Safari'
      }
      return 'Safari'
    } else if (userAgent.includes('Android')) {
      return 'Android Mobile'
    } else if (userAgent.includes('Konqueror')) {
      return 'Konqueror'
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox'
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
      return 'Internet Explorer'
    } else if (userAgent.includes('Gecko')) {
      return 'Mozilla'
    } else {
      return ''
    }
  }

  referringDomain(referrer: string): string {
    const split = referrer.split('/')
    if (split.length >= 3) {
      return split[2]
    }
    return ''
  }

  device(userAgent: string): string {
    if (/Windows Phone/i.test(userAgent) || /WPDesktop/.test(userAgent)) {
      return 'Windows Phone'
    } else if (/iPad/.test(userAgent)) {
      return 'iPad'
    } else if (/iPod/.test(userAgent)) {
      return 'iPod Touch'
    } else if (/iPhone/.test(userAgent)) {
      return 'iPhone'
    } else if (/(BlackBerry|PlayBook|BB10)/i.test(userAgent)) {
      return 'BlackBerry'
    } else if (/Android/.test(userAgent)) {
      return 'Android'
    } else {
      return ''
    }
  }

  os(a: string): string {
    if (/Windows/i.test(a)) {
      if (/Phone/.test(a) || /WPDesktop/.test(a)) {
        return 'Windows Phone'
      }
      return 'Windows'
    } else if (/(iPhone|iPad|iPod)/.test(a)) {
      return 'iOS'
    } else if (/Android/.test(a)) {
      return 'Android'
    } else if (/(BlackBerry|PlayBook|BB10)/i.test(a)) {
      return 'BlackBerry'
    } else if (/Mac/i.test(a)) {
      return 'Mac OS X'
    } else if (/Linux/.test(a)) {
      return 'Linux'
    } else if (/CrOS/.test(a)) {
      return 'Chrome OS'
    } else {
      return ''
    }
  }

  /**
   * This function detects which browser version is running this script,
   * parsing major and minor version (e.g., 42.1). User agent strings from:
   * http://www.useragentstring.com/pages/useragentstring.php
   */
  browserVersion(userAgent: string, vendor?: string, opera?: string) {
    const browser = this.browser(userAgent, vendor, opera)
    const versionRegexs: IObject = {
      'Internet Explorer Mobile': /rv:(\d+(\.\d+)?)/,
      'Microsoft Edge': /Edge?\/(\d+(\.\d+)?)/,
      Chrome: /Chrome\/(\d+(\.\d+)?)/,
      'Chrome iOS': /CriOS\/(\d+(\.\d+)?)/,
      'UC Browser': /(UCBrowser|UCWEB)\/(\d+(\.\d+)?)/,
      Safari: /Version\/(\d+(\.\d+)?)/,
      'Mobile Safari': /Version\/(\d+(\.\d+)?)/,
      Opera: /(Opera|OPR)\/(\d+(\.\d+)?)/,
      Firefox: /Firefox\/(\d+(\.\d+)?)/,
      'Firefox iOS': /FxiOS\/(\d+(\.\d+)?)/,
      Konqueror: /Konqueror:(\d+(\.\d+)?)/,
      BlackBerry: /BlackBerry (\d+(\.\d+)?)/,
      'Android Mobile': /android\s(\d+(\.\d+)?)/,
      'Samsung Internet': /SamsungBrowser\/(\d+(\.\d+)?)/,
      'Internet Explorer': /(rv:|MSIE )(\d+(\.\d+)?)/,
      Mozilla: /rv:(\d+(\.\d+)?)/
    }
    const regex = versionRegexs[browser]
    if (regex === undefined) {
      return null
    }
    const matches = userAgent.match(regex)
    if (!matches) {
      return null
    }
    return parseFloat(matches[matches.length - 2])
  }

  getUserAgentInfo(userAgent: string): IObject {
    return {
      os: this.os(userAgent),
      browser: this.browser(userAgent, navigator.vendor, ''),
      device: this.device(userAgent),
      browserVersion: this.browserVersion(userAgent, navigator.vendor, ''),
      screenHeight: window.screen.height,
      screenWidth: window.screen.width,
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth
    }
  }

  // 获取页面加载数据
  getPageTimeData(isTiming: boolean): IObject {
    const timeData: any = isTiming
      ? window.performance.timing
      : window.performance.getEntriesByType('navigation')[0]
    const {
      fetchStart,
      domainLookupStart,
      domainLookupEnd,
      connectStart,
      connectEnd,
      secureConnectionStart,
      requestStart,
      responseStart,
      responseEnd,
      domInteractive,
      domContentLoadedEventStart,
      domContentLoadedEventEnd,
      loadEventStart
    } = timeData

    return {
      startTime: fetchStart,
      // First Paint Time，首次渲染间（白屏时间）: 从请求开始到浏览器开始解析第一批HTML文档字节的时间差。。
      fpTime: Math.round(responseEnd - fetchStart),
      // Time to Interact，首次可交互时间: 浏览器完成所有HTML解析并且完成DOM构建，此时浏览器开始加载资源。。
      ttiTime: Math.round(domInteractive - fetchStart),
      // HTML加载完成时间， 即DOM Ready时间: 如果页面有同步执行的JS，则同步JS执行时间 = ready - tti。。
      readyTime: Math.round(domContentLoadedEventStart - fetchStart),
      // 页面完全加载时间: load = 首次渲染时间 + DOM解析耗时 + 同步JS执行 + 资源加载耗时。
      loadTime: Math.round(loadEventStart - fetchStart),
      // 首包时间
      firstbyteTime: Math.round(responseStart - domainLookupStart),
      // DNS查询耗时
      dnsTime: Math.round(domainLookupEnd - domainLookupStart),
      // TCP连接耗时
      tcpTime: Math.round(connectEnd - connectStart),
      // Time to First Byte（TTFB），请求响应耗时。
      ttfbTime: Math.round(responseStart - requestStart),
      // 内容传输耗时
      transTime: Math.round(responseEnd - responseStart),
      // DOM解析耗时
      domTime: Math.round(domInteractive - responseEnd),
      // 资源加载耗时(表示页面中的同步加载资源)
      resTime: Math.round(loadEventStart - domContentLoadedEventEnd),
      // SSL安全连接耗时(只在HTTPS下有效)
      sslTime: secureConnectionStart ? Math.round(connectEnd - secureConnectionStart) : null
    }
  }

  underscoreToCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, function (_match, p1) {
      return p1.toUpperCase()
    })
  }

  // 获取页面资源加载数据
  getResourcePerf(): string[] {
    const performance = window.performance
    const resourceTimes = performance.getEntriesByType('resource') || []
    const prefs: string[] = []
    resourceTimes
      .filter(
        (item) =>
          !this.resourceWhiteList.find((url) => item.name?.includes(url)) &&
          !/192|localhost/g.test(item.name)
      )
      .forEach(
        ({
          name,
          initiatorType,
          duration,
          domainLookupEnd,
          domainLookupStart,
          connectEnd,
          connectStart,
          secureConnectionStart
        }) => {
          const url = new URL(name)
          let type = initiatorType
          if (initiatorType === 'css' && /\.(jp(e)?g|png)/.test(url.pathname)) {
            type = 'img'
          }
          const dnsTime = Math.round(domainLookupEnd - domainLookupStart)
          const tcpTime = Math.round(connectEnd - connectStart)
          const sslTime = secureConnectionStart
            ? Math.round(connectEnd - secureConnectionStart)
            : 'null'

          prefs.push(
            [url.hostname + url.pathname, type, ~~duration, ~~dnsTime, ~~tcpTime, ~~sslTime].join(
              '|'
            )
          )
        }
      )

    return prefs
  }

  logPackage(logFn: Function, webVitalParams: IObject<string | number>) {
    // const resourceList = this.getTimeoutRes()
    const { userAgent } = navigator
    const pageTimeData = this.getPageTimeData(
      !window.performance.getEntriesByType('navigation').length
    )
    const userAgentInfo = this.getUserAgentInfo(userAgent)

    // 如果页面数据取到，防止performance.getEntriesByType('navigation')和performance.timing都不存在情况
    if (pageTimeData) {
      // 上传页面数据到后台
      const webPerfList = [
        'fcpTime',
        'ttfbTime',
        'readyTime',
        'loadTime',
        'fpTime',
        'ttiTime',
        'firstbyteTime',
        'dnsTime',
        'tcpTime',
        'transTime',
        'domTime',
        'resTime',
        'sslTime'
      ]

      const params: LogPerfOptions = {
        perf: '',
        os: '',
        screen: ''
      }
      const finallyPerfData = {
        ...pageTimeData,
        ...webVitalParams
      }
      webPerfList.forEach((key, index) => {
        let val = finallyPerfData[key]
        if (!val) {
          val = `${val}` === '0' ? 0 : -1
        }

        params.perf += `${index ? '|' : ''}${val}`
      })
      const osList = ['os', 'browser', 'device', 'browserVersion']
      osList.forEach((key, index) => {
        params.os += `${index ? '|' : ''}${userAgentInfo[key]}`
      })

      const screenList = ['screenWidth', 'screenHeight', 'windowWidth', 'windowHeight']
      screenList.forEach((key, index) => {
        params.screen += `${index ? '|' : ''}${userAgentInfo[key]}`
      })

      params.resources = this.getResourcePerf() as string[]

      logFn(params)
    }

    // 如果超时资源文件存在
    // if (resourceList.length) {
    //   // 上传超时资源文件数据到后台
    //   logService.reportPerformance({ url, userAgent, resourceList })
    // }
  }

  init(logFn: Function) {
    const webVitals: PerfEntry[] = []
    reportWebVitals((data: PerfEntry) => {
      webVitals.push(data)
      if (webVitals.length === 2) {
        const params: Record<string, number> = {}
        webVitals.forEach((item) => {
          params[item.name] = Math.round(item.value)
        })
        this.logPackage(logFn, params)
      }
    })
  }
}

const performanceService = new PerformanceMonitor()

export default performanceService
