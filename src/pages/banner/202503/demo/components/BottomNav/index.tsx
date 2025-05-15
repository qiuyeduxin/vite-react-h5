import React from 'react'
import cn from './bottomNav.module.less'
import classNames from 'classnames'

export const BottomNav: React.FC = () => {
  const [actTab, setActTab] = React.useState<string>('home')
  const menuItems: Record<string, any>[] = [
    { key: 'home', label: '首页' },
    { key: 'shop', label: '购物车' },
    { key: 'user', label: '我的' }
  ]

  return (
    <div className={cn.navContainer}>
      {menuItems.map((item) => (
        <div
          className={classNames(cn.navItem, actTab === item.key && cn.act)}
          key={item.key}
          onClick={() => setActTab(item.key)}
        >
          <span className={classNames(cn.navIcon, cn[`navIcon_${item.key}`])} />
          <span className={cn.navLabel}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
