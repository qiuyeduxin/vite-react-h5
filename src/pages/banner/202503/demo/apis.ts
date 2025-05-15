import { getReqByBaseURL } from 'src/apis'
import getBaseURL, { BaseURL } from 'src/apis/baseURLConfig'

const { get } = getReqByBaseURL({ baseURL: getBaseURL(BaseURL.root) })

class Apis {
  getInfo = get('/api/v1/shop/list')
}

export default new Apis()
