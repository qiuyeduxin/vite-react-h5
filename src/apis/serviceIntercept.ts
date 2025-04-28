import axios from 'axios'
import $loading from 'src/components/loading'

const TIME_OUT = 10000

// 超时时间
axios.defaults.timeout = TIME_OUT

const errorHandle = (error: any) => {
  $loading.hide()
  return error
}


axios.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    _t: Date.now()
  }

  return config
}, errorHandle)

axios.interceptors.response.use((config) => {
  return config
}, errorHandle)
