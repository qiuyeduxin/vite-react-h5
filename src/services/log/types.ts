export type ReportBtnOptions = {
  btnId: string
  btnName: string
  requestParams?: any
  async?: boolean
}

export type User = {
  userId: string
  userName: string
}

export interface CommonParamsType extends User {
  os?: string
  screen?: string
}

type Resources = string[]

export interface logOptions extends CommonParamsType {
  ip?: string
  area?: string
  createTime: string
  eventType: string
  btnId?: string
  btnName?: string
  url: string
  perf?: string
  userAgent: string
  resources?: Resources
}

export type IpInfo = {
  ip: string
  ip_data: any
}

export type LogPerfOptions = {
  perf: string
  os: string
  screen: string
  resources?: Resources
}
