import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Notification from './components/Notification';
import { ProtectedRoute } from './components/ProtectedRoute';

// Customer Pages
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailsPage from './pages/BookDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import MyOrdersPage from './pages/MyOrdersPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBooksPage from './pages/admin/AdminBooksPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';

function App() {
  const [toasts, setToasts] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app-container">
            <Navbar onNotify={addNotification} />

            <main className="main-content">
              <Routes>
                {/* Public Storefront Routes */}
                <Route path="/" element={<HomePage onNotify={addNotification} />} />
                <Route path="/books" element={<BooksPage onNotify={addNotification} />} />
                <Route path="/books/:id" element={<BookDetailsPage onNotify={addNotification} />} />
                <Route path="/cart" element={<CartPage onNotify={addNotification} />} />
                <Route path="/login" element={<LoginPage onNotify={addNotification} />} />
                <Route path="/register" element={<RegisterPage onNotify={addNotification} />} />

                {/* Customer Authenticated Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage onNotify={addNotification} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/success/:id"
                  element={
                    <ProtectedRoute>
                      <OrderSuccessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <MyOrdersPage onNotify={addNotification} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <WishlistPage onNotify={addNotification} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage onNotify={addNotification} />
                    </ProtectedRoute>
                  }
                />

                {/* Administrator Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboardPage onNotify={addNotification} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/books"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminBooksPage onNotify={addNotification} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminOrdersPage onNotify={addNotification} />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />

            {/* Toast Notifications Overlay */}
            <div className="toast-container">
              {toasts.map((toast) => (
                <Notification
                  key={toast.id}
                  message={toast.message}
                  type={toast.type}
                  onClose={() => removeNotification(toast.id)}
                />
              ))}
            </div>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

