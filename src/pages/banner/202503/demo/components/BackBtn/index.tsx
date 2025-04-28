/**
 * @component 返回按钮
 */
import React from 'react'
import { closePage } from '../../common/tool'
import cn from './backbtn.module.less'

const BackBtn: React.FC = () => {
  return (
    <div className={cn.main} style={{ height: 64 }} onClick={closePage}>
      <div className={cn.close}></div>
      <div className={cn.logo}></div>
    </div>
  )
}

export default BackBtn
