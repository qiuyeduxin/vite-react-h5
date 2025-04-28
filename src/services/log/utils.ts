import type { IpInfo, logOptions } from './types'

function format10(input: number): string {
  return `${input > 9 ? '' : 0}${input}`
}

// 格式化当前时间
export function getCurTime() {
  const d1 = new Date()
  const year = d1.getFullYear()
  const month = d1.getMonth() + 1
  const day = d1.getDate()
  const hour = d1.getHours()
  const minute = d1.getMinutes()
  const second = d1.getSeconds()
  return `${format10(year)}-${format10(month)}-${format10(day)} ${format10(hour)}:${format10(
    minute
  )}:${format10(second)}`
}

export const getIpInfo = fetch('https://api.ipfoxy.com/sys/tools/ip/get-info')
  .then((res) => res.json())
  .then((res): IpInfo => res.data || { ip: '', ip_data: {} })
  .catch((): IpInfo => {
    return { ip: '', ip_data: {} }
  })

export const getBaseOptions = async (): Promise<logOptions> => {
  const ipInfo: IpInfo = await getIpInfo
  const userAgent = window.navigator.userAgent

  return {
    createTime: getCurTime(), // 时间
    userId: `-`, // 没有user_id就取浏览器指纹作为唯一的访客
    userName: '访客',
    eventType: '', // 事件类型
    ip: ipInfo.ip,
    area: `${ipInfo.ip_data?.country || ''}|${ipInfo.ip_data?.city || ''}`,
    // btnId: '',
    // btnName: '',
    url: window.location.href,
    // webPerf: '',
    // web_perf:
    //   'fcp_time|fp_time|tti_time|ready_time|load_time|firstbyte_time|dns_time|tcp_time|ttfb_time|trans_time|dom_time|res_time|ssl_time',
    userAgent
    // os: '',
    // screen: ''
  }
}
