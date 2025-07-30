require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')

// Import routes
const authRoutes = require('./routes/auth.cjs')
const productRoutes = require('./routes/products.cjs')
const cartRoutes = require('./routes/cart.cjs')
const orderRoutes = require('./routes/orders.cjs')
const paymentRoutes = require('./routes/payments.cjs')

// Initialize Express app
const app = express()
const server = http.createServer(app)

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://quickcart-grocery-tdkg.vercel.app',
  credentials: true,
}))
app.use(express.json())

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickcart'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    
    // Create demo data if database is empty
    createDemoData()
  })
  .catch(err => console.error('MongoDB connection error:', err))

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`)
    console.log(`User ${userId} joined their room`)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Make io available to routes
app.use((req, res, next) => {
  req.io = io
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'QuickCart API is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Create demo data function
async function createDemoData() {
  try {
    const User = require('./models/User.cjs')
    const Product = require('./models/Product.cjs')
    
    // Check if demo users exist
    const adminExists = await User.findOne({ email: 'admin@quickcart.com' })
    const customerExists = await User.findOne({ email: 'customer@quickcart.com' })
    
    if (!adminExists) {
      const bcrypt = require('bcryptjs')
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@quickcart.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      })
      await adminUser.save()
      console.log('Demo admin user created')
    }
    
    if (!customerExists) {
      const bcrypt = require('bcryptjs')
      const customerUser = new User({
        name: 'John Customer',
        email: 'customer@quickcart.com',
        password: await bcrypt.hash('customer123', 10),
        role: 'customer'
      })
      await customerUser.save()
      console.log('Demo customer user created')
    }
    
    // Check if products exist
    const productCount = await Product.countDocuments()
    
    if (productCount === 0) {
      const demoProducts = [
        {
          name: 'Fresh Bananas',
          description: 'Ripe, sweet bananas perfect for breakfast or snacking',
          price: 2.99,
          category: 'fruits',
          stock: 50,
          image: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          name: 'Organic Apples',
          description: 'Crisp, organic red apples grown locally',
          price: 4.49,
          category: 'fruits',
          stock: 30,
          image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          name: 'Fresh Spinach',
          description: 'Baby spinach leaves, perfect for salads and cooking',
          price: 3.99,
          category: 'vegetables',
          stock: 25,
          image: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          name: 'Organic Carrots',
          description: 'Sweet, crunchy organic carrots',
          price: 2.79,
          category: 'vegetables',
          stock: 40,
          image: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          name: 'Whole Milk',
          description: 'Fresh whole milk, 1 gallon',
          price: 3.49,
          category: 'dairy',
          stock: 20,
          image: 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          name: 'Greek Yogurt',
          description: 'Creamy Greek yogurt, vanilla flavor',
          price: 5.99,
          category: 'dairy',
          stock: 15,
          image: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          name: 'Fresh Bread',
          description: 'Artisan sourdough bread, baked daily',
          price: 4.99,
          category: 'bakery',
          stock: 12,
          image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          name: 'Orange Juice',
          description: 'Freshly squeezed orange juice, no pulp',
          price: 4.79,
          category: 'beverages',
          stock: 18,
          image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          name: 'Chicken Breast',
          description: 'Fresh, boneless chicken breast',
          price: 8.99,
          category: 'meat',
          stock: 22,
          image: 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          name: 'Pasta',
          description: 'Italian spaghetti pasta, 1 lb package',
          price: 1.99,
          category: 'pantry',
          stock: 35,
          image: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=400'
        }
      ]
      
      await Product.insertMany(demoProducts)
      console.log('Demo products created')
    }
  } catch (error) {
    console.error('Error creating demo data:', error)
  }
}

module.exports = { app, io }