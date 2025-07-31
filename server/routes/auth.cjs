const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User.cjs')
const { auth } = require('../middleware/auth.cjs') // ✅ Make sure to import this

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    })

    await newUser.save()

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    const safeUser = newUser.toObject()
    delete safeUser.password

    res.status(201).json({ user: safeUser, token })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error during registration' })
  }
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' })

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    const safeUser = user.toObject()
    delete safeUser.password

    res.json({ user: safeUser, token })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ✅ New route: Get current user info
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    console.error('GET /me error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router