import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AuthComponent from './pages/AuthComponent'
import AdminDashboard from './pages/AdminDashboard'
import ProductPage from './pages/ProductPage'

const App = () => {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthComponent />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/products" element={<ProductPage />} />
      </Routes>
    </Router>
    </>
  )
}

export default App