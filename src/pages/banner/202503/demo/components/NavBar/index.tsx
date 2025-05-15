import React from 'react'
import cn from './navBar.module.less'
import { StatusBar } from '../StatusBar'

type Props = {
  title: string
  onBack?: () => void
}

const NavBar: React.FC<Props> = ({ title, onBack }) => (
  <div className={cn.main}>
    <StatusBar />
    <div className={cn.navBar}>
      <div className={cn.backArrow} onClick={onBack} />
      <div className={cn.title}>{title}</div>
    </div>
  </div>
)

export default NavBar
