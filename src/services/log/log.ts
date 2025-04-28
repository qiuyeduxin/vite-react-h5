/**
 * 页面埋点
 */
import db from 'src/services/database'
import performanceService from './performance'
import type { logOptions, ReportBtnOptions, CommonParamsType, User, LogPerfOptions } from './types'
import { getBaseOptions } from './utils'

class Log {
  logTimeId: any

  commonParams: CommonParamsType = {
    userId: '',
    userName: ''
  }

  canLog: boolean = true

  uploadUrl: string = ''

  constructor(uploadUrl: string, user: User) {
    this.logTimeId = 0
    this.uploadUrl = uploadUrl
    this.canLog = true
    this.commonParams = {
      os: '',
      screen: '',
      ...user
    }

    performanceService.init((o: LogPerfOptions) => this.reportPerformance(o))
  }

  async reportPage() {
    const baseOptions: logOptions = await getBaseOptions()

    const newTask: logOptions = {
      ...baseOptions,
      ...this.commonParams,
      eventType: 'pv'
    }

    this.sendLog(newTask)
  }

  /**
   * 上报按钮埋点 databusi-web-js-error
   * @param {string} bntId 必填
   * @param {string} btnName 必填
   * @param {any} requestParams 接口参数
   */
  async reportBtn(params: ReportBtnOptions) {
    const { requestParams, btnId, btnName, async } = params

    if (!btnId || !btnName) {
      throw new Error('btnId/btnName 为空，埋点上报失败！')
    }

    const baseOptions: logOptions = await getBaseOptions()

    const newTask: logOptions = {
      ...baseOptions,
      ...this.commonParams,
      eventType: 'click',
      btnId,
      btnName
    }

    this.sendLog(newTask, async)
  }

  async reportPerformance(infoData: LogPerfOptions) {
    const baseOptions: logOptions = await getBaseOptions()
    this.commonParams.os = infoData.os
    this.commonParams.screen = infoData.screen
    const newTask: logOptions = {
      ...baseOptions,
      eventType: 'web-perf',
      perf: infoData.perf,
      ...this.commonParams
    }
    if (infoData?.resources) {
      newTask.resources = infoData.resources
    }

    this.sendLog(newTask)
  }

  upload(data: logOptions[]) {
    const blobData = new Blob([JSON.stringify(data)], {
      type: 'application/json; charset=UTF-8'
    })
    if (this.uploadUrl) {
      window.navigator.sendBeacon(this.uploadUrl, blobData)
    }
  }

  clearLogTimer() {
    this.logTimeId && clearTimeout(this.logTimeId)
  }

  /**
   * 发送日志
   * @param {*} task 任务
   * @param {*} async 是否同步
   */
  sendLog(task: logOptions, async?: boolean) {
    if (!this.canLog) {
      return
    }

    if (async) {
      // 立即上报，不再和worker中等待合并逻辑一样，直接触发接口
      this.upload([task])
    }

    /**
     * 异步上报
     * 单位时间内只上报一次
     * 同时使用indexDb存贮埋点，就算页面被关闭了，下次打开依旧可以继续上报
     */
    db.log.add({
      msg: task
    })

    this.clearLogTimer()
    this.logTimeId = setTimeout(() => {
      db.log
        .toArray()
        .then((list) => {
          const ids: string[] = []
          const logList: logOptions[] = list.map(({ id, msg: item }) => {
            ids.push(id)
            return {
              ...item,
              ...this.commonParams
            }
          })
          this.upload(logList)
          return ids
        })
        .then((delIds) => {
          db.log.bulkDelete(delIds)
        })
    }, 2 * 1000)
  }
}

const log = new Log('http://www.baidu.com/api/v1/h5/log', {
  userId: '1473869',
  userName: 'user name'
})

export default log
