import type { CFun } from 'src/types'
import { noop } from 'es-toolkit'

const getUrlParams = (url: string = window.location.href): Record<string, string> => {
  const urlParams: Record<string, string> = {}

  if (!url.includes('?')) {
    return urlParams
  }

  // 防止hash值, 影响参数名称
  const search: string = url.replace(/.*\?/, '')

  // 如果没有, 则返回空对象
  if (search) {
    const searchArr: Array<string> = decodeURIComponent(search).split('&')
    searchArr.forEach((str) => {
      const [key, value] = str.split('=')
      // 如果已经有该参数就不添加进去了
      if (key && !urlParams[key]) {
        urlParams[key] = value
      }
    })
  }

  return urlParams
}

const stringifyParams = (params: Record<string, any>, cb?: CFun): string => {
  return Object.keys(params)
    .map((name) => {
      const val = params[name]
      const res = typeof cb === 'function' ? cb(val, name) : val
      return `${name}=${res}`
    })
    .join('&')
}

export const getUrlQuery = (key: string): string => {
  const urlParams = getUrlParams()
  return urlParams[key] || ''
}

/**
 * 金额格式化，最多保留两位小数，小数最后一位为0则不显示
 */
export const formatMoney = (money: string | number, unit = '万') => {
  if (!money) return 0
  if (isNaN(+money)) return money
  if (+money >= 100000000) return parseInt(+money / 1000000 + '') / 100 + '亿'
  if (+money >= 10000) return parseInt(+money / 100 + '') / 100 + unit
  return parseInt(money as string)
}

/**
 * 获取资源路径， 会把所有的资源文件打包，但是不会在html引入，只会按需，不适合活动类
 * @param localPath 本地相对路径
 * @returns 打包后的路径
 */
// export const getResource = (localPath: string): string => {
//   const modules: Record<string, any> = import.meta.glob('/src/**/*.{png,svg,jpg,jpeg,gif}', {
//     eager: true
//   })
//   return modules[localPath]?.default + ''
// }

/**
 * 设置 iPhoneX viewport 填充模式。
 * @param {"contain"|"cover"} mode
 */
export function setViewportFit(mode: string) {
  const meta = document.querySelector(`meta[name="viewport"]`)
  if (!meta) {
    return
  }
  const content = meta?.getAttribute('content')
  const parts = (content || '')
    .replace(/\s/g, '')
    .split(',')
    .map((token) => token.split('='))

  let index = -1

  for (let i = 0; i < parts.length; ++i) {
    if (parts[i][0] === 'viewport-fit') {
      index = i
      break
    }
  }

  if (~index) {
    parts[index][1] = mode
  } else {
    parts.push(['viewport-fit', mode])
  }

  meta &&
    meta.setAttribute(
      'content',
      parts
        .map((token) => token.join('='))
        .join(',')
        .replace(/^,/, '')
    )
}

function getUa(): Record<string, boolean> {
  const regs: Record<string, RegExp> = {
    // 系统
    // 'ios': /iphone|ipad|ipod/,
    android: /android/i,

    // 机型
    iphone: /iphone/i,
    ipad: /ipad/i,
    ipod: /ipod/i,
    vivo: /vivo/i,
    oppo: /oppo/i,
    huawei: /huawei/i,
    redmi: /redmi/i,
    xiaomi: /xiaomi/i,
    meizu: /meizu/i,

    // 环境
    weixin: /micromessenger/i, // 微信
    mqq: /QQ\//i, // qq
    app: /inke/i,
    alipay: /aliapp/i,
    weibo: /weibo/i,
    dingtalk: /DingTalk/i, // 钉钉

    // 浏览器
    chrome: /chrome\//i,
    qqbrowser: /MQQBrowser/i,
    baidu: /baidu/i
  }

  const ret: Record<string, boolean> = {}
  Object.keys(regs).forEach((key) => {
    var reg = regs[key]
    ret[key] = reg.test(window.navigator.userAgent)
  })
  ret.ios = ret.iphone || ret.ipad || ret.ipod
  ret.mobile = ret.ios || ret.android
  ret.pc = !ret.mobile

  ret.chrome = !!window.chrome

  // 经过多次坑验证, 只有在同时有uid 和 sid的时候, 才可以认为是映客环境, 其他的ua等等判断都不靠谱, 虽然有些low, 但是最稳定
  ret.isInke = !!(getUrlQuery('uid') && getUrlQuery('sid'))
  ret.isWindows = !!getUrlQuery('cv') && getUrlQuery('cv').includes('Windows')

  return ret
}

export const ua = getUa()

/**
 * 标志废弃的高阶函数
 * @param {String} fnName 函数名
 * @param {String} readmeUrl 提示地址
 * @example
 * const setAtomParamsWapper = deprecatedWrapper('setAtomParamsWapper', 'https')(() => {})
 * 详见可参考 src/decorator/service-assister.js
 */
export const deprecatedWrapper =
  (fnName: string, readmeUrl: string) =>
  (fn: (...args: any[]) => any) =>
  (...args: any[]) => {
    console.warn(`[boc.react]: 🚫${fnName || fn.name}已经废弃, 更多用法请参考: ${readmeUrl || ''}`)
    return fn(...args)
  }

