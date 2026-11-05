const http = require('http');
const { app, startServer } = require('../server');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper for making HTTP requests
function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, text: data });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('--- STARTING BACKEND TEST SUITE ---');
    let passCount = 0;
    let failCount = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`[PASS] ${message}`);
            passCount++;
        } else {
            console.error(`[FAIL] ${message}`);
            failCount++;
        }
    }

    try {
        // 1. Health check
        const health = await request('GET', '/api/health');
        assert(health.status === 200 && health.data.status === 'UP', 'Health check API works');

        // 2. Legacy book route
        const legacyBooks = await request('GET', '/api/books/get');
        assert(legacyBooks.status === 200 && legacyBooks.data.data.length > 0, 'Legacy GET /api/books/get returns books');

        // 3. Modern books list with pagination
        const books = await request('GET', '/api/books?page=1&limit=5');
        assert(books.status === 200 && books.data.data.length === 5, 'Modern GET /api/books returns paginated items');
        assert(books.data.totalBooks >= 12, 'Catalog contains 12+ seeded books');

        // 4. Search and filter
        const searchRes = await request('GET', '/api/books?search=Gatsby');
        assert(searchRes.status === 200 && searchRes.data.data[0].title.includes('Gatsby'), 'Search by title works');

        const catRes = await request('GET', '/api/books?category=Technology');
        assert(catRes.status === 200 && catRes.data.data.length > 0 && catRes.data.data.every(b => b.category === 'Technology'), 'Filter by category works');

        // 5. Book details
        const testBook = books.data.data.find(b => b.stock >= 5) || books.data.data[1];
        const singleBook = await request('GET', `/api/books/${testBook._id}`);
        assert(singleBook.status === 200 && singleBook.data.data.title === testBook.title, 'GET /api/books/:id returns book details');
        assert(Array.isArray(singleBook.data.relatedBooks), 'Book details includes relatedBooks array');

        // 6. User Login - Admin & Customer
        const adminLogin = await request('POST', '/api/auth/login', {
            email: 'admin@bookstore.com',
            password: 'admin123'
        });
        assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin login successful');
        const adminToken = adminLogin.data.token;

        const customerLogin = await request('POST', '/api/auth/login', {
            email: 'customer@bookstore.com',
            password: 'customer123'
        });
        assert(customerLogin.status === 200 && customerLogin.data.user.role === 'customer', 'Customer login successful');
        const customerToken = customerLogin.data.token;

        // 7. User Registration
        const randomEmail = `tester_${Date.now()}@example.com`;
        const regRes = await request('POST', '/api/auth/register', {
            name: 'Test Runner',
            email: randomEmail,
            password: 'password123'
        });
        assert(regRes.status === 201 && regRes.data.token, 'New user registration works');

        // 8. Wishlist toggle
        const wishRes = await request('POST', `/api/auth/wishlist/toggle/${testBook._id}`, {}, regRes.data.token);
        assert(wishRes.status === 200 && wishRes.data.inWishlist === true, 'Add to wishlist works');

        // 9. Cart operations
        const cartAdd = await request('POST', '/api/cart/add', {
            bookId: testBook._id,
            quantity: 2
        }, customerToken);
        assert(cartAdd.status === 200 && cartAdd.data.cart.items.length > 0, 'Add item to cart works');

        const cartGet = await request('GET', '/api/cart', null, customerToken);
        assert(cartGet.status === 200 && cartGet.data.cart.subtotal > 0, 'GET /api/cart returns calculated subtotal');

        // 10. Checkout & Stock update
        const initialStock = testBook.stock;
        const checkoutRes = await request('POST', '/api/orders/checkout', {
            shippingAddress: {
                fullName: 'Jane Customer',
                phone: '555-123-4567',
                street: '123 Market St',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105'
            },
            paymentMethod: 'credit_card'
        }, customerToken);

        assert(checkoutRes.status === 201 && checkoutRes.data.order.orderId.startsWith('ORD-'), 'Checkout creates order with unique ORD- ID');
        const createdOrder = checkoutRes.data.order;

        // Verify stock was decremented
        const updatedBookRes = await request('GET', `/api/books/${testBook._id}`);
        assert(updatedBookRes.data.data.stock === initialStock - 2, 'Book stock was decremented accurately after checkout');

        // 11. Customer order history
        const myOrders = await request('GET', '/api/orders/my-orders', null, customerToken);
        assert(myOrders.status === 200 && myOrders.data.orders.some(o => o.orderId === createdOrder.orderId), 'Order appears in customer order history');

        // 12. Review submission
        const reviewRes = await request('POST', `/api/books/${testBook._id}/reviews`, {
            rating: 5,
            comment: 'Absolutely spectacular read!'
        }, customerToken);
        assert(reviewRes.status === 201 && reviewRes.data.bookRating > 0, 'Customer can submit book review and rating');

        // 13. Admin Dashboard statistics
        const adminStats = await request('GET', '/api/admin/stats', null, adminToken);
        assert(adminStats.status === 200 && adminStats.data.stats.totalBooks >= 12, 'Admin stats returns totalBooks count');
        assert(adminStats.data.stats.totalOrders >= 1, 'Admin stats returns totalOrders count');
        assert(adminStats.data.stats.totalRevenue > 0, 'Admin stats computes totalRevenue');

        // 14. Admin Order Management
        const adminOrders = await request('GET', '/api/admin/orders', null, adminToken);
        assert(adminOrders.status === 200 && adminOrders.data.orders.length > 0, 'Admin can view all orders');

        const updateStatusRes = await request('PUT', `/api/admin/orders/${createdOrder._id}/status`, {
            status: 'Shipped'
        }, adminToken);
        assert(updateStatusRes.status === 200 && updateStatusRes.data.order.orderStatus === 'Shipped', 'Admin can update order status');

        // 15. Admin Book CRUD
        const newBookRes = await request('POST', '/api/books', {
            title: 'Mastering Full-Stack JavaScript',
            author: 'Jane Developer',
            price: 49.99,
            year: 2026,
            category: 'Technology',
            stock: 15,
            description: 'Comprehensive guide to building modern web applications.'
        }, adminToken);
        assert(newBookRes.status === 201 && newBookRes.data.data.title.includes('Mastering'), 'Admin can add new book');
        const createdBookId = newBookRes.data.data._id;

        const updateBookRes = await request('PUT', `/api/books/${createdBookId}`, {
            price: 44.99
        }, adminToken);
        assert(updateBookRes.status === 200 && updateBookRes.data.data.price === 44.99, 'Admin can update book price');

        const delBookRes = await request('DELETE', `/api/books/${createdBookId}`, null, adminToken);
        assert(delBookRes.status === 200, 'Admin can delete book');

        // 16. Security check - customer cannot access admin routes
        const customerForbidden = await request('GET', '/api/admin/stats', null, customerToken);
        assert(customerForbidden.status === 403, 'Customer is blocked from admin routes (403 Forbidden)');

    } catch (err) {
        console.error('Test execution error:', err);
        failCount++;
    }

    console.log(`\n================================`);
    console.log(`TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log(`================================`);
    process.exit(failCount === 0 ? 0 : 1);
}

// Start server properly awaiting DB initialization
startServer().then(() => {
    runTests();
}).catch(err => {
    console.error('Failed to start server for test:', err);
    process.exit(1);
});
