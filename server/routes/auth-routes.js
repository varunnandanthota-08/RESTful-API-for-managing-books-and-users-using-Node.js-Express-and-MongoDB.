const express = require('express');
const {
    register,
    login,
    getProfile,
    updateProfile,
    getWishlist,
    toggleWishlist
} = require('../controllers/auth-controller');
const { verifyToken } = require('../middleware/auth-middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/wishlist', verifyToken, getWishlist);
router.post('/wishlist/toggle/:bookId', verifyToken, toggleWishlist);

module.exports = router;

