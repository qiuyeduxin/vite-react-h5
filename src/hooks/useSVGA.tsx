/**
 * useSVGA hook
 * example:
 * import useSVGA from 'hooks/useSVGA'
 *
 * function FunctionalComponent() {
 *   const [svga1Ref, svga1Player] = useSVGA('/path/to/a.svga')
 *   const [svga2Ref, svga2Player] = useSVGA('/path/to/b.svga')
 *
 *   return <>
 *     <div ref={svga1Ref} className="classname" />
 *     <div ref={svga2Ref} />
 *   </>
 * }
 *
 */
import { MutableRefObject, useCallback, useEffect, useRef } from 'react'
import SVGA from 'svgaplayerweb'
import svga from 'src/utils/svga'

// 加载 svga 资源，支持资源复用
const loadSVGA = async (src: string) => {
  const result = svga.load(src)

  if (Object.prototype.toString.call(result) === '[object Promise]') {
    // eslint-disable-next-line no-return-await
    return await result
  } else {
    return result
  }
}

// svga player Properties
// 文档 https://github.com/svga/SVGAPlayer-Web/blob/master/README.zh.md#properties

// 统一设置 params
const setParams = (player: SVGA.Player, params: Record<string, any>) => {
  if (params?.loops !== undefined) {
    player.loops = params.loops
  }

  if (params?.clearsAfterStop !== undefined) {
    player.clearsAfterStop = params.clearsAfterStop
  }

  if (params?.fillMode !== undefined) {
    player.fillMode = params.fillMode
  }
}

type Ref = HTMLCanvasElement | HTMLDivElement | null

export default function useSVGA(
  src: string,
  params: Record<string, any> = {},
  autoplay = true
): [(ref: Ref) => void, MutableRefObject<SVGA.Player | null>] {
  // svag player
  const player = useRef<SVGA.Player | null>(null)
  // 目标 canvas
  const targetEl = useRef<Ref>(null)

  // 动态设置目标元素
  const setTargetEl = useCallback(
    (ref: Ref) => {
      if (ref && targetEl.current !== ref) {
        targetEl.current = ref
        loadSVGA(src)
          .then((svga) => {
            player.current = new SVGA.Player(ref)
            player.current.setVideoItem(svga)
            setParams(player.current, params)
            autoplay && player.current.startAnimation()

            // 目标元素卸载时，销毁 targetEl ref 中的引用
            ref.addEventListener('DOMAttributeNameChanged', () => {
              targetEl.current = null
            })
          })
          .catch((error) => {
            console.error('Failed to load SVGA:', error)
          })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [src]
  )

  // 组件退出时清空 svga
  useEffect(() => {
    return () => {
      // eslint-disable-next-line no-unused-expressions
      player.current?.stopAnimation()
    }
  }, [])

  return [setTargetEl, player]
}
