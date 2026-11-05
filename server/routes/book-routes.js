const express = require('express');
const {
    getAllBooks,
    getSingleBookById,
    addNewBook,
    updateBook,
    deleteBook,
    getCategories,
    getFeaturedBooks,
    addBookReview,
    getBookReviews
} = require('../controllers/book-controller');
const { verifyToken, isAdmin } = require('../middleware/auth-middleware');

const router = express.Router();

// Specific routes before param routes
router.get('/categories', getCategories);
router.get('/featured', getFeaturedBooks);

// Legacy routes (preserved for existing Postman test backward compatibility)
router.get('/get', getAllBooks);
router.get('/get/:id', getSingleBookById);
router.post('/add', addNewBook);
router.put('/update/:id', updateBook);
router.delete('/delete/:id', deleteBook);

// Modern RESTful routes
router.get('/', getAllBooks);
router.get('/:id', getSingleBookById);
router.get('/:id/reviews', getBookReviews);
router.post('/:id/reviews', verifyToken, addBookReview);

// Protected Admin mutations
router.post('/', verifyToken, isAdmin, addNewBook);
router.put('/:id', verifyToken, isAdmin, updateBook);
router.delete('/:id', verifyToken, isAdmin, deleteBook);

module.exports = router;
