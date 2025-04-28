import type { ViteDevServer } from 'vite'
import type { View } from '../htmlMpa/types'

export interface ProxyOptions {
  server: ViteDevServer
  pages: View[]
  realtimeLog?: Boolean
}

export type ProxyFileMap = Map<string, EntryRuleConfig>

export type Obj = Record<string, any>

export type RuleConfig = {
  enable: boolean
  context: string
  target: string
  [key: string]: any
}

export type EntryRuleConfig = {
  file: string
  ruleMap: Record<string, RuleConfig>
}

export interface MockOptions {
  filename?: string
  server: any
  publicPath: string
  pages: View[]
}

export interface MockLocalOptions {
  filename: string
  server: any
  publicPath: string
  pages: View[]
  mapMock: Record<string, string[]>
}
