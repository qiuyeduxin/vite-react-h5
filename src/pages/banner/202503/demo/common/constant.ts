export const TAB_1 = 1

export const TAB_2 = 2

export const TAB_3 = 3

export const MODAL_APPLY = 'MODAL_APPLY' // 弹窗 报名
export const MODAL_TASK = 'MODAL_TASK' // 弹窗 任务
export const MODAL_VOTE_TIP = 'MODAL_VOTE_TIP' // 弹窗 投票提示

export const isDev = process && process.env.NODE_ENV === 'development'

export const RANK_TYPE = [
  {
    key: TAB_1,
    name: '初赛'
  },
  {
    key: TAB_2,
    name: '复赛'
  },
  {
    key: TAB_3,
    name: '决赛'
  }
]
