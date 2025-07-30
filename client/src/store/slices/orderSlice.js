import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../utils/axiosInstance'
import { saveAs } from 'file-saver'

const API_URL = '/orders'

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/all`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all orders')
    }
  }
)

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, orderData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order')
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${orderId}/status`, { status })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status')
    }
  }
)

// ✅ NEW: Download receipt thunk
export const downloadReceipt = createAsyncThunk(
  'orders/downloadReceipt',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${orderId}/receipt`, {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      saveAs(blob, `receipt-${orderId.slice(-8)}.pdf`)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download receipt')
    }
  }
)

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    userOrders: [],
    allOrders: [],
    loading: false,
    error: null,
    currentOrder: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
    updateOrderFromSocket: (state, action) => {
      const updatedOrder = action.payload

      const userOrderIndex = state.userOrders.findIndex(order => order._id === updatedOrder._id)
      if (userOrderIndex !== -1) {
        state.userOrders[userOrderIndex] = updatedOrder
      }

      const allOrderIndex = state.allOrders.findIndex(order => order._id === updatedOrder._id)
      if (allOrderIndex !== -1) {
        state.allOrders[allOrderIndex] = updatedOrder
      }

      if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
        state.currentOrder = updatedOrder
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.userOrders = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false
        state.allOrders = action.payload
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(createOrder.pending, (state) => {
        state.loading = true
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.userOrders.unshift(action.payload.order)
        state.currentOrder = action.payload.order
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.payload
      })

      // Optional: handle receipt download status (not required unless UI needs it)
      .addCase(downloadReceipt.pending, (state) => {
        state.loading = true
      })
      .addCase(downloadReceipt.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(downloadReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, setCurrentOrder, updateOrderFromSocket } = orderSlice.actions
export default orderSlice.reducer
