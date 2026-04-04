import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Global Axios interceptor: auto-logout on any 401 Unauthorized response
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginPath = error.config?.url?.includes('/api/auth/login');
    if (error.response?.status === 401 && !isLoginPath) {
      localStorage.removeItem('userInfo');
      // Only redirect if we are not already on the login page
      // (This prevents infinite loops and loss of error messages)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
