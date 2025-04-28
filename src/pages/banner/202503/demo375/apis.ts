import axios from 'axios'

class Apis {
  getInfo = (params: any) =>
    axios
      .get('/api/v1/shop/activity/logic/talent/show/race/info', { params })
      .then((res) => res.data)
}

export default new Apis()
