import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://quickcart-grocery-w7p6.onrender.com',
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosInstance