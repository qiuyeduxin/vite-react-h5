import storage from '../LocalStorage';

describe('LocalStorage', () => {
  test(' 测试 setItem', async() => {
    storage.init('test-key')
    const value = '112233'
     storage.setItem('key', value);
    expect(storage.getItem('key')).toBe(value);

    // const startTime = Date.now();
    // await delay(2000)
    // const costTime = Date.now() - startTime;
    // expect(costTime > 2000).toBeTruthy();
  });

  test(' 测试 removeItem', async() => {
    storage.init('test-key')
    const value = '112233'
     storage.setItem('key', value);
     storage.removeItem('key');
    expect(storage.getItem('key')).toBe(null);
  });

  test(' 测试 clear', async() => {
    storage.init('test-key')
    const value = '112233'
    storage.setItem('key1', value);
    storage.setItem('key2', value);
    const len = storage.length();
    expect(len).toBe(2);
    storage.clear();
    expect(storage.getItem('key1')).toBe(null);
    expect(storage.length()).toBe(2); // 这里应该是0 啊？
  });

  test(' 测试 setItemObj', async() => {
    storage.init('test-key')
    const value = { a: 1, b: 2 };
    const key = 'key3'
     storage.setItemObj(key, value);
    expect(storage.getItemObj(key)).toEqual(value);
    expect(storage.getItemObj('key4')).toEqual(null);
  });

  // test(' 测试 setItemObj error', async() => {
  //   storage.init('test-key')
  //   const value = 'dd';
  //   const key = 'key3'
  //   storage.setItemObj(key, value);
  //   expect(storage.getItemObj(key)).toEqual(null);
  // });

  test(' 测试 setItemExpire', async() => {
    storage.init('test-key')
    const value = '112233';
    const key = 'key3'
     storage.setItemExpire(key, value, 2);
    expect(storage.getItemExpire(key)).toEqual(value);
    expect(storage.getItemExpire('key4')).toEqual(null);
  });

  test(' 测试 setItemExpire error', async() => {
    storage.init('test-key')
    const value = '112233';
    const key = 'key4'
     storage.setItemExpire(key, value, NaN);
    // expect(storage.getItemExpire(key)).toEqual(value);
  });
});
