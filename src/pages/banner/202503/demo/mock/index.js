export default {
  enable: true,
  '/api/v1/shop/list': ({ query: { page, size = 10 } }) => {
    const list = Array(page < 3 ? Math.floor(10) : 0)
      .fill(0)
      .map((_, i) => {
        const id = (page - 1) * size + i + 1
        return {
          id,
          title: 'List item ' + id,
          category: id % 3 ? 'shop' : 'restaurant',
          star: id % 5,
          avatar: '/favicon.png',
          description: 'Description for list item ' + id
        }
      })
    return {
      //  活动信息及报名进度
      code: 0,
      msg: '操作成功',
      data: {
        list,
        total: 32
      }
    }
  }
}
