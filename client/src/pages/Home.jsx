import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProducts } from '../store/slices/productSlice'
import { 
  ShoppingCart, 
  Truck, 
  Shield, 
  Clock,
  Star,
  ArrowRight
} from 'lucide-react'

const Home = () => {
  const dispatch = useDispatch()
  const { items: products = [] } = useSelector(state => state.products)
  const { isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const featuredProducts = products.slice(0, 6)

  const features = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Fast Delivery',
      description: 'Get your groceries delivered in 30 minutes'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure Payment',
      description: 'Your payments are safe and secure with Stripe'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Real-time Updates',
      description: 'Live cart updates and order tracking'
    }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Fresh Groceries
            <span className="text-primary-600 dark:text-primary-400"> Delivered Fast</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Order your favorite groceries online and get them delivered to your doorstep in minutes. 
            Fresh, fast, and convenient shopping experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/products" 
              className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Start Shopping</span>
            </Link>
            {!isAuthenticated && (
              <Link 
                to="/register" 
                className="btn-outline text-lg px-8 py-3 inline-flex items-center justify-center space-x-2"
              >
                <span>Join Now</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Why Choose QuickCart?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Experience the future of grocery shopping with our premium features
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card p-8 text-center hover:scale-105 transition-transform">
              <div className="text-primary-600 dark:text-primary-400 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Featured Products
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Handpicked fresh items just for you
              </p>
            </div>
            <Link 
              to="/products" 
              className="btn-outline flex items-center space-x-2"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <div key={product._id} className="card overflow-hidden group">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <img
                    src={product.image || `https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400`}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      ₹{product.price}
                    </span>
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm">4.8</span>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {product.stock > 0 ? (
                      <span className="text-green-600 dark:text-green-400">
                        {product.stock} in stock
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">
                        Out of stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary-600 dark:bg-primary-700 rounded-2xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Start Shopping?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of satisfied customers and experience the convenience of QuickCart
        </p>
        <Link 
          to="/products" 
          className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Browse Products</span>
        </Link>
      </section>
    </div>
  )
}

export default Home