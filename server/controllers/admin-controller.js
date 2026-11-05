const Book = require('../models/book');
const Order = require('../models/order');
const User = require('../models/user');

// GET /api/admin/stats
const getAdminStats = async (req, res) => {
    try {
        const [
            totalBooks,
            totalUsers,
            totalOrders,
            orders,
            lowStockBooks,
            recentOrders
        ] = await Promise.all([
            Book.countDocuments(),
            User.countDocuments({ role: 'customer' }),
            Order.countDocuments(),
            Order.find(),
            Book.find({ stock: { $lte: 5 } }).select('title stock price coverImage'),
            Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email')
        ]);

        const totalRevenue = orders
            .filter(o => o.orderStatus !== 'Cancelled')
            .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

        const statusCounts = {
            Pending: 0,
            Processing: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0
        };

        orders.forEach(o => {
            if (statusCounts[o.orderStatus] !== undefined) {
                statusCounts[o.orderStatus]++;
            }
        });

        res.status(200).json({
            success: true,
            stats: {
                totalBooks,
                totalUsers,
                totalOrders,
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                statusCounts,
                lowStockCount: lowStockBooks.length,
                lowStockBooks,
                recentOrders
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve admin stats',
            error: error.message
        });
    }
};

// GET /api/admin/orders
const getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status && status !== 'All') {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .populate('user', 'name email phone');

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

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

        // If transitioning to Cancelled and wasn't already Cancelled, restore stock
        if (status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
            for (const item of order.items) {
                await Book.findByIdAndUpdate(item.book, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        order.orderStatus = status;
        if (status === 'Delivered') {
            order.paymentStatus = 'paid';
        }
        await order.save();

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

module.exports = {
    getAdminStats,
    getAllOrders,
    updateOrderStatus,
    getAllUsers
};

