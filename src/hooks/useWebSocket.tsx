/**
 * webSocket
 * @param {string} url ws/wss地址
 * @param {object} info 参数集
 * @demo
 * @param {string} joinParams 进房参数(必需)
 * @param {string} heartParams 心跳参数
 * @return {array} [socket对象ws, socket接收的消息wsData]
 */
import { useEffect, useState, useRef } from 'react'
import tracking from 'src/services/tracking'

let lockReconnect = false // 避免重复连接

type HeartCheckType = {
  timeout: number
  timeoutObj: NodeJS.Timeout | undefined
  serverTimeoutObj: NodeJS.Timeout | undefined
  reset: () => HeartCheckType
  start: () => void
}

function useWebSocket(url: string, info: Record<string, any>) {
  const [wsData, setWsData] = useState({}) // 接收的消息
  const wsRef = useRef<WebSocket | null>(null)
  const { joinParams, heartParams, closeParams, pageName } = info ?? {}

  useEffect(() => {
    if (!url || !joinParams) return
    createWebSocket()

    return () => {
      if (closeParams && wsRef.current?.readyState === 1) {
        wsRef.current.send(closeParams)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, joinParams, closeParams])

  const createWebSocket = () => {
    // 创建socket连接
    wsRef.current = new WebSocket(url)
    initEventHandle()
  }

  const reconnect = () => {
    // 创建连接
    if (lockReconnect) return
    lockReconnect = true

    setTimeout(function () {
      // 没连接上会一直重连，设置延迟避免请求过多
      createWebSocket()
      lockReconnect = false
    }, 2000)
  }

  const initEventHandle = () => {
    // 初始化socket
    if (!wsRef.current) {
      return
    }
    wsRef.current.onclose = function (evt) {
      // 关闭
      // console.log('断开连接code:', evt.code)
      // reconnect()
      pageName && tracking.report('WebSocket-close', { msg: '断开连接', error: evt })
    }

    wsRef.current.onerror = function (evt: any) {
      // 连接错误
      // console.log('连接失败code:', evt.code)
      reconnect()
      pageName && tracking.report('WebSocket-error', { msg: '连接失败', error: evt })
    }

    wsRef.current.onopen = function () {
      var dt = new Date()
      var str =
        dt.getFullYear() +
        '-' +
        (dt.getMonth() + 1) +
        '-' +
        dt.getDate() +
        ' ' +
        dt.getHours() +
        ':' +
        dt.getMinutes() +
        ':' +
        dt.getSeconds()
      wsRef.current?.send(joinParams) // 发起c.jr进房操作
      heartParams && heartCheck.reset().start()
      pageName && tracking.report('WebSocket-open', { msg: '连接成功' })
    }

    wsRef.current.onmessage = function (evt) {
      var data = JSON.parse(evt.data) // 接收消息string=>json
      // console.log('接收消息:', evt.data)
      setWsData(data)
      heartParams && heartCheck.reset().start()
    }
  }

  let heartCheck: HeartCheckType = {
    // 心跳检测
    timeout: 30 * 1000, // 间隔ts发一次心跳
    timeoutObj: undefined,
    serverTimeoutObj: undefined,
    reset: function () {
      clearTimeout(heartCheck.timeoutObj)
      clearTimeout(heartCheck.serverTimeoutObj)
      return heartCheck
    },
    start: function () {
      heartCheck.timeoutObj = setTimeout(function () {
        // 这里发送一个心跳，后端收到后，返回一个心跳消息，
        // console.log('发送心跳校验消息:', heartParams)
        wsRef.current?.send(heartParams)
        heartCheck.serverTimeoutObj = setTimeout(function () {
          // 如果超过一定时间还没重置，说明后端主动断开了
          wsRef.current?.close()
        }, heartCheck.timeout)
      }, heartCheck.timeout)
    }
  }
  return [wsRef.current, wsData]
}

export default useWebSocket
