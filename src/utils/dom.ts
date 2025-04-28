import { stringifyParams } from 'src/utils'

export function insertTagToDocument(
  tagName: string,
  url: string,
  params: string | Record<string, any>,
  asyncOrDefer: string = 'async'
) {
  return new Promise((resolve, reject) => {
    const elem = document.createElement(tagName) as any
    const firstElem = document.getElementsByTagName(tagName)[0]
    elem[asyncOrDefer] = 1
    elem.src = url

    if (params instanceof Object) {
      url += '?' + stringifyParams(params)
    } else if (typeof params === 'string') {
      url += '?' + params
    }

    if (firstElem?.parentNode) {
      firstElem.parentNode.insertBefore(elem, firstElem)
    } else {
      document.head.appendChild(elem)
    }

    elem.onload = resolve
    elem.onerror = reject
  })
}

/**
 * 将像素(px)值转换为响应式布局单位(rem或vw)
 * 此函数根据视口宽度动态计算转换值，旨在提高网页的响应式设计灵活性
 *
 * @param px {number} 需要转换的像素值
 * @param targetUnit {string} 目标单位，默认为'rem'，也可以是'vw'
 * @returns {string} 转换后的值，带有目标单位
 */
export function pxToRemVw(px: number, targetUnit: string = 'rem') {
  // 获取视口宽度的基础像素值，用于计算转换比率
  let basePx = Number(process.env.VIEW_WIDTH)

  // 如果目标单位是'vw'，则需要将基础像素值除以100，以适应vw单位的定义
  if (targetUnit === 'vw') {
    basePx = basePx / 100
  }

  // 根据计算得到的基础像素值，将输入的像素值转换为相应的目标单位值
  // toFixed(6)确保结果有6位小数，以提高精度
  return (px / basePx).toFixed(6) + targetUnit
}
