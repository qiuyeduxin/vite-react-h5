import { isObject } from 'lodash-es'

export const createDecorator = function (hocWrapper: Function, ...args: any[]) {
  if (typeof hocWrapper !== 'function')
    throw Error('[create-decorator]: createDecorator请传入一个高阶函数')

  return function handleDescriptor(target: any, _key: string, descriptor: any) {
    if (!descriptor && typeof target === 'function') {
      // 返回执行具体业务逻辑的函数
      return hocWrapper(target)
    }

    if (descriptor && !isObject(descriptor)) {
      throw Error(
        '[create-decorator]: 装饰器使用错误, descriptor不是描述对象, 请检查@decorator是否为正确装饰器结构: function (target, name, descriptor) { ... }\n' +
          'descriptor: \n' +
          descriptor
      )
    }

    const { configurable, enumerable, writable } = descriptor
    const originalGet = descriptor.get
    const originalSet = descriptor.set
    let originalValue = descriptor.value
    const originInitializer = descriptor.initializer
    const isGetter = !!originalGet
    const defaultSetter = (newValue: any) => (originalValue = newValue)
    let wrappedFn: Function

    const desc: Record<string, any> = {
      configurable,
      enumerable
    }

    // 当非箭头函数 或 静态箭头函数时候, 不能有即有initializer 和 value(get、set)属性
    // 构建报错如(Invalid property descriptor Cannot both specify accesssors and a value or writable attirbute)
    // 所以这里将initializer 与 get set区分开
    if (typeof originInitializer === 'function') {
      desc.initializer = function initializer() {
        if (!wrappedFn) {
          // 这边在编译时候, 将this传入作用域curry起来, 等于间接固定了this
          // 这个realMethod是类中的具体执行业务逻辑的函数
          const realMethod = originInitializer.call(this).bind(this)
          // 这个是通过高阶函数装饰之后的代理函数, 调用者调用的就是这个函数
          wrappedFn = hocWrapper.call(this, realMethod, ...args)
        }
        return function realMethodCall(...nextArgs: any[]) {
          // @ts-ignore
          const self = this
          return wrappedFn.call(self, ...nextArgs)
        }
      }
    } else {
      desc.get = function get() {
        if (wrappedFn) return wrappedFn

        let realMethod
        if (isGetter) {
          realMethod = originalGet.call(this).bind(this)
        } else if (typeof originalValue === 'function') {
          realMethod = originalValue.bind(this)
        } else {
          throw Error(
            "[create-decorator]: descriptor's `value` or `get` property is not a function\n" +
              descriptor
          )
        }

        wrappedFn = hocWrapper.call(this, realMethod, ...args)
        return wrappedFn
      }
      desc.set = isGetter ? originalSet : defaultSetter
    }

    return desc
  }
}
