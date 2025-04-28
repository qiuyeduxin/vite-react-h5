import fs from 'node:fs'
import { resolve } from 'node:path'
import type { View } from './plugins/htmlMpa/types'

const VIEW_WIDTH = Number(process.env.VIEW_WIDTH)
export function getBaseSize(views: View[]) {
  if (!views.length) {
    return VIEW_WIDTH
  }

  const baseSize = views[0].data.baseSize || VIEW_WIDTH
  if (views.find((view) => view.data.baseSize && view.data.baseSize !== baseSize)) {
    throw new Error('baseSize must be the same')
  }

  return baseSize
}

export function getViewsConfig(viewConfig: Record<string, any>): View[] {
  return Object.keys(viewConfig).map((key) => {
    const { headFirst = [], headLast = [], bodyFirst = [], bodyLast = [] } = viewConfig[key]

    const newView = {
      key,
      entry: `src/pages/${key}/index.ts`,
      filename: `${key}/index.html`,
      entryDir: `src/pages/${key}`,
      data: {
        ...viewConfig[key],
        PUBLIC_URL: key,
        headFirst: headFirst.join('\n'),
        headLast: headLast.join('\n'),
        bodyFirst: bodyFirst.join('\n'),
        bodyLast: bodyLast.join('\n')
      }
    }
    if (fs.existsSync(resolve(process.cwd(), `src/pages/${key}/index.js`))) {
      newView.entry = `src/pages/${key}/index.js`
    }
    return newView
  })
}
