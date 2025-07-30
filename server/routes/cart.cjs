const express = require('express');
const Cart = require('../models/Cart.cjs');
const Product = require('../models/Product.cjs');
const { auth } = require('../middleware/auth.cjs');

const router = express.Router();

// Get cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.json(cart || { items: [], totalAmount: 0, totalItems: 0 });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: 'Failed to get cart' });
  }
});

// Add item to cart
router.post('/', auth, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json(updatedCart);
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

// Update item quantity
router.put('/:productId', auth, async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    item.quantity = quantity;
    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(updatedCart);
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/:productId', auth, async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { items: { product: productId } } },
      { new: true }
    ).populate('items.product');

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
});

// Clear entire cart
router.delete('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

module.exports = router;
