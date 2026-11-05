const express = require('express');
const {
    getAdminStats,
    getAllOrders,
    updateOrderStatus,
    getAllUsers
} = require('../controllers/admin-controller');
const { verifyToken, isAdmin } = require('../middleware/auth-middleware');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken, isAdmin);

router.get('/stats', getAdminStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);

module.exports = router;

