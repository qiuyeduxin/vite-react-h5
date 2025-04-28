import LocalCaChe from "./LocalCaChe";
const store = new LocalCaChe(true); // localStorage

const MyLocalStorage = {
  // 存储Key的前缀
  preFix: '',

  init(preFix: string): void {
    this.preFix = preFix;
  },

  // 添加前缀
  addPrefix(key: string): string {
    return this.preFix ? `${this.preFix}_${key}` : key;
  },
  // 设置
  setItem(key: string, value: string): void {
    store.setItem(this.addPrefix(key), value);
  },
  // 获取
  getItem(key: string): string | null {
    return store.getItem(this.addPrefix(key));
  },
  // 删除
  removeItem(key: string): void {
    store.removeItem(this.addPrefix(key));
  },
  // 清空
  clear(): void {
    store.clear();
  },
  // 长度
  length(): number {
    return store.length();
  },

  // 设置对象
  setItemObj(key: string, value: object | Array<any>): void {
    const str = JSON.stringify(value);
    store.setItem(this.addPrefix(key), str);
    // try {
    //   const str = JSON.stringify(value);
    //   store.setItem(this.addPrefix(key), str);
    // } catch (error) {
    //   console.log('setItemObj error');
    //   console.error(error);
    // }
  },
  // 获取对象
  getItemObj(key: string): object | Array<any> | null {
    try {
      const str = store.getItem(this.addPrefix(key));
      if (str) {
        return JSON.parse(str);
      }
      return null;
    } catch (error) {
      console.log('getItemObj JSON parse error');
      console.error(error);
      return null;
    }
  },
  // 存储值，并设置过期时间（单位天，默认一天）
  setItemExpire(key: string, value: string, expire: number = 24 * 60): boolean {

    try {
      if (isNaN(expire) || expire < 0) {
        //过期时间值合理性判断
        throw new Error('expre 过期时间必须是正数');
      }
      const obj = {
        value,
        saveTime: Date.now(), //保存时间
        expire: Date.now() + 1000 * 60 * expire, //过期时间
      };
      this.setItemObj(key, obj);
      return true;
    } catch (error) {
      console.log('setItemExpire error');
    }
    return false;
  },
  // 获取值，判断是否过期，如果过期则删除
  getItemExpire(key: string): string | null {
    const obj = this.getItemObj(key) as any;
    if (obj) {
      if (obj.expire > Date.now()) {
        return obj.value;
      } else {
        this.removeItem(key);
        console.log('getItemExpire 过期 删除', key);
      }
    }
    return null;
  }
}

export default MyLocalStorage;
