import path from 'path'
import Table from 'cli-table3'
import chalk from 'chalk'
import logUpdate from 'log-update'
import { URL } from 'node:url'
import fs from 'node:fs'
import getRawBody from 'raw-body'
import type { View } from '../htmlMpa/types'
import type { Connect } from 'vite'
import * as http from 'node:http'
import chokidar from 'chokidar'
import { getUrlQuery, importFile } from './utils'
import type { MockLocalOptions, MockOptions } from './types'

/**
 * 设置index.html和mock文件映射关系
 * @param p - htmlWebpackPlugin对象
 * @param options - 中间件配置选项
 */
function setMapMock(p: View, options: MockLocalOptions, watchTarget: string) {
  if (!fs.existsSync(watchTarget)) return
  const stat = fs.statSync(watchTarget)
  const key = p.filename
  options.mapMock[key] = options.mapMock[key] || []

  if (stat.isFile()) {
    options.mapMock[key].push(watchTarget)
  } else {
    options.mapMock[key] = options.mapMock[key].concat(
      fs.readdirSync(watchTarget).map((file) => path.join(watchTarget, file))
    )
  }
}

/**
 * 将webpack.entry位置和mock配置文件进行映射
 */
function webpackEntryToMapMock(options: MockLocalOptions) {
  const filename =
    options.filename.indexOf('/') === 0 ? options.filename.slice(1) : options.filename

  // 字符串类型entry
  options.pages.forEach((p) => {
    const watchTarget = path.join(path.parse(path.resolve(p.entry)).dir, filename)
    setMapMock(p, options, watchTarget)
  })
}

/**
 * 监听mock配置文件
 */
function watchMockFile(options: MockLocalOptions) {
  // 监听回调函数
  const watchCallback = (watchTarget: string) => {
    // 让浏览器刷新，如果没传server对象，则不主动触发浏览器刷新！
    if (options.server) {
      if (requireCache.has(watchTarget)) {
        console.log(chalk.bgYellowBright('mock文件更新，重新加载mock数据 => ', watchTarget))
        requireCache.delete(watchTarget)
        importCache(watchTarget)
      }
      setTimeout(() => {
        options.server.restart()
      }, 500)
    }
  }
  const list: string[] = [
    ...new Set(
      Object.values(options.mapMock).reduce(
        (previousValue: string[], currentValue: string[]) => [...previousValue, ...currentValue],
        []
      )
    )
  ]
  const watcher = chokidar.watch(list, {
    persistent: true
  })
  watcher.on('all', async (event, path) => {
    if (['unlinkDir', 'addDir', 'ready', 'error', 'raw', 'add'].includes(event)) {
      return
    }

    // 无视.js以外的任何文件
    if (path.includes('.js')) {
      watchCallback(path)
    }
  })
}

/**
 * 返回mock数据给客户端
 */
function responseMockData(
  res: http.ServerResponse,
  table: Table.Table,
  mockdata: Record<string, any>,
  mockFile: string,
  pathname: string,
  refererUrl: URL
) {
  delete mockdata.enable
  table.push([pathname, true])
  logUpdate(table.toString())
  const runResponse = () => {
    res.setHeader('service-mock-middleware', 'This is a mock data.')
    res.setHeader('service-mock-middleware-file', mockFile)
    res.setHeader('service-mock-middleware-match', pathname)
    res.setHeader('Access-Control-Allow-Origin', `${refererUrl.protocol}//${refererUrl.host}`)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    delete mockdata.delaytime
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(mockdata))
  }
  if (mockdata.delaytime) {
    setTimeout(runResponse, mockdata.delaytime)
  } else {
    runResponse()
  }
}

/**
 * 获取post请求体内容
 * @param req
 */
const getPostBody = (req: Connect.IncomingMessage) => {
  return new Promise((resolve, reject) => {
    if (req.method === 'POST') {
      getRawBody(
        req,
        {
          length: req.headers['content-length'],
          limit: '10mb',
          encoding: 'utf-8'
        },
        (err, raw) => {
          if (err) reject(err)
          try {
            resolve(JSON.parse(raw))
          } catch (e) {
            resolve({})
          }
        }
      )
    } else {
      resolve({})
    }
  })
}

const requireCache = new Map<string, any>()
async function importCache(modName: string) {
  if (requireCache.has(modName)) {
    return requireCache.get(modName)
  }
  const mod = await importFile(modName)

  requireCache.set(modName, mod)
  return mod
}

