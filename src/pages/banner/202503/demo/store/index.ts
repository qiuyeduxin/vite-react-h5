import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'

const initialState = {
  modalType: '',
  info: {} as Record<string, any>
}

const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    changeModalType(state, action) {
      state.modalType = action.payload
    },
    changeInfo(state, action) {
      state.info = action.payload
    }
  }
})

export const actions = mainSlice.actions
export const store = configureStore({
  reducer: { main: mainSlice.reducer }
})
export type RootState = ReturnType<typeof store.getState>

export const useAppDispatch = () => useDispatch<typeof store.dispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
