import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import PopupSelect from './index'

describe('PopupSelect组件', () => {
  it('组件正常显示', () => {
    render(
      <PopupSelect maxHeight={800} visible top={100}>
        <div>PopupSelect</div>
      </PopupSelect>
    )
    const linkElement = screen.getByText(/PopupSelect/i)
    expect(linkElement).toBeInTheDocument()
  })
})
