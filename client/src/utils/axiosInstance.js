import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://quickcart-grocery-w7p6.onrender.com/api',
  withCredentials: true,
})

// Add JWT token from localStorage if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosInstance
