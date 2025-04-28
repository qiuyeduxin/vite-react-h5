import fs from 'fs'
import path from 'path'
import scriptsMap from './scriptsMap'

const isEnvDevelopment = process.env.NODE_ENV === 'development'

/**
 * 读取页面文件
 * @param filePath
 * @return {string}
 */
export const readPagesFile = (filePath: string): string => {
  return fs.readFileSync(path.join(__dirname, `../pages/${filePath}`), 'utf-8')
}

interface BaseView extends Record<string, any> {
  title?: string
  keywords?: string
  description?: string
  isWeChat?: boolean
  headFirst?: string[]
  headLast?: string[]
  bodyFirst?: string[]
  bodyLast?: string[]
  baseSize?: number
}

/**
 * 获取统一的入口，参数说明
 */
const getEntryViewConfig = (opts: BaseView): BaseView => {
  const {
    title = '快月直播-真人实时互动社交直播',
    keywords = '快月,快月直播,1米直播,快月官网,直播,社交直播,快月下载,快月直播下载,视频社交',
    description = '快月直播是一款真人实时互动的视频社交软件',
    isWeChat = false,
    headFirst = [],
    headLast = [],
    bodyFirst = [],
    bodyLast = []
  } = opts

  const newConfig = {
    ...opts,
    title,
    keywords,
    description,
    headFirst,
    headLast,
    bodyFirst,
    bodyLast
  }

  if (isWeChat) {
    newConfig.headLast = [...headLast, scriptsMap.WX_SDK]
  }
  return newConfig
}

/**
 * 全量发布
 * @param entryConfig 需要全量发布的入口文件配置集合
 * const yanbin = require('./config/yanbin/innerapp')
 * const zhaojie = require('./config/zhaojie/index')
 * const entryConfig = { ...yanbin, ...zhaojie }
 * module.exports = fullAmountReleased(entryConfig)
 * */
export const fullAmountReleased = (entryConfig: Record<string, any>) =>
  Object.keys(entryConfig).reduce(
    (res, entryKey) => Object.assign(res, { ...entryConfig[entryKey] }),
    {}
  )

/**
 * @name views自定义配置
 * @desc 在这里定义自定的views配置，如分享，监控，baseSize等
 */
const viewsCustomConfig = {
  // edith 监控
  edith: {
    useEdith: true
  },

  withoutEdith: {
    useEdith: false
  },

  armsOnlyPage: {
    // 只开页面监控
    useArms: true
  },

  arms: {
    // 页面监控全开
    useArms: {
      disableHook: false
    }
  },

  activityArms: {
    // web活动监控配置
    useArms: {
      disableHook: false,
      pid: 'a1usb033ta@bcb0ca6381cf625'
    }
  },

  share: {
    // 分享
    headLast: isEnvDevelopment ? [scriptsMap.WX_SDK] : [scriptsMap.WX_SDK],
    headFirst: `<meta name="referrer" content="no-referrer-when-downgrade">`
  }
}

// 业务配置注入器
const customConfigInjector =
  (...configList: any[]) =>
  (fn: (...fnArgs: any[]) => void) => {
    return function createViewProxy(...rest: any[]) {
      const entryMap = fn(...rest) // 基础的viewsMap

      return configList.reduce((viewsMap, config) => {
        // 先遍历配置列表，把里面的配置添加到内部每一项
        return Object.entries(viewsMap).reduce((views, [key, value]: [string, any]) => {
          views[key] = Object.assign(value, config)
          return views
        }, {} as Record<string, any>)
      }, entryMap)
    }
  }

/**
 * @name 创建views基础生成函数
 * @desc 通过key value形式创建views，不带任何配置，通过高阶函数来增强其功能，在单entry中优势不明显，在多entry项目中节省冗余代码
 * @param {Object} entryMap key是page路径，value是项目title
 * @param {Object} customOptions 自定义viewConfig，可以在不多写viewConfig业务中临时写自己的config
 * @example
 * exports.TEXT_PAGE = createBaseEntryView({ 'innerapp/hour-rank': '小时榜' }, { baseSize: 100 })
 */
const createBaseEntryView = (entryMap: Record<string, any> = {}, customOptions = {}) => {
  return Object.keys(entryMap).reduce((viewsMap, activityPagePath: string) => {
    const title: string = entryMap[activityPagePath] as string
    viewsMap[activityPagePath] = getEntryViewConfig({
      title,
      ...customOptions
    })
    return viewsMap
  }, {} as Record<string, any>)
}

// 基础baseView，直播间弹窗类，不需要分享的基础功能类常用
export const createBaseView = createBaseEntryView

// views增强器，增加分享功能
const shareViewWrapper = customConfigInjector(viewsCustomConfig.share)

// 只带分享的views 活动类最常用
export const createShareView = shareViewWrapper(createBaseEntryView)
