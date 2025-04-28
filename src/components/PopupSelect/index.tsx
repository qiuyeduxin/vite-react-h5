/**
 * @name 半屏弹窗，上方留白
 */
import React, { memo, useEffect } from 'react'
import classnames from 'classnames'

import cn from './popupselect.module.less'

interface PopupSelectProps {
  visible: boolean
  maxHeight: number
  top: number
  onClose?: () => void
  animated?: boolean
  noscroll?: boolean
  classname?: string
  children?: any
}
const PopupSelect: React.FC<PopupSelectProps> = ({
  visible,
  maxHeight = 0.7, // 最大高度，默认70%
  top = 0, // 上方留白的高度
  onClose = () => {},
  animated = true, // 弹窗动效
  noscroll = true, // 背景不可滑
  classname,
  children
}) => {
  useEffect(() => {
    // noscroll 禁止背景上下滑动
    visible && noscroll
      ? (document.body.style.overflow = 'hidden')
      : (document.body.style.overflow = 'inherit')
  }, [visible, noscroll])

  if (!visible) return null

  return (
    <div onClick={onClose} className={cn.main} style={{ top: `${top}px` }}>
      <div
        className={classnames(cn.content, animated && cn.content_fadein, classname)}
        style={{ maxHeight: `${maxHeight * 100}%` }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default memo(PopupSelect)
