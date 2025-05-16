import React, { lazy, Suspense } from 'react'
import cn from './index.module.less'
import { BottomNav } from '../../components/BottomNav'
import NavBar from '../../components/NavBar'
import headerImage from 'src/resources/banner/202503/demo/head-bg.png'

const List = lazy(() => import('../../components/List'))

const DesPage: React.FC = () => {
  const title = 'Title'
  const subtitle = 'Subtitle'

  return (
    <div className={cn.container}>
      {/* 顶部导航栏 */}
      <NavBar title="商品列表" />

      {/* 页面内容 */}
      <div className={cn.content}>
        <div className={cn.header}>
          <img src={headerImage} alt="Header" className={cn.headerImage} />
          <div className={cn.titleContainer}>
            <h1 className={cn.title}>{title}</h1>
            <p className={cn.subtitle}>{subtitle}</p>
          </div>
          <div className={cn.mask}></div>
        </div>
        <Suspense fallback="">
          <List />
        </Suspense>
      </div>
      <BottomNav />
    </div>
  )
}

export default DesPage
