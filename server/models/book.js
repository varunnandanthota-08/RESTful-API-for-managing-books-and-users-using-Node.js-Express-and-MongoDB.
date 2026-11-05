const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true,
        maxLength: [150, 'Book title cannot exceed 150 characters']
    },
    author: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: 'No description provided.'
    },
    price: {
        type: Number,
        required: [true, 'Book price is required'],
        min: [0, 'Price must be non-negative']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        default: 'Fiction'
    },
    isbn: {
        type: String,
        trim: true,
        default: ''
    },
    stock: {
        type: Number,
        required: [true, 'Stock count is required'],
        min: [0, 'Stock cannot be negative'],
        default: 10
    },
    coverImage: {
        type: String,
        trim: true,
        default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'
    },
    year: {
        type: Number,
        required: [true, 'Publication year is required'],
        min: [1000, 'Year must be at least 1000'],
        max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },
    rating: {
        type: Number,
        default: 4.5,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5']
    },
    reviewsCount: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', BookSchema);
