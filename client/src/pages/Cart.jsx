import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../store/slices/cartSlice'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const Cart = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, totalAmount, totalItems, loading } = useSelector(state => state.cart)

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      await dispatch(updateCartItem({ productId, quantity: newQuantity })).unwrap()
    } catch (error) {
      toast.error(error || 'Failed to update quantity')
    }
  }

  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap()
      toast.success('Item removed from cart')
    } catch (error) {
      toast.error(error || 'Failed to remove item')
    }
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart()).unwrap()
        toast.success('Cart cleared')
      } catch (error) {
        toast.error(error || 'Failed to clear cart')
      }
    }
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-6">
          <ShoppingBag className="h-24 w-24 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Your cart is empty
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Start shopping to add items to your cart
        </p>
        <Link to="/products" className="btn-primary inline-flex items-center space-x-2">
          <ShoppingBag className="h-5 w-5" />
          <span>Start Shopping</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        
        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
          >
            Clear Cart
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product._id} className="card p-6 flex items-center space-x-4">
              <img
                src={item.product.image || `https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200`}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {item.product.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  ${item.product.price} each
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {item.product.category}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Quantity controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <span className="w-12 text-center font-medium">
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Price */}
                <div className="w-20 text-right">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                
                {/* Remove button */}
                <button
                  onClick={() => handleRemoveItem(item.product._id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery Fee</span>
                <span>$2.99</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>${(totalAmount * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <span>Total</span>
                  <span>${(totalAmount + 2.99 + totalAmount * 0.08).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            
            <div className="mt-4 text-center">
              <Link 
                to="/products" 
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart