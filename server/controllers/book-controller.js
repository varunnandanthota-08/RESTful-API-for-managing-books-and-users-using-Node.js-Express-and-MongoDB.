const Book = require('../models/book');
const Review = require('../models/review');
const mongoose = require('mongoose');

// GET /api/books (with search, category, price filter, sorting, pagination)
const getAllBooks = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 12,
            featured
        } = req.query;

        const query = {};

        // Search in title or author
        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$or = [
                { title: searchRegex },
                { author: searchRegex },
                { description: searchRegex }
            ];
        }

        // Category filter (supports single category or comma-separated multiple categories)
        if (category && category !== 'All' && category !== '') {
            const catList = Array.isArray(category)
                ? category
                : category.split(',').map(c => c.trim()).filter(Boolean);
            if (catList.length === 1) {
                query.category = catList[0];
            } else if (catList.length > 1) {
                query.category = { $in: catList };
            }
        }

        // Featured filter
        if (featured === 'true') {
            query.isFeatured = true;
        }

        // Price range filter
        if ((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) {
            query.price = {};
            if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
            if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
        }

        // Sorting options
        const sortOptions = {};
        const order = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'price') sortOptions.price = order;
        else if (sortBy === 'rating') sortOptions.rating = order;
        else if (sortBy === 'year') sortOptions.year = order;
        else if (sortBy === 'title') sortOptions.title = order;
        else sortOptions.createdAt = order;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 12);
        const skip = (pageNum - 1) * limitNum;

        const [books, totalBooks] = await Promise.all([
            Book.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum),
            Book.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            message: 'Fetched books successfully',
            count: books.length,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limitNum) || 1,
            currentPage: pageNum,
            data: books
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve books',
            error: err.message
        });
    }
};

// GET /api/books/categories
const getCategories = async (req, res) => {
    try {
        const categories = await Book.distinct('category');
        res.status(200).json({
            success: true,
            categories: categories.filter(Boolean)
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve categories'
        });
    }
};

// GET /api/books/featured
const getFeaturedBooks = async (req, res) => {
    try {
        const featuredBooks = await Book.find({ isFeatured: true }).limit(8);
        res.status(200).json({
            success: true,
            data: featuredBooks
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve featured books'
        });
    }
};

// GET /api/books/:id
const getSingleBookById = async (req, res) => {
    try {
        const getBookId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(getBookId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Book ID format'
            });
        }

        const bookDetails = await Book.findById(getBookId);
        if (!bookDetails) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Fetch up to 4 related books in the same category
        const relatedBooks = await Book.find({
            category: bookDetails.category,
            _id: { $ne: bookDetails._id }
        }).limit(4);

        // Fetch recent reviews
        const reviews = await Review.find({ book: bookDetails._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            message: 'Book found',
            data: bookDetails,
            relatedBooks,
            reviews
        });
    } catch (err) {
        console.error('Error fetching single book:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching book'
        });
    }
};

// POST /api/books (admin)
const addNewBook = async (req, res) => {
    try {
        const { title, author, price, year, category, stock, isbn, description, coverImage, isFeatured } = req.body;

        if (!title || !author || price === undefined || !year) {
            return res.status(400).json({
                success: false,
                message: 'Title, author, price, and year are required.'
            });
        }

        const newlyCreatedBook = await Book.create({
            title,
            author,
            price: Number(price),
            year: Number(year),
            category: category || 'General',
            stock: stock !== undefined ? Number(stock) : 10,
            isbn: isbn || '',
            description: description || '',
            coverImage: coverImage || undefined,
            isFeatured: Boolean(isFeatured)
        });

        res.status(201).json({
            success: true,
            message: 'Book added successfully',
            data: newlyCreatedBook
        });
    } catch (err) {
        console.error('Error adding book:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to add book',
            error: err.message
        });
    }
};

// PUT /api/books/:id (admin)
const updateBook = async (req, res) => {
    try {
        const updateBookId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(updateBookId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Book ID format'
            });
        }

        const updated = await Book.findByIdAndUpdate(
            updateBookId,
            req.body,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Book updated successfully',
            data: updated
        });
    } catch (err) {
        console.error('Error updating book:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update book',
            error: err.message
        });
    }
};

// DELETE /api/books/:id (admin)
const deleteBook = async (req, res) => {
    try {
        const getCurrBookId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(getCurrBookId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Book ID format'
            });
        }

        const delBook = await Book.findByIdAndDelete(getCurrBookId);
        if (!delBook) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Book deleted successfully',
            data: delBook
        });
    } catch (err) {
        console.error('Error deleting book:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to delete book'
        });
    }
};

// POST /api/books/:id/reviews (authenticated)
const addBookReview = async (req, res) => {
    try {
        const bookId = req.params.id;
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating and comment are required.'
            });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found.'
            });
        }

        // Upsert review from this user for this book
        let review = await Review.findOne({ book: bookId, user: req.user._id });
        if (review) {
            review.rating = Number(rating);
            review.comment = comment;
            await review.save();
        } else {
            review = await Review.create({
                book: bookId,
                user: req.user._id,
                userName: req.user.name,
                rating: Number(rating),
                comment
            });
        }

        // Recalculate book average rating
        const allReviews = await Review.find({ book: bookId });
        const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

        book.rating = parseFloat(avgRating.toFixed(1));
        book.reviewsCount = allReviews.length;
        await book.save();

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: review,
            bookRating: book.rating,
            reviewsCount: book.reviewsCount
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add review',
            error: error.message
        });
    }
};

// GET /api/books/:id/reviews
const getBookReviews = async (req, res) => {
    try {
        const bookId = req.params.id;
        const reviews = await Review.find({ book: bookId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
};

module.exports = {
    getAllBooks,
    getSingleBookById,
    addNewBook,
    updateBook,
    deleteBook,
    getCategories,
    getFeaturedBooks,
    addBookReview,
    getBookReviews
};
