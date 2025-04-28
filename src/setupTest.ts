import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 每个测试用例执行后清理DOM
afterEach(() => {
  cleanup()
})
