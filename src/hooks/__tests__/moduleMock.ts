import { vi } from 'vitest'

export const mockTracking: Record<string, any> = {
  report: vi.fn()
}

vi.mock('src/services/tracking', () => {
  return {
    __esModule: true,
    default: mockTracking
  }
})
