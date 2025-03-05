import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AuthComponent from './pages/AuthComponent'
import AdminDashboard from './pages/AdminDashboard'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'

const App = () => {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthComponent />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
      </Routes>
    </Router>
    </>
  )
}

export default App