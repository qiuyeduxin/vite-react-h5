import micromatch from 'micromatch'

export function getUrlQuery(url: URL): Record<string, any> {
  const reqQuery: Record<string, any> = {}
  for (const [key, value] of url.searchParams.entries()) {
    reqQuery[key] = value
  }
  return reqQuery
}

/**
 * @param  {String} context '/api/**'
 * @param  {String} pathname     'http://example.org/api/b/c/d.html'
 * @return {Boolean}
 */
export function matchSingleGlobPath(pattern: string | string[], pathname: string) {
  const matches = micromatch([pathname], pattern, {})
  return matches && matches.length > 0
}

/**
 * 将请求URL和context配置的URL进行匹配
 * @param context
 * @param req
 */
export function contextMatch(context: string, reqPath: string) {
  if (context.includes('*')) {
    return matchSingleGlobPath(context, reqPath)
  }

  return new RegExp(context).test(reqPath) || reqPath.startsWith(context)
}

export async function importFile(modName: string) {
  const mod = await import('file://' + modName + '?t=' + Date.now())
  return mod.default || mod
}
