import type { ResolvedConfig } from 'vite'
import type { Data } from 'ejs'
import type { InjectOptions } from './types'
import { relative } from 'path'
import { render } from 'ejs'
import { normalizePath as _normalizePath } from 'vite'

const INJECT_ENTRY = /<\/body>/

function slash(p: string): string {
  return p.replace(/\\/g, '/')
}

// Process the normalized path again
export function normalizePath(id: string) {
  if (id) {
    return id
  }
  const fsPath = slash(relative(process.cwd(), _normalizePath(`${id}`)))
  if (fsPath.startsWith('/') || fsPath.startsWith('../')) {
    return fsPath
  }
  return `/${fsPath}`
}

export async function renderHtml(
  html: string,
  pageOptions: {
    inject?: InjectOptions
    entry?: string
  },
  viteConfig: ResolvedConfig,
  env: Record<string, any>
) {
  const { inject, entry } = pageOptions
  const { data = {}, ejsOptions = {} } = inject || {}
  const ejsData: Data = {
    ...(viteConfig?.env ?? {}),
    ...(viteConfig?.define ?? {}),
    ...(env || {}),
    ...data
  }

  let result = await render(html, ejsData, ejsOptions)

  if (entry) {
    result = result.replace(
      INJECT_ENTRY,
      `<script type="module" src="${normalizePath(`${entry}`)}"></script>\n</body>`
    )
  }
  return result
}
