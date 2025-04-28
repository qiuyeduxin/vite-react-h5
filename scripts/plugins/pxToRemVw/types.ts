export type SelectorBlackList = Array<string | RegExp>
export type ExcludeFn = (file: string) => boolean
export type ExcludeString = string
export type ExcludeReg = RegExp

export interface PxToRemVwOptions {
  forceRemPropList?: string[]
  rootValue?: number
  unit?: string
  unitPrecision?: number
  propList?: Array<string>
  selectorBlackList?: SelectorBlackList
  replace?: boolean
  mediaQuery?: boolean
  minPixelValue?: number
  exclude?: ExcludeString | ExcludeReg | ExcludeFn
}

export interface Options {
  forceRemPropList: string[]
  rootValue: number
  unit: string
  unitPrecision: number
  propList: Array<string>
  selectorBlackList: SelectorBlackList
  replace: boolean
  mediaQuery: boolean
  minPixelValue: number
  exclude: ExcludeString | ExcludeReg | ExcludeFn
}
