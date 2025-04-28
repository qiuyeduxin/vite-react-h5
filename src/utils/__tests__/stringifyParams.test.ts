import { stringifyParams } from '..'

test('stringifyParams', () => {
  expect(stringifyParams({ id: 2, type: 'a' })).toBe('id=2&type=a')
})

test('stringifyParams 第二个参数', () => {
  const fun = (val: string, _name?: string): string => {
    return val + '_xxxx'
  }
  expect(stringifyParams({ id: 2, type: 'a' }, fun)).toBe('id=2_xxxx&type=a_xxxx')
})

test('stringifyParams 空Object', () => {
  expect(stringifyParams({})).toBe('')
})
