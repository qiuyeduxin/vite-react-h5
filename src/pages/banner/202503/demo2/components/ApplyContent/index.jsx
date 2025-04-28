/**
 * @name 报名页内容
 */
import React, { useState } from 'react'
import cn from './style.module.less'

const ApplyContent = ({ onShowApplyModal, comps }) => {
  const [applyStatus] = useState(0)

  const renderBottom = () => {
    if (applyStatus === 2) {
      // 报名成功
      return <div className={cn.bottom_success}></div>
    }
    if ([-1, 1].includes(applyStatus)) {
      // 审核中
      return <div className={cn.bottom_audit}></div>
    }
    if (applyStatus >= 0) {
      return <div className={cn.bottom_apply} onClick={onShowApplyModal}></div>
    }
  }

  const renderComp = (item, index) => {
    const { props, type } = item
    switch (type) {
      case 'img':
        return <img key={index} src={props.src} alt={props.alt} className={cn.img} />
      case 'text':
        return (
          <div key={index} className={cn.text}>
            {props.texts.map((t, i) => (
              <div key={i} dangerouslySetInnerHTML={{ __html: t.replace(/\n/g, '<br />') }}></div>
            ))}
          </div>
        )
      case 'desc':
        return (
          <div key={index} className={cn.desc}>
            <div className={cn.desc_label}>{props.label}</div>
            <div className={cn.desc_content}>
              {props.content.map((c, i) => (
                <div
                  key={i}
                  dangerouslySetInnerHTML={{
                    __html: c.replace(/\n/g, '<br />')
                  }}
                />
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={cn.main}>
      <div className={cn.main_content}>
        {comps.map(renderComp)}
        {renderBottom()}
      </div>
    </div>
  )
}

export default ApplyContent
