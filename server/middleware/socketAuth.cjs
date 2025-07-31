const jwt = require('jsonwebtoken')
const User = require('../models/User.cjs')

const JWT_SECRET = process.env.JWT_SECRET || '6762cbc42308428f9ef715e9ff91d414dbba98cc7482ac3a4057f5bd2924a877d772196704344c92f1e6d572cafe6889fadd1cf1b9f41d4dddf828be9e0b30d8'

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