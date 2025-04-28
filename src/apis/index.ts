import axios from 'axios'

type ReqParams = Record<string, any>

export function getReqByBaseURL({ baseURL, timeout = 5e3 }: { baseURL: string; timeout?: number }) {
  const base = axios.create({
    baseURL: baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      Accept: 'application/json'
    }
  })

  return {
    get:
      (url: string, config: any = {}) =>
      (params?: ReqParams) =>
        base.get(url, {
          params,
          ...config
        })
  }
}
