/**
 * 全局loading效果
 *
 * @example
 *
 * import loading from 'components/loading'
 * loading.show()
 * loading.hide()
 */
import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import Loading from './Loading'

export type LoadingProps = {
  timeout?: number
  visible?: boolean
  borderColor?: string
}

const DEFAULT_TIMEOUT = 2000
let timer: any
const destroyFns: any[] = []
export const LOADING_DOM_ID = 'global-loading-root'
export const classPrefix = 'global-loading'

class LoadingManager {
  private div: HTMLElement | null = null
  private root: Root | null = null
  private queue: number[] = []

  constructor() {
    this.div = document.getElementById(LOADING_DOM_ID)
    this.root = null
    this.queue = []
  }

  show = (props?: LoadingProps) => {
    const timeout = props && props.timeout !== undefined ? props.timeout : DEFAULT_TIMEOUT

    this.queue.push(1)
    this.showView(props || {})

    if (timer) {
      clearTimeout(timer)
    }

    if (timeout && typeof timeout === 'number') {
      // 超时保护
      timer = setTimeout(() => {
        if (!this.isQueueClear) {
          this.clearQueue()
          this.hideView()
        }
      }, timeout)
    }
  }

  hide = () => {
    this.queue.pop()
    if (this.isQueueClear) {
      this.hideView()
    }
  }

  clearQueue() {
    for (let i = 0; i < this.queue.length; i++) {
      this.queue.pop()
    }
  }

  get isQueueClear() {
    return this.queue.length === 0
  }

  hideView() {
    const parentDiv = document.getElementById(LOADING_DOM_ID)
    if (parentDiv) {
      const div = parentDiv.getElementsByClassName(classPrefix)[0] as HTMLDivElement
      div.style.display = 'none'
    } else {
      console.log('parentDiv not found')
    }
  }

  showView(props: LoadingProps) {
    let div = this.div
    if (!div) {
      const firstChild = document.body.children[0]
      div = document.createElement('div') as HTMLElement
      div.setAttribute('id', LOADING_DOM_ID)

      if (firstChild) {
        document.body.insertBefore(div, firstChild)
      } else {
        document.body.appendChild(div)
      }
    }
    this.div = div
    if (!this.root) {
      this.root = createRoot(div)
    }

    let currentConfig: LoadingProps = { ...props, visible: true }

    // this.hide = close.bind(this)

    function close() {
      currentConfig = { ...props, visible: false }
      // destroy()
      render(currentConfig)
    }

    function update(newConfig: LoadingProps) {
      currentConfig = {
        ...currentConfig,
        ...newConfig
      }
      render(currentConfig)
    }

    const self = this

    function destroy() {
      if (self.root) {
        self.root?.unmount()
        if (div?.parentNode) {
          div.parentNode.removeChild(div)
        }
        self.root = null

        for (let i = 0; i < destroyFns.length; i++) {
          const fn = destroyFns[i]
          if (fn === close) {
            destroyFns.splice(i, 1)
            break
          }
        }
      }
    }

    const render = (props: LoadingProps) => {
      this.root?.render(<Loading {...props} />)
    }

    render(currentConfig)

    destroyFns.push(close)

    return {
      destroy: close,
      update
    }
  }
}

export default new LoadingManager()
