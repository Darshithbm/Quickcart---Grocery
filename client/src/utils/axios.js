import axios from 'axios'

const instance = axios.create({
  baseURL: '/', // Can be set to 'http://localhost:5000/api' if needed
})

// Add JWT token to every request if available
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')  // Or sessionStorage.getItem if used
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export default instance

