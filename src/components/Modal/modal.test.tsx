import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Modal from './index'

describe('Modal组件', () => {
  it('组件正常显示', () => {
    render(
      <Modal visible>
        <div>modal</div>
      </Modal>
    )
    const linkElement = screen.getByText(/modal/i)
    expect(linkElement).toBeInTheDocument()
  })
})
