import { vi } from 'vitest'
import { insertTagToDocument } from '../dom' // 根据实际路径调整
import { render } from '@testing-library/react'

describe('utils/insertTagToDocument', () => {
  const tagName = 'script'
  const url = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js'
  const getScript = () => document.querySelector(`script[src="${url}"]`) as HTMLScriptElement
  afterEach(() => {
    const script = getScript()
    if (script) {
      document.head.removeChild(script)
    }
  })

  it('should insert a script tag with async attribute', () => {
    const params = { key: 'value' }
    const asyncOrDefer = 'async'

    insertTagToDocument(tagName, url, params, asyncOrDefer)
    const tag = getScript()
    expect(!!tag).toBeTruthy()
    expect(tag.async).toBe(1)
  })

  it('should insert a script tag with defer attribute', () => {
    const tagName = 'script'
    const url = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js'
    const params = 'param=value'
    const asyncOrDefer = 'defer'

    insertTagToDocument(tagName, url, params, asyncOrDefer)
    const tag = getScript()
    expect(!!tag).toBeTruthy()
    expect(tag.defer).toBeTruthy()
  })

  // it('should resolve the promise when the script loads successfully', async () => {
  //   const params = ''
  //   const asyncOrDefer = 'async'

  //   const promiseRes = await insertTagToDocument(tagName, url, params, asyncOrDefer)
  //   expect(promiseRes).toBeUndefined()
  // })

  // it('should reject the promise when the script fails to load', async () => {
  //   const tagName = 'script'
  //   const url = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js'
  //   const params = ''
  //   const asyncOrDefer = 'async'

  //   const promise = insertTagToDocument(tagName, url, params, asyncOrDefer)
  //   await expect(promise).rejects.toBeUndefined()
  // })
})
