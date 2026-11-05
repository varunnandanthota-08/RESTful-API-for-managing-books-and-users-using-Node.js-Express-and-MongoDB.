const express = require('express');
const {
    checkout,
    getMyOrders,
    getOrderById,
    cancelOrder
} = require('../controllers/order-controller');
const { verifyToken } = require('../middleware/auth-middleware');

const router = express.Router();

// All order routes require authentication
router.use(verifyToken);

router.post('/checkout', checkout);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;

