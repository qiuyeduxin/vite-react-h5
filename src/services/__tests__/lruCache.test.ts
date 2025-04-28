import LruCache from '../lruCache'

describe('LruCache', () => {
  let cache: LruCache<any>

  beforeEach(() => {
    cache = new LruCache<any>(3)
  })

  it('should return undefined for non-existent key', () => {
    expect(cache.get('non-existent-key')).toBeUndefined()
  })

  it('should add a new key-value pair and retrieve it', () => {
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('should update the value of an existing key', () => {
    cache.set('key1', 'value1')
    cache.set('key1', 'value2')
    expect(cache.get('key1')).toBe('value2')
  })

  it('should remove the least recently used item when the cache is full', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')
    cache.set('key4', 'value4') // This should remove 'key1'
    expect(cache.get('key1')).toBeUndefined()
    expect(cache.get('key2')).toBe('value2')
    expect(cache.get('key3')).toBe('value3')
    expect(cache.get('key4')).toBe('value4')
  })

  it('should move the accessed item to the head', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')
    cache.get('key2') // Access 'key2'
    cache.set('key4', 'value4') // This should remove 'key1'
    expect(cache.get('key1')).toBeUndefined()
    expect(cache.get('key2')).toBe('value2')
    expect(cache.get('key3')).toBe('value3')
    expect(cache.get('key4')).toBe('value4')
  })
})
