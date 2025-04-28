import { render } from '@testing-library/react'
import React, { useEffect } from 'react'
import loading, { classPrefix } from './index'

function App() {
  useEffect(() => {
    loading.show()
  }, [])
  return <div>loading</div>
}

describe('loading组件', () => {
  afterEach(() => {
    loading.hide()
  })
  it('组件正常显示', () => {
    render(<App />)
    const div = document.querySelector(`.${classPrefix}`) as HTMLDivElement
    expect(div.style?.display).toBe('block')
  })

  it('loading隐藏', () => {
    render(<App />)
    loading.hide()
    const div = document.querySelector(`.${classPrefix}`) as HTMLDivElement
    expect(div.style?.display).toBe('none')
  })
})
