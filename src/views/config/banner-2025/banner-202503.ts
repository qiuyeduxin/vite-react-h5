import { createBaseView } from '../../utils'

export const DEMO = {
  ...createBaseView({
    'banner/202503/demo': 'demo750挑战赛'
  })
}

export const DEMO2 = {
  ...createBaseView({
    'banner/202503/demo2': 'demo2挑战赛'
  })
}

export const DEMO375 = {
  ...createBaseView(
    {
      'banner/202503/demo375': 'demo375挑战赛'
    },
    { baseSize: 375 }
  )
}
