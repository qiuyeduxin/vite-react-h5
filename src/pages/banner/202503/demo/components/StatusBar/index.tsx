import React from 'react';
import cn from './statusBar.module.less';
import cellular from 'src/resources/banner/202503/demo/cellular.svg';
import wifi from 'src/resources/banner/202503/demo/wifi.svg';
import battery from 'src/resources/banner/202503/demo/battery.svg';

export const StatusBar: React.FC = () => (
  <div className={cn.statusBar}>
    <div className={cn.time}>9:41</div>
    <div className={cn.icons}>    
      <img src={cellular} className={cn.icon} />
      <img src={wifi} className={cn.icon} />
      <img src={battery} className={cn.icon} />
    </div>
  </div>
);