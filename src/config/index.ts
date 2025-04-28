export const IS_DEV = process.env.NODE_ENV === 'development'

/**
 * 预渲染中: 非开发模式 && html中 data-prerendered (预渲染完成) 为false
 */
// @ts-ignore
export const isPrerendering = !IS_DEV && window.__PRERENDER_INJECTED__ === 'prerender'
