import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrders } from '../store/slices/orderSlice'
import { Package, Clock, CheckCircle, XCircle, Truck, Download } from 'lucide-react'
import axios from '../utils/axiosInstance'
import toast from 'react-hot-toast'

const Orders = () => {
  const dispatch = useDispatch()
  const { userOrders, loading } = useSelector(state => state.orders)

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  const downloadReceipt = async (orderId) => {
    try {
      const response = await axios.get(`/orders/receipt/${orderId}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${orderId}.pdf`
      a.click()

      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast.error("Failed to download receipt")
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'confirmed': return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'preparing': return <Package className="h-5 w-5 text-orange-500" />
      case 'shipping': return <Truck className="h-5 w-5 text-purple-500" />
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'preparing': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'shipping': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const orders = Array.isArray(userOrders) ? userOrders : []

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-6">
          <Package className="h-24 w-24 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          No orders yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You haven't placed any orders yet. Start shopping to see your orders here.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          My Orders
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Track and manage your orders</p>
      </div>

      <div className="space-y-6">
        {orders.map(order => (
          <div key={order._id} className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(order.status)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Order #{order._id ? order._id.slice(-8).toUpperCase() : 'UNKNOWN'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-3 sm:mt-0">
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
                {order.paymentStatus === 'paid' && (
                  <button
                    onClick={() => downloadReceipt(order._id)}
                    className="flex items-center text-sm mt-2 sm:mt-0 text-indigo-600 hover:underline"
                  >
                    <Download className="h-4 w-4 mr-1" /> Receipt
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="grid gap-3">
                {order.items.map(item => (
                  <div key={item.product._id} className="flex items-center space-x-3">
                    <img
                      src={item.product.image || `https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=100`}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {order.shippingAddress && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Delivery Address
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
