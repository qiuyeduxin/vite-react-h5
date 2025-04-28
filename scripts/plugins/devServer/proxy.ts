import type { View } from '../htmlMpa/types'
import path from 'node:path'
import fs from 'node:fs'
import { URL } from 'node:url'
import type { Connect } from 'vite'
import * as http from 'node:http'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { contextMatch, importFile } from './utils'
import type { Options as ProxyOptionsOptions, RequestHandler } from 'http-proxy-middleware'
import Table from 'cli-table3'
import chalk from 'chalk'
import logUpdate from 'log-update'
import chokidar from 'chokidar'
import type { Obj, ProxyFileMap, ProxyOptions, RuleConfig, EntryRuleConfig } from './types'

function getEntryConfig(proxyFile: string): EntryRuleConfig {
  return {
    file: proxyFile,
    ruleMap: {}
  }
}

/**
 * 打印代理规则
 */
function printProxyRule(proxyMap: ProxyFileMap) {
  // 重新创建让表格自适应
  const table = new Table({
    head: [chalk.bold('entry'), chalk.bold('target'), chalk.bold('context')],
    style: { border: [] }
  })
  for (const proxyItem of proxyMap) {
    const [entry, entryMap] = proxyItem
    Object.keys(entryMap.ruleMap).forEach((context) => {
      const rule = entryMap.ruleMap[context]
      table.push([chalk.yellowBright(entry), chalk.magentaBright(rule.target), chalk.blue(context)])
    })
  }
  logUpdate('\n')
  logUpdate(table.toString() + '\n')
}

/**
 * 异步函数：更新入口代理规则映射
 * 该函数用于更新特定入口点的代理规则映射，根据给定的代理文件路径导入规则，并映射到该入口点
 *
 * @param proxyMap 代理文件映射，是一个映射表，用于存储不同入口点的代理配置
 * @param entry 入口点标识符，用于在代理映射中唯一标识一个入口点
 * @param proxyFilePath 代理文件路径，指向包含代理规则配置的文件
 */
async function updateEntryProxyRuleMap(
  proxyMap: ProxyFileMap,
  entry: string,
  proxyFilePath: string
) {
  // 获取入口点的配置，如果不存在，则从代理文件路径中获取
  const entryMap = proxyMap.get(entry) || getEntryConfig(proxyFilePath)

  // 从代理文件路径中导入所有的规则
  const rules = await importFile(proxyFilePath)

  // 清空入口点配置中的原有规则映射，准备更新
  entryMap.ruleMap = {}

  // 遍历导入的规则，将每个规则添加到入口点的规则映射中
  rules.forEach((rule: Obj) => {
    // 解构规则对象，分离出上下文数组和其他规则属性
    const { contexts, ...ruleObj } = rule

    // 如果规则是启用状态且包含上下文数组，则遍历每个上下文，创建规则配置并添加到映射中
    if (rule.enable && rule.contexts?.length) {
      rule.contexts.forEach((context: string) => {
        // 将规则配置与上下文一起存储在入口点的规则映射中
        entryMap.ruleMap[context] = {
          ...ruleObj,
          context
        } as RuleConfig
      })
    }
  })

  // 更新代理映射，将新的入口点配置存储回去
  proxyMap.set(entry, entryMap)
}

/**
 * 监听代理配置文件
 * 该函数使用chokidar库监视代理规则文件的更改，以便在文件变化时动态更新代理配置
 *
 * @param options - 包含代理选项的对象，包括是否实时日志记录的配置
 * @param proxyFileMap - 一个映射，将代理规则与其对应的文件路径关联起来
 */
function watchProxyRuleFile(options: ProxyOptions, proxyFileMap: ProxyFileMap) {
  // 创建一个唯一的代理规则文件路径数组
  const arrProxyRules = [
    ...new Set(
      [...proxyFileMap].reduce((prev, curr) => {
        return prev.concat(curr[1].file)
      }, [] as string[])
    )
  ] as string[]

  // 初始化文件监视器
  const watcher = chokidar.watch(arrProxyRules, {
    persistent: true
  })

  // 如果不是实时日志模式，则在开始时打印代理规则
  if (!options.realtimeLog) {
    printProxyRule(proxyFileMap)
    logUpdate.done()
  }

  // 监听文件变化事件
  watcher.on('all', async (event, path) => {
    // 忽略某些事件类型
    if (['unlinkDir', 'addDir', 'ready', 'error', 'raw', 'add'].includes(event)) {
      return
    }

    // 遍历代理文件映射，查找并更新受影响的代理规则
    for (const proxyItem of proxyFileMap) {
      if (proxyItem[1].file === path) {
        await updateEntryProxyRuleMap(proxyFileMap, proxyItem[0], path)
        break
      }
    }

    // 如果是实时日志模式，则更新代理规则的打印
    options.realtimeLog && printProxyRule(proxyFileMap)
  })
}