/**
 * 单例
 * @param {Function} fn 被装饰的函数
 * @return {Function} 代理函数, 接收被装饰的函数一模一样的参数
 */
export function getSingleton(fn: CFun) {
  let result: any
  let flag: boolean = false
  return function singletonProxy(...args: any[]) {
    if (!flag) {
      flag = true
      return (result = fn.apply(null, args))
    } else {
      return result
    }
  }
}

/**
 * 锁定异步请求，请求未响应之前，多次调用函数只会执行一次。
 */
export function lockAsyncFunction(fn: CFun) {
  if (!fn || typeof fn !== 'function') {
    throw new Error('必须传入一个函数')
  }
  let isLookAsync = false
  return async function (...args: any[]) {
    if (isLookAsync) return
    isLookAsync = true
    const res = await fn.apply(null, args)
    isLookAsync = false
    return res
  }
}

/**
 * 在h5中通过bridge打开新的h5，只需要添加新增参数，原子参数客户端会拼接
 * 获取跳转路径
 * url='/innerapp/shopping/index.html'为页面路径
 * 只保留新增参数 search={ uid: 123 }
 * hash='shop'为跳转hash
 */
export function getHrefByBridge(url: string, search: Record<string, any> = {}, hash?: string) {
  // eslint-disable-next-line no-script-url
  if (!url) return 'javascript: void(0)'
  const forHash = hash ? '#' + hash : ''
  let defaultParam: Record<string, any> = {
    // 继承的上一页的新增参数，不包含在原子参数中
    htmlBar: getUrlParams().htmlBar // 导航栏开启状态
  }
  const forSearch = stringifyParams({ ...defaultParam, ...search })
  const param = forSearch ? '?' + forSearch : ''
  return window.location.origin + url + param + forHash
}

/**
 * url地址协议统一为https
 */
export const urlToHttps = (url: string) => {
  if (!url) return ''
  if (url.indexOf('http://') === 0) return url.replace('http://', 'https://')
  if (url.indexOf('//') === 0) return 'https:' + url
  return url
}

// 获取IOS的版本号
export const getIosVersion = (): string => {
  const ua = navigator.userAgent.toLowerCase()
  var version = ''
  if (ua.indexOf('like mac os x') > 0) {
    const reg = /os [\d._]+/gi
    const vInfo = ua.match(reg)
    version = (vInfo + '').replace(/[^0-9|_.]/gi, '').replace(/_/gi, '.') // 得到版本号9.3.2或者9.0
  }

  return version
}

// 获取Android的版本号
export const getAndroidVersion = (): string => {
  const ua = navigator.userAgent.toLowerCase()
  let version = ''
  if (ua.indexOf('android') > 0) {
    const reg = /android [\d._]+/gi
    const matchInfo = ua.match(reg)
    version = (matchInfo?.[0] || '').replace(/[^0-9|_.]/gi, '').replace(/_/gi, '.') // 得到版本号4.2.2
    // version = parseInt(version.split('.')[0]);// 得到版本号第一位
  }
  return version
}

// 获取微信的版本号
export const getWeixinVersion = (): string => {
  const wechatInfo = navigator.userAgent.match(/MicroMessenger\/([.\d]+)/i)
  return wechatInfo?.[1] || ''
}

/**
 * 比较版本号
 * @param  currentVersion, preVersion
 */
export const compareVersion = (currentVersion: string, preVersion: string) => {
  const arr1: string[] = currentVersion.split('.')
  const arr2: string[] = preVersion.split('.')
  const length1 = arr1.length
  const length2 = arr2.length
  const minlength = Math.min(length1, length2)
  let i = 0
  for (i; i < minlength; i++) {
    let a = parseInt(arr1[i] || '0')
    let b = parseInt(arr2[i] || '0')
    if (a > b) {
      return 1
    } else if (a < b) {
      return -1
    }
  }
  if (length1 > length2) {
    for (let j = i; j < length1; j++) {
      if (parseInt(arr1[j]) !== 0) {
        return 1
      }
    }
    return 0
  } else if (length1 < length2) {
    for (let j = i; j < length2; j++) {
      if (parseInt(arr2[j]) !== 0) {
        return -1
      }
    }
    return 0
  }
  return 0
}

/**
 * get uuid
 * @param len
 * @param radixA
 */
export const getUuid = (len?: number, radixA?: number): string => {
  const chars: string[] = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const uuid: string[] = []
  let i: number
  const radix = radixA || chars.length
  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
  } else {
    let r: number
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16)
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r]
      }
    }
  }
  return uuid.join('')
}

/**
 * 延迟 一会
 * @param {number} time 延迟时间
 * @returns {promise.Promise}
 */
export const delay = (time: number) => {
  return new Promise((resolve: (value?: unknown) => void) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export const isObject = (obj: unknown): boolean => {
  return toString.call(obj) === '[object Object]'
}

export { getUrlParams, stringifyParams, noop }
