const express = require('express');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cart-controller');
const { verifyToken } = require('../middleware/auth-middleware');

const router = express.Router();

// All cart routes require user authentication
router.use(verifyToken);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:bookId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;

