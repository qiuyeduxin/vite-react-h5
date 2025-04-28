export default {
  enable: true,
  '/api/v1/shop/activity/logic/talent/show/race/info': () => ({
    //  活动信息及报名进度
    dm_error: 0,
    error_msg: '操作成功',
    data: {
      stage: 1, // 活动阶段 1-报名阶段
      apply_status: 2, // 报名状态 -1 待定；0-未报名；1-申请中；2-已成功；3-已驳回
      apply_tip: '', // 申请提示
      has_nice_play: false, // 是否有精彩回放
      apply_type: 1 // 申请类型1-舞蹈；2-音乐；3-乐器；4-曲艺
    }
  }),
  '/api/v1/shop/activity/logic/talent/show/race/apply': () => ({
    //  报名接口
    dm_error: 0,
    error_msg: '操作成功',
    data: {
      tip: '每天只能报名3次', // 报名状态。为true报名成功，false 提示 TIP 信息
      success: false
    }
  })
}
