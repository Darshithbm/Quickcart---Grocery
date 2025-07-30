const express = require('express')
const Order = require('../models/Order.cjs')
const { auth, adminAuth } = require('../middleware/auth.cjs')
const generateReceiptPDF = require('../utils/pdfGenerator.cjs')
const path = require('path')
const fs = require('fs')

const router = express.Router()

router.get('/receipt/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('items.product')

    if (!order || !order.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to access this receipt' })
    }

    const receiptPath = path.join(__dirname, '..', 'receipts', `receipt-${order._id}.pdf`)

    if (!fs.existsSync(receiptPath)) {
      await generateReceiptPDF(order)
    }

    res.download(receiptPath, `receipt-${order._id}.pdf`)
  } catch (error) {
    console.error('Receipt download error:', error)
    res.status(500).json({ message: 'Failed to generate receipt' })
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      notes,
      razorpayPaymentId,
    } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' })
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total amount' })
    }

    const order = new Order({
      user: req.user._id,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress,
      paymentMethod,
      totalAmount,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      stripePaymentIntentId: razorpayPaymentId || '',
      notes: notes || '',
    })

    const savedOrder = await order.save()
    await savedOrder.populate('items.product')

    //Generate PDF receipt
    await generateReceiptPDF(savedOrder)

    res.status(201).json({
      order: savedOrder,
      receiptUrl: `/api/orders/receipt/${savedOrder._id}`,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    res.status(500).json({ message: 'Failed to create order' })
  }
})

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product')

    res.status(200).json(orders)
  } catch (error) {
    console.error('Fetch user orders error:', error)
    res.status(500).json({ message: 'Failed to fetch user orders' })
  }
})

router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product')

    res.status(200).json(orders)
  } catch (error) {
    console.error('Fetch all orders error:', error)
    res.status(500).json({ message: 'Failed to fetch all orders' })
  }
})

router.put('/:orderId/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findById(req.params.orderId)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.status = status
    const updatedOrder = await order.save()

    res.status(200).json(updatedOrder)
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ message: 'Failed to update order status' })
  }
})

module.exports = router