function serviceMockMiddleware(mockOptions: MockOptions) {
  const options: MockLocalOptions = {
    ...mockOptions,
    // 初始化中间件，监听mock文件目录或文件
    publicPath: mockOptions.publicPath || '',
    // 默认要监听的文件或路径
    filename: mockOptions.filename || '/mock',
    // mock文件与html文件的映射
    mapMock: {}
  }
  requireCache.clear()
  // 建立webpack.entry和mock配置文件的映射关系
  webpackEntryToMapMock(options)
  // 监听mock文件
  watchMockFile(options)
  return async function smm(req, res, next) {
    const reqUrl = req.url || ''
    if (
      path.parse(reqUrl.split('?')[0]).ext ||
      !req.headers.referer ||
      /@vite|@react|node_modules|src|@|css|js|ts|vue/g.test(reqUrl)
    ) {
      // 不是ajax请求 || 没有webpack配置 || req.headers.referer为undefied，表示直接在浏览器访问接口，不走mock
      return next()
    } else {
      const refererUrl = new URL(req.headers.referer)
      let pathname = refererUrl.pathname
      pathname = ['.html', '.htm'].includes(path.parse(pathname).ext) ? pathname : 'index.html'
      pathname = pathname.replace(options.publicPath, '')
      pathname = pathname.indexOf('/') === 0 ? pathname.slice(1) : pathname
      const table = new Table({
        head: ['请求路径', '开关[enable]'],
        style: { border: [] }
      })
      if (options.mapMock[pathname]) {
        // 有mock配置文件映射
        // 请求路径对应的mock文件路径
        const mapUrlByFile: Record<string, any> = {}
        // 获取mock文件配置，如果有多个mock配置文件，则合并mock配置文件
        const mockjson: Record<string, any> = await options.mapMock[pathname].reduce(
          async (previousValue, currentValue) => {
            const mockfile = currentValue
            // console.log(mockfile);
            if (fs.existsSync(mockfile)) {
              try {
                // const strFileContent = fs.readFileSync(mockfile).toString().trim();
                // delete require.cache[mockfile];
                const mockjsonRes = await importCache(mockfile)
                const mockjson: Record<string, any> = mockjsonRes || {}
                if (!Object.keys(mockjson).length) {
                  return previousValue
                }
                // const mockjson = eval(`(${strFileContent})`);
                table.push([
                  mockfile + ' 文件mock总开关',
                  `${mockjson.enable === false ? 'false' : 'true'}`
                ])
                if (mockjson.enable === false) {
                  return previousValue
                } else {
                  // 记录请求url对应的mock文件
                  Object.keys(mockjson).forEach((key) => {
                    mapUrlByFile[key] = mockfile
                  })
                  return { ...previousValue, ...mockjson }
                }
              } catch (e: any) {
                if (e.message.indexOf('Unexpected') !== -1)
                  console.error(chalk.red('语法错误：', mockfile + '有错误，请检查您的语法'))
                console.error(e.stack)
                return previousValue
              }
            }
          },
          {}
        )

        if (!mockjson || mockjson.enable === false) {
          mockjson && logUpdate(table.toString())
          return next()
        } else {
          const urlObj = new URL(`${/^http/.test(reqUrl) ? '' : refererUrl.origin}` + reqUrl)
          let mockdata = mockjson[urlObj.pathname]
          if (typeof mockdata === 'function') {
            // 如果是一个函数，则执行函数，并传入请求参数和req，res对象
            try {
              const body: any = await getPostBody(req)
              mockdata = mockdata({ query: getUrlQuery(urlObj), body }, req, res)
            } catch (e: any) {
              console.error(
                chalk.red(pathname, '函数语法错误，请检测您的mock文件：', mapUrlByFile[pathname])
              )
              console.error(e.message)
              // console.error(e.trace());
            }
            if (mockdata instanceof Promise) {
              mockdata = await mockdata
            }
            if (!mockdata) {
              console.error(pathname + '函数没有返回值，返回内容为：' + mockdata)
              return next()
            } else if (mockdata.enable || mockdata.enable === void 0) {
              responseMockData(
                res,
                table,
                mockdata,
                mapUrlByFile[urlObj.pathname],
                pathname,
                refererUrl
              )
            } else {
              table.push([pathname, false])
              logUpdate(table.toString())
              return next()
            }
          } else if (typeof mockdata === 'object') {
            if (mockdata.enable === false) {
              table.push([pathname, false])
              logUpdate(table.toString())
              return next()
            } else {
              responseMockData(
                res,
                table,
                mockdata,
                mapUrlByFile[urlObj.pathname],
                pathname,
                refererUrl
              )
            }
          } else {
            return next()
          }
        }
      } else {
        // 没有mock配置文件
        return next()
      }
    }
  } as Connect.NextHandleFunction
}

export default serviceMockMiddleware
