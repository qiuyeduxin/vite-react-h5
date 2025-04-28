// 封装类 本地存储 localStorage 和 sessionStorage
class LocalCaChe {
  store: any
  constructor(islocal: boolean) {
    this.store = islocal ? window.localStorage : window.sessionStorage
  }
  setItem(key: string, value: any): void {
    this.store.setItem(key, value)
  }
  getItem(key: string): any {
    return this.store.getItem(key)
  }
  removeItem(key: string): void {
    this.store.removeItem(key)
  }
  clear(): void {
    this.store.clear()
  }
  length(): number {
    return this.setItem.length
  }
  // key(index: number): string {
  //   return this.store.key(index)
  // }
}

export default LocalCaChe

// 原作者
// 链接：https://juejin.cn/post/7053473681016061983
