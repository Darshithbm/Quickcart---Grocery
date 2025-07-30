import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../../store/slices/productSlice'
import { fetchAllOrders } from '../../store/slices/orderSlice'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Banknote
} from 'lucide-react'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { items: products } = useSelector(state => state.products)
  const { allOrders: orders } = useSelector(state => state.orders)

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchAllOrders())
  }, [dispatch])

  // Calculate statistics
  const totalProducts = products.length
  const lowStockProducts = products.filter(product => product.stock < 10).length
  const totalOrders = orders.length
  const pendingOrders = orders.filter(order => order.status === 'pending').length
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const recentOrders = orders.slice(0, 5)

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: <Package className="h-8 w-8" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: <ShoppingCart className="h-8 w-8" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toFixed(2)}`,
      icon: <Banknote className="h-8 w-8" />,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: <Clock className="h-8 w-8" />,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'preparing':
        return <Package className="h-4 w-4 text-orange-500" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your QuickCart store and monitor performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/admin/products" 
            className="btn-primary flex items-center justify-center space-x-2 py-3"
          >
            <Package className="h-5 w-5" />
            <span>Manage Products</span>
          </Link>
          <Link 
            to="/admin/orders" 
            className="btn-secondary flex items-center justify-center space-x-2 py-3"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Manage Orders</span>
          </Link>
          <button className="btn-outline flex items-center justify-center space-x-2 py-3">
            <TrendingUp className="h-5 w-5" />
            <span>View Analytics</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Recent Orders
            </h2>
            <Link 
              to="/admin/orders" 
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.user?.name || 'Unknown Customer'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {order.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No orders yet
              </p>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              Low Stock Alert
            </h2>
            <Link 
              to="/admin/products" 
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
            >
              Manage Stock
            </Link>
          </div>
          
          <div className="space-y-3">
            {products.filter(product => product.stock < 10).length > 0 ? (
              products
                .filter(product => product.stock < 10)
                .slice(0, 5)
                .map(product => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image || `https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=100`}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {product.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-orange-600 dark:text-orange-400">
                        {product.stock} left
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${product.price}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                All products are well stocked!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard