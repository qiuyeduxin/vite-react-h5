export type CFun = (...args: any[]) => any | void

export type DbLogMsg = {
  // 数据库日志任务类型
  /**
   * 消息ID
   */
  id: string
  /**
   * 消息内容
   */
  msg: any
}

export type IObject<T = any> = {
  [key: string]: T
}
