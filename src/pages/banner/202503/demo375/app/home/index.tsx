import React, { lazy, Suspense, useState } from 'react'
import cn from './home.module.less'
import apis from '../../apis'
import { cloneDeep } from 'lodash-es'

const applyConfig = cloneDeep({
  time: '3月5日12点-3月8日18点',
  name: '报名页',
  body: [
    {
      type: 'img',
      props: {
        src: 'https://img.ranyanw.cn/MTc0MTA2MDg3NDkxNyMyMTEjcG5n.png',
        alt: 'title'
      }
    },
    {
      type: 'text',
      props: {
        indent: true,
        texts: [
          '    《舞限挑战赛》是为全站视频舞蹈主播准备的才艺比拼活动，本次比赛只比才艺不比收益。赛程分为初赛，复赛，决赛三个阶段，各阶段晋级主播都将获得丰厚奖励，具体比赛规则及奖励见活动详情。'
        ]
      }
    },
    {
      type: 'img',
      props: {
        src: 'https://img.ranyanw.cn/MTc0MTA2MDg3MTM1OSM4MjYjcG5n.png',
        alt: 'title'
      }
    },
    {
      type: 'desc',
      props: {
        label: '报名时间：',
        content: ['3月5日12点-3月8日18点']
      }
    },
    {
      type: 'desc',
      props: {
        label: '面向主播：',
        content: [
          '全站视频主播（包括PC主播）',
          '*曾多次进入才艺赛决赛的主播，本次报名将不予通过。',
          '本次主题：舞蹈（要求有完整连贯的舞蹈动作，要有美感）'
        ]
      }
    },
    {
      type: 'desc',
      props: {
        label: '报名流程：',
        content: ['']
      }
    },
    {
      type: 'text',
      props: {
        texts: [
          '1.点击【立即报名】按钮',
          '2.录制精彩回放（如已有精彩回放可不录制）',
          '3.等待官方审核',
          '4.审核通过，等待活动正式启动'
        ]
      }
    }
  ]
})

const isMobile = window.navigator.userAgent.includes('Mobile')

const ApplyHead = lazy(() => import('../../components/ApplyHead'))
const ApplyContent = lazy(() => import('../../components/ApplyContent'))
const ModalApply = lazy(() => import('../../components/ModalApply'))

const Home: React.FC = () => {
  const [modalVisible, setModalVisible] = useState('')

  const showApplyModal = () => {
    apis
      .getInfo({
        uid: '1473869'
      })
      .catch((err) => {
        console.log('getInfo err', err)
      })
      .finally(() => {
        setModalVisible('show')
      })
  }

  const closeModal = () => {
    setModalVisible('')
  }

  return (
    <div className={cn.main}>
      <Suspense fallback={<div>加载中...</div>}>
        <ApplyHead applyTime={applyConfig.time + isMobile} />
      </Suspense>
      <Suspense fallback={<div>加载中...</div>}>
        <ApplyContent onShowApplyModal={showApplyModal} comps={applyConfig.body || []} />
      </Suspense>
      {modalVisible && (
        <Suspense fallback={<div>加载中...</div>}>
          <ModalApply type={modalVisible} onClose={closeModal} />
        </Suspense>
      )}
    </div>
  )
}

export default Home
