import entry, { loadingWhenFcp } from 'src/entry'
import App from './app/home'
import store from './store'
import ImgUtils from 'src/utils/imgUtils'
import headBg from 'src/resources/banner/202503/demo/head-bg.png'
import 'src/services/log'

ImgUtils.preload(headBg)

loadingWhenFcp()

entry(App, {
  store
})
