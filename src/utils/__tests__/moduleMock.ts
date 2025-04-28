import { vi as jest } from 'vitest'

export const SVGA = {
  Parser: jest.fn(),
  Player: jest.fn()
}

jest.mock('svgaplayerweb', () => {
  return {
    __esModule: true,
    default: SVGA
  }
})
