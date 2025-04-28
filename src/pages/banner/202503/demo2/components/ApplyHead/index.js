/**
 * @name 报名页头部
 */
import React, { useState } from 'react'
import cn from './style.module.less'
import { jumpToHome } from '../../common/tool'
import BackBtn from '../BackBtn'
import classnames from 'classnames'

const ApplyHead = ({ applyTime }) => {
  const [applyStatus] = useState(1)

  return (
    <div className={cn.main}>
      <BackBtn />
      <div className={cn.go_detail} onClick={jumpToHome}></div>
      <div className={cn.time}>
        <div className={cn.time_content}>报名时间：{applyTime}</div>
      </div>
      <div className={cn.mask}></div>
      {/* <div
        className={classnames(
          cn.pro,
          applyStatus === 1 && cn.pro_audit,
          applyStatus === 2 && cn.pro_success
        )}
      ></div> */}
    </div>
  )
}

export default ApplyHead
