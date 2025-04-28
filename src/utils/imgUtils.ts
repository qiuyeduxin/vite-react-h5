/**
 * 图片工具类
 * ✅ 做图片预加载
 */
export default class ImgUtils {
  // 图片缓存M
  static IMGS_CACHE: Record<string, string> = {}
  /**
   * 加载图片
   * @param url
   */
  static load(url: string) {
    if (ImgUtils.IMGS_CACHE[url]) return url
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = url
      img.addEventListener('load', () => {
        ImgUtils.IMGS_CACHE[url] = url
        resolve(url)
      })
      img.addEventListener('error', reject)
    })
  }
  /**
   * 预加载
   */
  static preload(...arrUrls: string[]) {
    if (!arrUrls || !arrUrls.length) return
    for (let i = 0; i < arrUrls.length; i++) {
      const url = arrUrls[i]
      if (ImgUtils.IMGS_CACHE[url]) continue
      ImgUtils.load(url)
    }
  }
}

/**
 * @name url转base64
 * @param {string} url 图片资源地址
 * @param {string} type 图片格式，如jpg jpeg png
 * @return {base64} data:image/*;base64,**
 */
export function url2Base64(url: string, type = 'jpeg') {
  const imgType = `image/${type}`
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    img.crossOrigin = '*'
    img.onload = function () {
      const width = img.width
      const height = img.height
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, width, height)
      const base64 = canvas.toDataURL(imgType)
      resolve(base64)
    }
    img.onerror = function () {
      reject(new Error('资源加载异常'))
    }
    img.src = url
  })
}
