/**
 * @name 通用装饰器集合
 */
import { createDecorator } from './utils'
import $loading from 'src/components/loading'
import { lockAsyncFunction as lockAsyncFunctionFromUtils } from 'src/utils'
import type { CFun } from 'src/types'

/**
 * @name 接口loading装饰器 (不阻止点击事件)
 * @example
 * class Apis {
 *  @setLoadingWrapper
 *  getList = get('ab/cd/ef')
 * }
 */
export const setLoadingWrapper = createDecorator((fn: CFun) => (...rest: any[]) => {
  $loading.show({ timeout: 30000 })
  const apiPromise = fn(...rest)
  apiPromise.finally($loading.hide)
  return apiPromise
})

/**
 * @name 接口loading装饰器 (阻止点击事件, 防止某些请求重复点击)
 * @warn isStop无效，统一使用 setLoadingWrapper
 * @example
 * class Apis {
 *  @setProtectLoading
 *  getList = get('ab/cd/ef')
 * }
 */
export const setProtectLoading = createDecorator((fn: CFun) => (...rest: any[]) => {
  $loading.show({ timeout: 30000 })
  const apiPromise = fn(...rest)
  apiPromise.finally($loading.hide)
  return apiPromise
})

/**
 * @desc 异步请求函数锁定装饰器，请求未返回结果之前，再次点击不会发请求
 * @example
 * @lockAsyncFunction
 * const onSubscription = async () => {}
 */
export const lockAsyncFunction = createDecorator(lockAsyncFunctionFromUtils)
