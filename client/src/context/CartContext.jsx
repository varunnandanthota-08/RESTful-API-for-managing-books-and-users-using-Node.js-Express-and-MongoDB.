import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Recalculate local summaries
  const updateSummary = (cartItems) => {
    const total = cartItems.reduce((acc, item) => {
      const price = item.book?.price || item.price || 0;
      return acc + (price * item.quantity);
    }, 0);
    const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    setItems(cartItems);
    setSubtotal(parseFloat(total.toFixed(2)));
    setItemCount(count);
  };

  // Fetch cart from backend when user is logged in
  const fetchCart = async () => {
    if (!isAuthenticated || !token) {
      // Load guest cart from local storage
      const saved = localStorage.getItem('guest_cart');
      if (saved) {
        try {
          updateSummary(JSON.parse(saved));
        } catch (e) {
          updateSummary([]);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.cart.items);
        setSubtotal(data.cart.subtotal);
        setItemCount(data.cart.itemCount);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token, isAuthenticated]);

  const addToCart = async (book, quantity = 1) => {
    if (isAuthenticated && token) {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookId: book._id, quantity })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }
      setItems(data.cart.items);
      setSubtotal(data.cart.subtotal);
      setItemCount(data.cart.itemCount);
      return data;
    } else {
      // Guest local storage cart
      const existingIdx = items.findIndex(i => (i.book?._id || i.book) === book._id);
      let updatedItems = [...items];

      if (existingIdx > -1) {
        const newQty = updatedItems[existingIdx].quantity + quantity;
        if (newQty > book.stock) {
          throw new Error(`Cannot add more. Stock limit reached (${book.stock})`);
        }
        updatedItems[existingIdx].quantity = newQty;
      } else {
        if (quantity > book.stock) {
          throw new Error(`Requested quantity exceeds stock (${book.stock})`);
        }
        updatedItems.push({
          book: book,
          quantity,
          price: book.price
        });
      }

      localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
      updateSummary(updatedItems);
      return { success: true };
    }
  };

  const updateQuantity = async (bookId, quantity) => {
    if (isAuthenticated && token) {
      const res = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookId, quantity })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update item quantity');
      }
      setItems(data.cart.items);
      setSubtotal(data.cart.subtotal);
      setItemCount(data.cart.itemCount);
      return data;
    } else {
      let updated = [...items];
      const idx = updated.findIndex(i => (i.book?._id || i.book) === bookId);
      if (idx > -1) {
        if (quantity <= 0) {
          updated.splice(idx, 1);
        } else {
          updated[idx].quantity = quantity;
        }
      }
      localStorage.setItem('guest_cart', JSON.stringify(updated));
      updateSummary(updated);
    }
  };

  const removeFromCart = async (bookId) => {
    if (isAuthenticated && token) {
      const res = await fetch(`/api/cart/remove/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to remove item');
      }
      setItems(data.cart.items);
      setSubtotal(data.cart.subtotal);
      setItemCount(data.cart.itemCount);
      return data;
    } else {
      const updated = items.filter(i => (i.book?._id || i.book) !== bookId);
      localStorage.setItem('guest_cart', JSON.stringify(updated));
      updateSummary(updated);
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && token) {
      await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    localStorage.removeItem('guest_cart');
    setItems([]);
    setSubtotal(0);
    setItemCount(0);
  };

  return (
    <CartContext.Provider value={{
      items,
      subtotal,
      itemCount,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

