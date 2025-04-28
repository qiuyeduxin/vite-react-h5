/**
 * @component 弹窗 报名
 */
import React from 'react'
import classnames from 'classnames'
import cn from './modalaudit.module.less'
import CModal from 'src/components/Modal'

interface ModalApplyProps {
  onClose: () => void
}

const ModalApply: React.FC<ModalApplyProps> = ({ onClose }) => {
  const handleOpenRecord = () => {
    // 报名成功后唤起客户端方法
  }

  return (
    <div className={cn.main}>
      <div className={classnames(cn.desc, cn.desc_no)}>
        您当前没有精彩回放，请尽快录制才艺，完成报名
      </div>
      <div className={cn.bottom}>
        <div className={classnames(cn.bottom_item, cn.bottom_think_again)} onClick={onClose}></div>
        <div
          className={classnames(cn.bottom_item, cn.bottom_record_now)}
          onClick={handleOpenRecord}
        ></div>
      </div>
    </div>
  )
}

interface ModalContentProps {
  onClose: () => void
  type: string
}

const ModalContentProps: React.FC<ModalContentProps> = ({ onClose, type }) => {
  return (
    <CModal visible={!!type} onClose={onClose} noscroll={true} alignItems="center">
      <ModalApply onClose={onClose} />
    </CModal>
  )
}

export default ModalContentProps
