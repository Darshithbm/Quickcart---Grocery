const jwt = require('jsonwebtoken')
const User = require('../models/User.cjs')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' })
    }

    req.user = {
      _id: user._id.toString(),
      role: user.role
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ message: 'Token is not valid' })
  }
}

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' })
      }
      next()
    })
  } catch (error) {
    res.status(401).json({ message: 'Authorization failed' })
  }
}

module.exports = { auth, adminAuth }
