import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  modalType: ''
}

const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    changeModalType(state, action) {
      state.modalType = action.payload
    }
  }
})

export const actions = mainSlice.actions
export const store = configureStore({
  reducer: { main: mainSlice.reducer }
})

export default store
