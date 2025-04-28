import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Popup from './index'

describe('Popup组件', () => {
  it('组件正常显示', () => {
    render(
      <Popup height={400} visible>
        <div>Popup</div>
      </Popup>
    )
    const linkElement = screen.getByText(/Popup/i)
    expect(linkElement).toBeInTheDocument()
  })
})
