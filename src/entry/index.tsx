import React from 'react'
import { Provider } from 'react-redux'
import '../styles/base.css'
import { createRoot } from 'react-dom/client'
import $loading from 'src/components/loading'
import { setViewportFit, ua } from 'src/utils'
import { insertTagToDocument } from 'src/utils/dom'
import 'src/apis/serviceIntercept'

const appContainer = document.getElementById('root')

/**
 * 注意: 只要你的页面有使用loading, 就一定要在具体页面的entry中引入这句话, 谨记, 否则预渲染之后会多个不消失loading
 */
export const loadingWhenFcp = () => {
  $loading.show()

  // DOMContentLoaded 页面仍然是白的, 这里的200ms是 DOMContentLoaded -> First Contentful Paint 时间预估
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => $loading.hide(), 200)
  })
}

setViewportFit('cover')

// 异步绑定fastclick
if (ua.ios) {
  if (/iPhone OS 12_/.test(navigator.userAgent) && window.top !== window) {
    const domList = [document.documentElement, document.body]
    domList.forEach((element) => {
      element.style.height = '100%'
      element.style.overflow = 'auto'
    })
  }
  insertTagToDocument(
    'script',
    `/fastclick.js`,
    {},
    'defer'
  ).then(() => {
    if (window.FastClick) {
      window.FastClick.attach(document.body)
      window.FastClick.prototype.focus = function (
        targetElement: HTMLInputElement | HTMLTextAreaElement | Element
      ) {
        if (
          targetElement instanceof HTMLInputElement ||
          targetElement instanceof HTMLTextAreaElement
        ) {
          targetElement.focus()
        }
      }
    }
  })
}

function entry(App: React.FC<any>, opts: Record<string, any> = {}) {
  const { store } = opts

  createRoot(appContainer!).render(
    <Provider store={store}>
      <App />
    </Provider>
  )
}

export default entry
