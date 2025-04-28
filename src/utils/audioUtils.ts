/**
 * 音频工具类
 */
export default class AudioUtils {
  static cacheMap: Record<string, HTMLAudioElement> = ({} = {})
  /**
   * 加载音频
   * @param url
   */
  static load(url: string) {
    return new Promise((resolve, reject) => {
      if (AudioUtils.cacheMap[url]) {
        return resolve(AudioUtils.cacheMap[url])
      }

      const audio = document.createElement('audio')
      AudioUtils.cacheMap[url] = audio
      const onCanPlay = () => {
        AudioUtils.cacheMap[url] = audio
        resolve(audio)
      }
      audio.addEventListener('canplay', onCanPlay)
      audio.addEventListener('loadedmetadata', onCanPlay)
      audio.onerror = reject
      audio.onload = resolve
      audio.src = url
    })
  }

  /**
   * 预加载
   */
  static preload(...arrUrls: string[]) {
    if (!arrUrls || !arrUrls.length) {
      return
    }

    for (let i = 0; i < arrUrls.length; i++) {
      const url = arrUrls[i]
      if (AudioUtils.cacheMap[url]) {
        continue
      }

      AudioUtils.load(url)
    }
  }

  /**
   * 播放音频
   * @param url
   */
  static async play(url: string, loop = false) {
    if (!AudioUtils.cacheMap[url]) {
      await AudioUtils.load(url)
    }
    AudioUtils.cacheMap[url].loop = loop
    if (typeof AudioUtils.cacheMap[url].play === 'function') {
      AudioUtils.cacheMap[url].play()
    }
  }

  /**
   * 暂停音频
   * @param url
   */
  static async pause(url: string) {
    if (typeof AudioUtils.cacheMap[url]?.pause === 'function') {
      AudioUtils.cacheMap[url].pause()
    }
  }
}
