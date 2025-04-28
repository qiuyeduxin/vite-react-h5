/**
 * 全局loading
 *
 * @params {String} borderColor
 * @params {Boolean} visible
 */
import React from 'react'
import './loading.less'
import { classPrefix, type LoadingProps } from '.'

const Loading: React.FC<LoadingProps> = ({ visible, borderColor }) => {
  return (
    <div className={`${classPrefix}`} style={{ display: `${visible ? 'block' : 'none'}` }}>
      <div
        className="snake"
        style={{
          borderTopColor: borderColor,
          borderLeftColor: borderColor,
          borderBottomColor: borderColor
        }}
      ></div>
    </div>
  )
}

export default Loading
