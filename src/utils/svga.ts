import SVGA from 'svgaplayerweb'

class Svga {
  static svgaMap: Record<string, any> = {}

  /**
   * 加载svga
   */
  static load(url: string): Promise<SVGA.VideoEntity> {
    if (Svga.svgaMap[url]) return Svga.svgaMap[url]
    Svga.svgaMap[url] = new Promise((resolve, reject) => {
      const svgaDiv = document.createElement('div')
      svgaDiv.style.display = 'none'
      svgaDiv.setAttribute('id', 'svga-div')
      document.body.appendChild(svgaDiv)
      const parser = new SVGA.Parser()
      parser.load(
        url,
        (videoItem) => {
          Svga.svgaMap[url] = videoItem
          resolve(videoItem)
          svgaDiv.remove()
        },
        (e) => {
          reject(e)
        }
      )
    }).catch((e) => {
      Svga.svgaMap[url] = undefined
      throw e
    })
    return Svga.svgaMap[url]
  }

  /**
   * 预加载svga
   */
  static preload(...arrUrls: string[]) {
    if (!arrUrls || !arrUrls.length) return
    for (let i = 0; i < arrUrls.length; i++) {
      const url = arrUrls[i]
      if (Svga.svgaMap[url]) continue
      this.load(url)
    }
  }

  /**
   * 播放svga
   * @param option.selector 承载svga的元素选择器，例如: #svga-anim
   * @param option.url svga动画url地址
   * @param option.loops 动画循环次数
   * @param option.onFinished 动画播放完成回掉函数
   */
  static async play(option: {
    selector: string
    url: string
    loops?: number
    onFinished?: () => void
    onFrame?: (frame: number) => void
  }) {
    try {
      const player = new SVGA.Player(option.selector)
      option.onFinished && player.onFinished(option.onFinished)
      option.onFrame && player.onFrame(option.onFrame)
      player.loops = option.loops || 0
      let videoItem
      if (toString.call(Svga.svgaMap[option.url]) === '[object Promise]') {
        videoItem = await Svga.svgaMap[option.url]
      } else {
        videoItem = await Svga.load(option.url)
      }
      // console.log('player: ', player);
      player.setVideoItem(videoItem)
      player.startAnimation()
      return player
    } catch (e) {
      throw e
    }
  }
}
export default Svga
