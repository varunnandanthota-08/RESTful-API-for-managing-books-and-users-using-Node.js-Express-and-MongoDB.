const Order = require('../models/order');
const Cart = require('../models/cart');
const Book = require('../models/book');

// Generate unique readable order ID (e.g. ORD-782194)
const generateOrderId = () => {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `ORD-${random}`;
};

// POST /api/orders/checkout
const checkout = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod = 'credit_card', items: directItems } = req.body;

        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
            return res.status(400).json({
                success: false,
                message: 'Complete shipping address is required.'
            });
        }

        let orderItems = [];

        if (directItems && Array.isArray(directItems) && directItems.length > 0) {
            // Direct "Buy Now" flow
            for (const item of directItems) {
                const book = await Book.findById(item.bookId || item.book);
                if (!book) {
                    return res.status(404).json({
                        success: false,
                        message: `Book not found`
                    });
                }
                if (book.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Not enough stock for "${book.title}". Available: ${book.stock}`
                    });
                }
                orderItems.push({
                    book: book._id,
                    title: book.title,
                    author: book.author,
                    coverImage: book.coverImage,
                    price: book.price,
                    quantity: item.quantity
                });
            }
        } else {
            // Standard Cart checkout flow
            const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Your cart is empty.'
                });
            }

            for (const item of cart.items) {
                if (!item.book) continue;
                if (item.book.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Not enough stock for "${item.book.title}". Available: ${item.book.stock}`
                    });
                }
                orderItems.push({
                    book: item.book._id,
                    title: item.book.title,
                    author: item.book.author,
                    coverImage: item.book.coverImage,
                    price: item.price,
                    quantity: item.quantity
                });
            }
        }

        if (orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid items to place order.'
            });
        }

        // Calculate pricing
        const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const tax = parseFloat((subtotal * 0.08).toFixed(2));
        const shippingFee = subtotal > 50 ? 0 : 4.99;
        const totalAmount = parseFloat((subtotal + tax + shippingFee).toFixed(2));

        // Decrement stock for all ordered books
        for (const item of orderItems) {
            await Book.findByIdAndUpdate(item.book, {
                $inc: { stock: -item.quantity }
            });
        }

        // Create Order
        const newOrder = await Order.create({
            orderId: generateOrderId(),
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
            orderStatus: 'Processing',
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax,
            shippingFee,
            totalAmount
        });

        // Clear user's cart
        await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            order: newOrder
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete checkout',
            error: error.message
        });
    }
};

// GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your orders'
        });
    }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
    try {
        const orderIdParam = req.params.id;
        const query = orderIdParam.startsWith('ORD-')
            ? { orderId: orderIdParam }
            : { _id: orderIdParam };

        const order = await Order.findOne(query).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check permission (owner or admin)
        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this order'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve order'
        });
    }
};

// PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
    try {
        const orderIdParam = req.params.id;
        const query = orderIdParam.startsWith('ORD-')
            ? { orderId: orderIdParam }
            : { _id: orderIdParam };

        const order = await Order.findOne(query);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check ownership or admin
        if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You cannot cancel this order'
            });
        }

        if (order.orderStatus === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'Delivered orders cannot be cancelled.'
            });
        }

        if (order.orderStatus === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Order is already cancelled.'
            });
        }

        // Restore stock
        for (const item of order.items) {
            await Book.findByIdAndUpdate(item.book, {
                $inc: { stock: item.quantity }
            });
        }

        order.orderStatus = 'Cancelled';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully and stock restored.',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order'
        });
    }
};

module.exports = {
    checkout,
    getMyOrders,
    getOrderById,
    cancelOrder
};

