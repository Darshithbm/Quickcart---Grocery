import { createSlice } from '@reduxjs/toolkit'
import { io } from 'socket.io-client'
import { updateCartFromSocket } from './cartSlice'
import { updateOrderFromSocket } from './orderSlice'
import { updateProductStock } from './productSlice'

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    connection: null,
    connected: false,
  },
  reducers: {
    initializeSocket: (state, action) => {
      if (state.connection) {
        state.connection.disconnect()
      }
      
      const socket = io(
  import.meta.env.PROD
    ? 'https://quickcart-grocery-w7p6.onrender.com'
    : 'http://localhost:5000',
  {
    withCredentials: true,
    transports: ['websocket'],
  }
)
      
      state.connection = socket
      
      socket.on('connect', () => {
        state.connected = true
      })
      
      socket.on('disconnect', () => {
        state.connected = false
      })
      
      return state
    },
    disconnectSocket: (state) => {
      if (state.connection) {
        state.connection.disconnect()
        state.connection = null
        state.connected = false
      }
    },
  },
})

export const { initializeSocket, disconnectSocket } = socketSlice.actions

// Thunk to initialize socket with event listeners
export const initializeSocketWithListeners = () => (dispatch, getState) => {
  dispatch(initializeSocket())
  
  const { socket } = getState()
  
  if (socket.connection) {
    // Cart updates
    socket.connection.on('cartUpdated', (cartData) => {
      dispatch(updateCartFromSocket(cartData))
    })
    
    // Order updates
    socket.connection.on('orderUpdated', (orderData) => {
      dispatch(updateOrderFromSocket(orderData))
    })
    
    // Product stock updates
    socket.connection.on('productStockUpdated', (data) => {
      dispatch(updateProductStock(data))
    })
  }
}

export default socketSlice.reducer