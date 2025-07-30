import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, setSearchTerm, setCategory } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'
import { Search, Filter, ShoppingCart, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const Products = () => {
  const dispatch = useDispatch()
  const { items: products, loading, searchTerm, category } = useSelector(state => state.products)
  const { isAuthenticated } = useSelector(state => state.auth)
  const [localSearchTerm, setLocalSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  useEffect(() => {
    setLocalSearchTerm(searchTerm)
  }, [searchTerm])

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'meat', label: 'Meat & Poultry' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'pantry', label: 'Pantry' }
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(setSearchTerm(localSearchTerm))
  }

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }

    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap()
      toast.success('Product added to cart!')
    } catch (error) {
      toast.error(error || 'Failed to add product to cart')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = category === 'all' || product.category === category
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Fresh Products
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover our wide selection of fresh groceries and essentials
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-10 pr-4"
            />
          </div>
        </form>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={category}
            onChange={(e) => dispatch(setCategory(e.target.value))}
            className="input-field min-w-[150px]"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search terms or category filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product._id} className="card overflow-hidden group">
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img
                  src={product.image || `https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400`}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm">4.8</span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    ₹{product.price}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {product.category}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    {product.stock > 0 ? (
                      <span className="text-green-600 dark:text-green-400">
                        {product.stock} in stock
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">
                        Out of stock
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.stock === 0 || !isAuthenticated}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Products