/**
 * 异步函数，通过视图数组生成带有代理映射的条目
 * 该函数旨在为每个视图创建一个代理文件映射，便于后续处理网络请求的代理规则
 *
 * @param views 视图数组，包含需要生成代理映射的文件信息
 * @returns 返回一个Promise，解析为ProxyFileMap实例，映射了每个视图的代理文件路径
 */
async function getEntryWithProxyMap(views: View[]) {
  // 初始化一个新的Map对象，用于存储视图路径与其对应的代理文件路径的映射
  const newMap: ProxyFileMap = new Map()

  // 遍历视图数组，为每个视图创建代理映射
  for (let i = 0; i < views.length; i++) {
    // 获取当前视图项
    const item = views[i]
    // 构造视图路径的键值，用于Map中映射
    const key = `/${item.filename}`
    // 拼接当前视图的代理文件完整路径
    const proxyFile = path.join(process.cwd(), item.entryDir, 'proxyRules.js')
    // 检查代理文件是否存在，如果存在则更新到Map中
    if (fs.existsSync(proxyFile)) {
      // 调用异步函数updateEntryProxyRuleMap，更新Map中的代理规则
      await updateEntryProxyRuleMap(newMap, key, proxyFile)
    }
  }
  // 返回构造完成的代理文件映射Map
  return newMap
}

const proxyFnMap = new Map<string, RequestHandler>()

/**
 * 运行proxy配置规则
 * @param proxyRule 配置规则
 * @param filename 配置文件
 * @param opts 更多配置
 */
function getProxyFn(
  ruleConfig: RuleConfig,
  filename: string
): RequestHandler<
  http.IncomingMessage,
  http.ServerResponse<http.IncomingMessage>,
  (err?: any) => void
> {
  const { context, target, ...opts } = ruleConfig
  const cacheKey = `${context}||${target}`
  const cacheFn = proxyFnMap.get(cacheKey)
  if (cacheFn) {
    return cacheFn
  }

  const proxyOptions: ProxyOptionsOptions = {
    pathFilter: context,
    target,
    changeOrigin: true,
    ws: true,
    on: {
      proxyRes(proxyRes, req) {
        const reqURl = req.url || ''
        const url = new URL(target + reqURl)
        proxyRes.headers['service-proxy-middleware-1-filename'] = filename
        proxyRes.headers['service-proxy-middleware-2-context'] = context
        proxyRes.headers['service-proxy-middleware-3-pathname'] = url.pathname
        proxyRes.headers['service-proxy-middleware-4-target'] = target
        proxyRes.headers['service-proxy-middleware-5-match'] = target + reqURl
      }
    },
    ...opts
  }

  const newProxyFn = createProxyMiddleware<http.IncomingMessage, http.ServerResponse>(proxyOptions)
  proxyFnMap.set(cacheKey, newProxyFn)

  return newProxyFn
}

async function serviceProxyMiddleware(options: ProxyOptions): Promise<Connect.NextHandleFunction> {
  proxyFnMap.clear()
  // 获取entry与代理配置文件路径的映射
  const proxyFileMap: ProxyFileMap = await getEntryWithProxyMap(options.pages)
  // 实时配置日志输出，默认为false，如果为true，则代理配置文件发生改变时，会更新终端输出的代理配置
  options.realtimeLog = options.realtimeLog || false
  watchProxyRuleFile(options, proxyFileMap)

  return function proxy(req, res, next) {
    if (
      !req.headers.referer ||
      /@vite|@react|node_modules|src|@|css|js|ts|vue|\.html/g.test(req.url || '')
    ) {
      return next()
    }

    // 请求来源页面
    const refererUrl = new URL(req.headers.referer)
    if (!proxyFileMap.has(refererUrl.pathname)) {
      return next()
    }
    const proxyRuleConfig = proxyFileMap.get(refererUrl.pathname) as EntryRuleConfig // 使用BrowserRouter时会匹配不到！

    for (const context in proxyRuleConfig.ruleMap) {
      if (!contextMatch(context, req.originalUrl || req.url || '')) {
        continue
      }
      // 运行跨域代理
      return getProxyFn(proxyRuleConfig.ruleMap[context], proxyRuleConfig.file)(req, res, next)
    }
    next()
  }
}

export default serviceProxyMiddleware
