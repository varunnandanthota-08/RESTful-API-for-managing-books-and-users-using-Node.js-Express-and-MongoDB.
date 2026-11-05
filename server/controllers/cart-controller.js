const Cart = require('../models/cart');
const Book = require('../models/book');

// Helper to populate and calculate cart summary
const getPopulatedCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId }).populate('items.book');
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
};

// GET /api/cart
const getCart = async (req, res) => {
    try {
        const cart = await getPopulatedCart(req.user._id);

        // Filter out any items whose book was deleted from catalog
        const validItems = cart.items.filter(item => item.book != null);
        if (validItems.length !== cart.items.length) {
            cart.items = validItems;
            await cart.save();
        }

        const subtotal = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        res.status(200).json({
            success: true,
            cart: {
                _id: cart._id,
                items: cart.items,
                subtotal: parseFloat(subtotal.toFixed(2)),
                itemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0)
            }
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve cart',
            error: error.message
        });
    }
};

// POST /api/cart/add
const addToCart = async (req, res) => {
    try {
        const { bookId, quantity = 1 } = req.body;

        if (!bookId) {
            return res.status(400).json({
                success: false,
                message: 'Book ID is required'
            });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        if (book.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: 'This book is currently out of stock.'
            });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(
            item => item.book.toString() === bookId
        );

        const qtyToAdd = Math.max(1, parseInt(quantity, 10));

        if (existingItemIndex > -1) {
            const newTotalQty = cart.items[existingItemIndex].quantity + qtyToAdd;
            if (newTotalQty > book.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more. Available stock is ${book.stock}.`
                });
            }
            cart.items[existingItemIndex].quantity = newTotalQty;
            cart.items[existingItemIndex].price = book.price;
        } else {
            if (qtyToAdd > book.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Requested quantity (${qtyToAdd}) exceeds available stock (${book.stock}).`
                });
            }
            cart.items.push({
                book: book._id,
                quantity: qtyToAdd,
                price: book.price
            });
        }

        cart.updatedAt = Date.now();
        await cart.save();

        const populatedCart = await getPopulatedCart(req.user._id);
        const subtotal = populatedCart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        res.status(200).json({
            success: true,
            message: 'Book added to cart',
            cart: {
                _id: populatedCart._id,
                items: populatedCart.items,
                subtotal: parseFloat(subtotal.toFixed(2)),
                itemCount: populatedCart.items.reduce((acc, item) => acc + item.quantity, 0)
            }
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
};

// PUT /api/cart/update
const updateCartItem = async (req, res) => {
    try {
        const { bookId, quantity } = req.body;

        if (!bookId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Book ID and quantity are required'
            });
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not in cart'
            });
        }

        const newQty = parseInt(quantity, 10);

        if (newQty <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            const book = await Book.findById(bookId);
            if (!book) {
                cart.items.splice(itemIndex, 1);
            } else if (newQty > book.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Requested quantity exceeds available stock (${book.stock})`
                });
            } else {
                cart.items[itemIndex].quantity = newQty;
            }
        }

        cart.updatedAt = Date.now();
        await cart.save();

        const populatedCart = await getPopulatedCart(req.user._id);
        const subtotal = populatedCart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        res.status(200).json({
            success: true,
            message: 'Cart updated',
            cart: {
                _id: populatedCart._id,
                items: populatedCart.items,
                subtotal: parseFloat(subtotal.toFixed(2)),
                itemCount: populatedCart.items.reduce((acc, item) => acc + item.quantity, 0)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update cart',
            error: error.message
        });
    }
};

// DELETE /api/cart/remove/:bookId
const removeFromCart = async (req, res) => {
    try {
        const { bookId } = req.params;
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(item => item.book.toString() !== bookId);
        cart.updatedAt = Date.now();
        await cart.save();

        const populatedCart = await getPopulatedCart(req.user._id);
        const subtotal = populatedCart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            cart: {
                _id: populatedCart._id,
                items: populatedCart.items,
                subtotal: parseFloat(subtotal.toFixed(2)),
                itemCount: populatedCart.items.reduce((acc, item) => acc + item.quantity, 0)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart'
        });
    }
};

// DELETE /api/cart/clear
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            cart.updatedAt = Date.now();
            await cart.save();
        }
        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            cart: { items: [], subtotal: 0, itemCount: 0 }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart'
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};

