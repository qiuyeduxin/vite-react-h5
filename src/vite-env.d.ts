/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_RENDERER_INTEGRATED_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare interface Window {
  root: HTMLElement
  FastClick: Record<string, any>
  chrome: Record<string, any>
}

// 类型声明文件 svga.d.ts
declare module '*.svga' {
  const content: any // 根据实际 SVGA 数据结构调整类型
  export default content
}
