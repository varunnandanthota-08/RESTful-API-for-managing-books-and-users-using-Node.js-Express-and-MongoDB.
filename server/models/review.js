const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Minimum rating is 1'],
        max: [5, 'Maximum rating is 5']
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true,
        maxLength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Avoid duplicate reviews from the same user for the same book
ReviewSchema.index({ book: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);

