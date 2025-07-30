import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../store/slices/orderSlice'
import { clearCart } from '../store/slices/cartSlice'
import { CreditCard, MapPin, User, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '../utils/axiosInstance'

const Checkout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, totalAmount } = useSelector(state => state.cart)
  const { loading } = useSelector(state => state.orders)

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  })

  const [paymentMethod, setPaymentMethod] = useState('razorpay')

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
      toast.error('Your cart is empty')
    }
  }, [items, navigate])

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode']
    for (let field of required) {
      if (!shippingInfo[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }
    return true
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async (orderData) => {
    const res = await loadRazorpayScript()
    if (!res) {
      toast.error("Failed to load Razorpay")
      return
    }

    try {
      const razorpayOrder = await axios.post('/payments/razorpay-order', {
        amount: orderData.totalAmount * 100 // in paise
      })

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.data.amount,
        currency: "INR",
        name: "QuickCart",
        description: "QuickCart Purchase",
        order_id: razorpayOrder.data.id,
        handler: async function (response) {
          orderData.razorpayPaymentId = response.razorpay_payment_id
          await dispatch(createOrder(orderData)).unwrap()
          await dispatch(clearCart())
          toast.success("Order placed successfully!")
          navigate('/orders')
        },
        prefill: {
          name: shippingInfo.fullName,
          email: shippingInfo.email,
          contact: shippingInfo.phone
        },
        theme: { color: "#6366F1" }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (err) {
      console.error(err)
      toast.error("Payment initiation failed")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const orderData = {
      items: items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      shippingAddress: shippingInfo, // ✅ fixed: spread directly instead of nested object
      paymentMethod,
      totalAmount: totalAmount + 2.99 + totalAmount * 0.08
    }

    if (paymentMethod === 'cod') {
      try {
        await dispatch(createOrder(orderData)).unwrap()
        await dispatch(clearCart())
        toast.success('Order placed successfully!')
        navigate('/orders')
      } catch (err) {
        toast.error(err || 'Order failed')
      }
    } else {
      handlePayment(orderData)
    }
  }

  const subtotal = totalAmount
  const deliveryFee = 2.99
  const tax = totalAmount * 0.08
  const total = subtotal + deliveryFee + tax

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" /> Delivery Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'fullName', icon: User, placeholder: 'Full Name' },
                { name: 'email', icon: null, placeholder: 'Email', type: 'email' },
                { name: 'phone', icon: Phone, placeholder: 'Phone', type: 'tel' },
                { name: 'address', placeholder: 'Address', colSpan: true },
                { name: 'city', placeholder: 'City' },
                { name: 'state', placeholder: 'State' },
                { name: 'zipCode', placeholder: 'ZIP Code' }
              ].map((field) => (
                <div key={field.name} className={field.colSpan ? "md:col-span-2" : ""}>
                  <input
                    name={field.name}
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={shippingInfo[field.name]}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" /> Payment Method
            </h2>
            <label className="flex items-center mb-3">
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={paymentMethod === 'razorpay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              Pay with Razorpay
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              Cash on Delivery
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-lg"
          >
            {loading ? "Processing Order..." : `Place Order - ₹${total.toFixed(2)}`}
          </button>
        </form>
      </div>

      {/* Summary */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {items.map(item => (
          <div key={item.product._id} className="flex justify-between text-sm mb-2">
            <span>{item.product.name} x{item.quantity}</span>
            <span>₹{(item.quantity * item.product.price).toFixed(2)}</span>
          </div>
        ))}
        <hr />
        <div className="flex justify-between mt-2">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span>₹{deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg mt-3 border-t pt-3">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default Checkout
