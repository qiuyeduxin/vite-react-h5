/**
 * @name 全屏的蒙层
 * @param noscroll 禁止背景上下滑动，默认false，true-背景不可滑
 * @param isHigh 蒙层层级最高，默认false，true-遮盖h5导航条
 * @param alignItems 垂直排列 start-居上，end-居下，默认center-居中
 */
import React, { memo, useEffect } from 'react'
import classnames from 'classnames'
import cn from './modal.module.less'

const noop = () => {}

export interface ModalProps {
  visible: boolean
  noscroll?: boolean
  isHigh?: boolean
  animated?: boolean
  alignItems?: 'start' | 'end' | 'center'
  classname?: string
  onClose?: () => void
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  noscroll,
  isHigh = false,
  animated = false,
  alignItems = 'center',
  classname,
  children
}) => {
  useEffect(() => {
    document.body.style.overflow = visible && noscroll ? 'hidden' : 'inherit'
  }, [visible, noscroll])

  return (
    visible && (
      <div onClick={onClose || noop} className={classnames(cn.main, isHigh && cn.high, classname)}>
        <div className={classnames(cn.mask, cn[`mask_${alignItems}`])}>
          <div onClick={(e) => e.stopPropagation()} className={classnames(animated && cn.ani)}>
            {children}
          </div>
        </div>
      </div>
    )
  )
}

export default memo(Modal)
