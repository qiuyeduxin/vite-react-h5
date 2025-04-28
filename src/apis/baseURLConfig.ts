import { IS_DEV } from 'src/config'

const APIS: Record<BaseURL, string> = {
  root: '/'
}

export enum BaseURL {
  root = 'root'
}

export default (urlOrigin: BaseURL): string => {
  if (IS_DEV) {
    return '/'
  }
  return APIS[urlOrigin]
}
