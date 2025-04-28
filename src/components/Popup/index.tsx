/**
 * @name 底部半屏弹窗
 */
import React, { memo, useEffect } from 'react'
import classnames from 'classnames'

import cn from './popup.module.less'

interface PopupProps {
  visible: boolean
  classname?: string
  height: number
  noscroll?: boolean
  animated?: boolean
  noMoveUp?: boolean
  isHigh?: boolean
  onClose?: () => void
  children?: any
}
const Popup: React.FC<PopupProps> = ({
  visible,
  classname,
  height = 0.7, // 弹窗高度，默认70%
  onClose = () => {},
  noscroll = true, // 背景不可滑
  animated = true, // 弹窗动效
  noMoveUp = false, // 调起键盘时，页面是否上移，默认可上移
  isHigh = false, // 蒙层层级，默认false，true-遮盖h5导航条
  children
}) => {
  /**
   * 始终固定弹窗内容高度：(height * 100)%
   * 转为px，目的是防止屏幕高度变化时弹窗上下移动
   * 用作调起键盘时禁止页面上滑
   */
  const distanceTopHeight = document.documentElement.clientHeight * (1 - height) + 'px'
  const defalutheigth = height * 100 + '%'

  useEffect(() => {
    // noscroll 禁止背景上下滑动
    visible && noscroll
      ? (document.body.style.overflow = 'hidden')
      : (document.body.style.overflow = 'inherit')
  }, [visible, noscroll])

  if (!visible) return null

  return (
    <div onClick={onClose} className={classnames(cn.main, isHigh && cn.main_high)}>
      <div className={cn.mask}>
        <div
          className={classnames(cn.content, classname, animated && cn.content_fadein)}
          style={{
            minHeight: noMoveUp ? `calc(100% - ${distanceTopHeight})` : defalutheigth,
            maxHeight: noMoveUp ? `calc(100% - ${distanceTopHeight})` : defalutheigth
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default memo(Popup)
