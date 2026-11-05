require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectToDB = require('./database/db');

// Route imports
const bookRoutes = require('./routes/book-routes');
const authRoutes = require('./routes/auth-routes');
const cartRoutes = require('./routes/cart-routes');
const orderRoutes = require('./routes/order-routes');
const adminRoutes = require('./routes/admin-routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Serve Frontend in Production if built
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Catch-all route for SPA and unhandled API 404s (Express 5 compatible)
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: `API route ${req.originalUrl} not found`
        });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
        if (err) {
            res.status(404).send('Not Found');
        }
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

let serverInstance = null;

const startServer = async () => {
    await connectToDB();
    return new Promise((resolve) => {
        serverInstance = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            resolve(serverInstance);
        });
    });
};

// Start automatically if run directly
if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };
