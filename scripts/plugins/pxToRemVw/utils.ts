import type { Options, SelectorBlackList } from './types'

export const pxRegex = (unit: string) =>
  new RegExp(`"[^"]+"|'[^']+'|url\\([^)]+\\)|var\\([^)]+\\)|(\\d*\\.?\\d+)${unit}`, 'g')
const filterPropList = {
  exact: (list: string[]) => list.filter((m) => m.match(/^[^*!]+$/)),
  contain: (list: string[]) =>
    list.filter((m) => m.match(/^\*.+\*$/)).map((m) => m.slice(1, m.length - 1)),
  endWith: (list: string[]) => list.filter((m) => m.match(/^\*[^*]+$/)).map((m) => m.substr(1)),
  startWith: (list: string[]) =>
    list.filter((m) => m.match(/^[^*!]+\*$/)).map((m) => m.slice(0, m.length)),
  notExact: (list: string[]) => list.filter((m) => m.match(/^![^*].*$/)).map((m) => m.substr(1)),
  notContain: (list: string[]) =>
    list.filter((m) => m.match(/^!\*.+\*$/)).map((m) => m.slice(2, m.length - 2)),
  notEndWith: (list: string[]) => list.filter((m) => m.match(/^!\*[^*]+$/)).map((m) => m.substr(2)),
  notStartWith: (list: string[]) =>
    list.filter((m) => m.match(/^![^*]+\*$/)).map((m) => m.slice(1, m.length - 1))
}

export const defaultOptions = {
  rootValue: 750,
  unitPrecision: 5,
  selectorBlackList: [],
  propList: ['*', 'font', 'font-size', 'line-height', 'letter-spacing', 'word-spacing'],
  forceRemPropList: ['font', 'font-size'],
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
  exclude: null,
  unit: 'px'
}

function getCalcValue(
  rootValue: number,
  targetUnit: 'rem' | 'vw',
  sourceValue: number,
  unitPrecision: number
) {
  return (sourceValue / rootValue).toFixed(unitPrecision) + targetUnit
}

export function createPxReplace(
  rootValue: number,
  unitPrecision: number,
  minPixelValue: number,
  targetUnit: 'rem' | 'vw'
) {
  return (m: string, $1: string) => {
    if (!$1) return m
    const pixels = parseFloat($1)
    if (pixels < minPixelValue) return m
    return getCalcValue(rootValue, targetUnit, pixels, unitPrecision)
  }
}

export function toFixed(number: number, precision: number) {
  const multiplier = Math.pow(10, precision + 1),
    wholeNumber = Math.floor(number * multiplier)
  return (Math.round(wholeNumber / 10) * 10) / multiplier
}

export function declarationExists(decls: any[], prop: string, value: string) {
  return decls.some((decl) => decl.prop === prop && decl.value === value)
}

export function blacklistedSelector(blacklist: SelectorBlackList, selector: string) {
  return blacklist.some((regex) => {
    if (typeof regex === 'string') {
      return selector.indexOf(regex) !== -1
    }
    return selector.match(regex)
  })
}

export function createPropListMatcher(propList: string[]) {
  const hasWild = propList.indexOf('*') > -1
  const matchAll = hasWild && propList.length === 1
  const lists = {
    exact: filterPropList.exact(propList),
    contain: filterPropList.contain(propList),
    startWith: filterPropList.startWith(propList),
    endWith: filterPropList.endWith(propList),
    notExact: filterPropList.notExact(propList),
    notContain: filterPropList.notContain(propList),
    notStartWith: filterPropList.notStartWith(propList),
    notEndWith: filterPropList.notEndWith(propList)
  }
  return (prop: string) => {
    if (matchAll) return true
    return (
      (hasWild ||
        lists.exact.indexOf(prop) > -1 ||
        lists.contain.some(function (m: string) {
          return prop.indexOf(m) > -1
        }) ||
        lists.startWith.some(function (m: string) {
          return prop.indexOf(m) === 0
        }) ||
        lists.endWith.some(function (m: string) {
          return prop.indexOf(m) === prop.length - m.length
        })) &&
      !(
        lists.notExact.indexOf(prop) > -1 ||
        lists.notContain.some(function (m: string) {
          return prop.indexOf(m) > -1
        }) ||
        lists.notStartWith.some(function (m: string) {
          return prop.indexOf(m) === 0
        }) ||
        lists.notEndWith.some(function (m: string) {
          return prop.indexOf(m) === prop.length - m.length
        })
      )
    )
  }
}

const isType = (s: any) => Object.prototype.toString.call(s).slice(8, -1).toLowerCase()

const types = ['String', 'Array', 'Undefined', 'Boolean', 'Number', 'Function', 'Symbol', 'Object']

export const typeFns = types.reduce((acc, str) => {
  acc['is' + str] = (val) => isType(val) === str.toLowerCase()
  return acc
}, {} as Record<string, (val: any) => boolean>)
