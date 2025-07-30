const jwt = require('jsonwebtoken')
const User = require('../models/User.cjs')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    
    if (!token) {
      return next(new Error('Authentication error'))
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return next(new Error('Authentication error'))
    }

    socket.user = user
    next()
  } catch (error) {
    next(new Error('Authentication error'))
  }
}

module.exports = socketAuth