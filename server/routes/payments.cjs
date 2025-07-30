const express = require('express');
const Razorpay = require('razorpay');
const { auth } = require('../middleware/auth.cjs');

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET 
});

router.post('/razorpay-order', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Invalid or missing amount' });
    }

    const options = {
      amount: Math.round(amount), 
      currency: 'INR',
      receipt: `rcptid_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    return res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
});

module.exports = router;
