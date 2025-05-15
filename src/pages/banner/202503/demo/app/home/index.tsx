import React, { useEffect, useState } from 'react'
import cn from './index.module.less'
import { BottomNav } from '../../components/BottomNav'
import NavBar from '../../components/NavBar'
import headerImage from 'src/resources/banner/202503/demo/header-image.png'
import classnames from 'classnames'
import apis from '../../apis'
import { List, PullToRefresh, Toast } from 'antd-mobile'
import { delay } from 'es-toolkit'

const PAGE_SIZE = 10

const DesPage: React.FC = () => {
  const title = 'Title'
  const subtitle = 'Subtitle'
  const [curPage, setCurPage] = useState(1)
  const [{ list, total }, setData] = useState<{ list: Record<string, any>[]; total: number }>({
    list: [],
    total: 0
  })

  useEffect(() => {
    apis.getInfo({ page: curPage, size: PAGE_SIZE }).then((res) => {
      setData((old) => {
        return {
          list: [...(curPage === 1 ? [] : old.list), ...res.data.list],
          total: res.data.total
        }
      })
    })
  }, [curPage])

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
        </div>
        <div className={cn.list}>
          <div className={cn.sectionHeader}>
            <h2 className={cn.sectionTitle}>Section title</h2>
            <p className={cn.distance}>Within 5 miles • $$-$$$</p>
          </div>
          <PullToRefresh
            onRefresh={async () => {
              if (total > list.length + (curPage - 1) * PAGE_SIZE) {
                Toast.show({
                  content: 'loading...',
                  icon: 'loading'
                })
                await delay(1000)
                setCurPage((p) => p + 1)
              }
            }}
          >
            <List>
              {list.map((item) => (
                <List.Item className={cn.listItem} key={item.id}>
                  <div className={cn.itemContent}>
                    <div className={cn.itemAvatar}>
                      <img className={cn.itemAvatarImage} src={item.avatar} alt="avatar" />
                    </div>
                    <div className={cn.itemDetails}>
                      <div className={cn.itemTitle}>
                        <h3 className={cn.itemTitleText}>{item.title}</h3>
                        <div className={cn.reviews}>
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={classnames(cn.star, i < item.star && cn.star_act)}
                            ></div>
                          ))}
                        </div>
                      </div>
                      <p className={cn.category}>{item.category}</p>
                      <p className={cn.description}>{item.description}</p>
                    </div>
                  </div>
                </List.Item>
              ))}
            </List>
          </PullToRefresh>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

export default DesPage
