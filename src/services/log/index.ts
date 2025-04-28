import { isPrerendering } from 'src/config'

const logFn = () => import('./log')
const loadLog = new Promise((resolve) => {
  if (isPrerendering) return

  window.addEventListener('load', () => {
    setTimeout(() => {
      logFn().then((res) => {
        resolve(res.default)
      })
    }, 200)
  })
})

export default function getLog() {
  return loadLog
}
