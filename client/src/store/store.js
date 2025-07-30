import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import productSlice from './slices/productSlice'
import cartSlice from './slices/cartSlice'
import orderSlice from './slices/orderSlice'
import themeSlice from './slices/themeSlice'
import socketSlice from './slices/socketSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    cart: cartSlice,
    orders: orderSlice,
    theme: themeSlice,
    socket: socketSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['socket/initializeSocket'],
        ignoredPaths: ['socket.connection'],
      },
    }),
})