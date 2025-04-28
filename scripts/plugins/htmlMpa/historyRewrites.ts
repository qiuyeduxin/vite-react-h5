import type { IncomingMessage } from 'node:http'
import type { Plugin, ResolvedConfig, Connect } from 'vite'
import type { Options, Rewrite, Pages } from './types'
import { normalizePath as _normalizePath } from 'vite'
import history from 'connect-history-api-fallback'
import { URL } from 'node:url'
import { posix } from 'node:path'
import { HISTORY_REWRITES_PLUGIN_NAME } from './constants'

// Regular expression for matching URLs ending with '/index' or '/'
const IS_INDEX = /^\/index$|^\/$/
// List of file extensions to skip when finding pages
const SKIPPED_EXTENSIONS = ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
// Regular expression for matching skipped file extensions
const SKIPPED_EXTENSIONS_REGEX = new RegExp(
  `\\.(${SKIPPED_EXTENSIONS.join('|').replace(/\./g, '')})$`
)

/**
 * Evaluates the rewrite target based on the request URL and rewrite rules.
 * @param req Partial instance of IncomingMessage containing request information.
 * @param from RegExp object representing the source URL of the rewrite rule.
 * @param to Rewrite target, can be a string or a function.
 * @returns Returns the evaluated rewrite target string.
 * @throws Throws an error if the rewrite target is neither a string nor a function.
 */
function evaluateRewriteTo(req: Partial<IncomingMessage>, from: RegExp | undefined, to: any) {
  const url = req.url || ''
  const match = url.match(from || /(?:)/)
  if (typeof to === 'string') {
    return to
  }
  if (typeof to === 'function') {
    return to({
      url,
      match,
      req
    })
  }
  throw new Error('Rewrite rule can only be of type string or function.')
}

/**
 * Attempts to find the corresponding page based on rewrite rules.
 * @param forgeReq Partial instance of IncomingMessage containing request information.
 * @param rewrites Array of rewrite rule objects.
 * @param pages Array of page objects.
 * @returns Returns the matched page object, or undefined if not matched.
 */
export function tryFindPage(
  forgeReq: Partial<IncomingMessage>,
  rewrites: Rewrite[],
  pages: Pages = []
) {
  const url = forgeReq.url || ''
  if (SKIPPED_EXTENSIONS_REGEX.test(url || '')) return
  const urlPathname = new URL('http://a.com' + url).pathname
  const isIndex = !!url?.match(IS_INDEX)
  const rewrite = rewrites.find((item) => {
    if (isIndex) {
      return '/index'.match(item.from) || '/'.match(item.from) // Compatible with /^\/index$/ /^\/$/
    }
    return urlPathname.match(item.from)
  })

  if (!rewrite) return
  const to = evaluateRewriteTo(forgeReq, rewrite.from, rewrite.to)
  const page = pages.find(
    (page) => _normalizePath(`/${page.filename}`) === _normalizePath(`/${to}`)
  )
  return page
}

/**
 * Generates rewrite rules for history API fallback based on base URL and pages.
 * @param base Base URL.
 * @param pages Array of page objects.
 * @returns Returns an array of rewrite rule objects.
 */
function genHistoryApiFallbackRewrites(base: string, pages: Pages) {
  const multiPageRewrites = pages
    .sort((a, b) => a.entry.length - b.entry.length)
    .map(({ entry, template }) => ({
      from: new RegExp(`^/${entry}`),
      to: posix.join(base, template || `${entry}.html`)
    }))
  return [...multiPageRewrites, { from: /^\/$/, to: posix.join(base, 'index.html') }]
}

/**
 * Creates a Vite plugin for rewriting history API fallback.
 * @param options Configuration options.
 * @returns Returns a Vite plugin object.
 */
export default function createHistoryRewritePlugin(options: Options): Plugin {
  let viteConfig: ResolvedConfig
  let rewrites: Rewrite[] = []

  return {
    name: HISTORY_REWRITES_PLUGIN_NAME,
    configResolved(config) {
      viteConfig = config
    },
    configureServer(server) {
      const { historyApiFallback, pages = [] } = options
      const { base } = viteConfig
      if (historyApiFallback?.rewrites) {
        rewrites = [...rewrites, ...historyApiFallback.rewrites]
        Reflect.deleteProperty(historyApiFallback, 'rewrites')
      } else {
        rewrites = genHistoryApiFallbackRewrites(base, pages)
      }

      server.middlewares.use(async (req, _res, next) => {
        const page = tryFindPage(req, rewrites, pages)
        if (page) {
          req.url = _normalizePath(`/${page.template}`)
        }
        next()
      })

      server.middlewares.use(
        history({
          disableDotRule: undefined,
          htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
          rewrites,
          ...historyApiFallback
        }) as Connect.NextHandleFunction
      )
    }
  }
}
