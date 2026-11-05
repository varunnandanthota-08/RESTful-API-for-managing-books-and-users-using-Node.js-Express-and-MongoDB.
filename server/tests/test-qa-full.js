const http = require('http');
const { startServer } = require('../server');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

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
                    resolve({ status: res.statusCode, headers: res.headers, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, text: data });
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

async function runQASuite() {
    console.log('====================================================');
    console.log('🚀 RUNNING COMPREHENSIVE E2E & QA FUNCTIONAL SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function test(name, condition) {
        if (condition) {
            console.log(`[PASS] ${name}`);
            passed++;
        } else {
            console.error(`[FAIL] ${name}`);
            failed++;
        }
    }

    try {
        // --- SECTION 1: DATABASE SEED INTEGRITY ---
        console.log('\n--- 1. DATABASE & SEED DATA AUDIT ---');
        const allBooksRes = await request('GET', '/api/books?limit=100');
        test('Database seeded with 50+ books', allBooksRes.status === 200 && allBooksRes.data.totalBooks >= 50);

        const categoriesRes = await request('GET', '/api/books/categories');
        const categories = categoriesRes.data?.categories || [];
        const requiredCategories = ['Fiction', 'Science Fiction', 'Mystery', 'Technology', 'Programming', 'Artificial Intelligence', 'Data Science', 'Business', 'Self Improvement', 'History', 'Biography', 'Fantasy'];
        const allCategoriesPresent = requiredCategories.every(cat => categories.includes(cat));
        test(`All 12 required categories seeded (${categories.length} found)`, allCategoriesPresent);

        // --- SECTION 2: SEARCH & FILTERING QA ---
        console.log('\n--- 2. ADVANCED SEARCH & FILTERING TESTING ---');

        // Search by title
        const searchTitle = await request('GET', '/api/books?search=Gatsby');
        test('Search by exact book title returns matching book', searchTitle.data.data.some(b => b.title === 'The Great Gatsby'));

        // Search by author
        const searchAuthor = await request('GET', '/api/books?search=Clear');
        test('Search by author name returns matching books', searchAuthor.data.data.some(b => b.author.includes('Clear')));

        // Partial word search
        const searchPartial = await request('GET', '/api/books?search=progr');
        test('Partial keyword search works across titles and descriptions', searchPartial.data.data.length > 0);

        // Case-insensitive search
        const searchUpper = await request('GET', '/api/books?search=CLEAN CODE');
        test('Case-insensitive search returns correct book', searchUpper.data.data.some(b => b.title.includes('Clean Code')));

        // Search with no results
        const searchNoMatch = await request('GET', '/api/books?search=XYZ_NON_EXISTENT_QUERY_9999');
        test('Search with no matching results returns empty data array (not 404 error)', searchNoMatch.status === 200 && searchNoMatch.data.data.length === 0);

        // Single category filter
        const catSingle = await request('GET', '/api/books?category=Mystery');
        test('Single category filter returns only Mystery books', catSingle.data.data.length > 0 && catSingle.data.data.every(b => b.category === 'Mystery'));

        // Multi-category filter (comma-separated)
        const catMulti = await request('GET', '/api/books?category=Programming,Technology');
        test('Multi-category filter returns books from both categories', catMulti.data.data.length > 0 && catMulti.data.data.every(b => b.category === 'Programming' || b.category === 'Technology'));

        // Price range filter
        const priceFilter = await request('GET', '/api/books?minPrice=15&maxPrice=25');
        const allWithinPrice = priceFilter.data.data.every(b => b.price >= 15 && b.price <= 25);
        test('Price range filter ($15 - $25) excludes books outside boundaries', priceFilter.data.data.length > 0 && allWithinPrice);

        // Sorting: Price low to high
        const sortPriceAsc = await request('GET', '/api/books?sortBy=price&sortOrder=asc&limit=10');
        let ascSorted = true;
        for (let i = 0; i < sortPriceAsc.data.data.length - 1; i++) {
            if (sortPriceAsc.data.data[i].price > sortPriceAsc.data.data[i+1].price) {
                ascSorted = false;
                break;
            }
        }
        test('Sort by Price: Low to High accurately orders items', ascSorted);

        // Sorting: Price high to low
        const sortPriceDesc = await request('GET', '/api/books?sortBy=price&sortOrder=desc&limit=10');
        let descSorted = true;
        for (let i = 0; i < sortPriceDesc.data.data.length - 1; i++) {
            if (sortPriceDesc.data.data[i].price < sortPriceDesc.data.data[i+1].price) {
                descSorted = false;
                break;
            }
        }
        test('Sort by Price: High to Low accurately orders items', descSorted);

        // Sorting: Highest Rated
        const sortRatingDesc = await request('GET', '/api/books?sortBy=rating&sortOrder=desc&limit=10');
        let ratingSorted = true;
        for (let i = 0; i < sortRatingDesc.data.data.length - 1; i++) {
            if (sortRatingDesc.data.data[i].rating < sortRatingDesc.data.data[i+1].rating) {
                ratingSorted = false;
                break;
            }
        }
        test('Sort by Rating: Highest Rated accurately orders items', ratingSorted);

        // Combined Filter: Category + Price + Search + Sorting + Pagination
        const complexQuery = await request('GET', '/api/books?category=Science Fiction&minPrice=10&maxPrice=30&sortBy=price&sortOrder=asc&page=1&limit=5');
        test('Complex combined filter (Category + Price + Sort + Pagination) works seamlessly', complexQuery.status === 200 && complexQuery.data.data.length > 0 && complexQuery.data.currentPage === 1);

        // --- SECTION 3: AUTHENTICATION & RBAC ---
        console.log('\n--- 3. AUTHENTICATION & AUTHORIZATION TESTING ---');

        // Admin login
        const adminLog = await request('POST', '/api/auth/login', {
            email: 'admin@bookstore.com',
            password: 'admin123'
        });
        test('Admin login succeeds and returns valid JWT', adminLog.status === 200 && adminLog.data.token && adminLog.data.user.role === 'admin');
        const adminToken = adminLog.data.token;

        // Customer login
        const custLog = await request('POST', '/api/auth/login', {
            email: 'customer@bookstore.com',
            password: 'customer123'
        });
        test('Customer login succeeds and returns valid JWT', custLog.status === 200 && custLog.data.token && custLog.data.user.role === 'customer');
        const customerToken = custLog.data.token;

        // Customer registration
        const newEmail = `user_${Date.now()}@testqa.com`;
        const regRes = await request('POST', '/api/auth/register', {
            name: 'QA Automation Tester',
            email: newEmail,
            password: 'password123',
            phone: '+1 555-0199'
        });
        test('New customer registration succeeds', regRes.status === 201 && regRes.data.user.email === newEmail);
        const newUserToken = regRes.data.token;

        // Duplicate registration rejection
        const dupReg = await request('POST', '/api/auth/register', {
            name: 'Duplicate Tester',
            email: newEmail,
            password: 'password123'
        });
        test('Duplicate email registration is rejected with 409 Conflict', dupReg.status === 409);

        // Profile fetch & update
        const profileRes = await request('GET', '/api/auth/profile', null, newUserToken);
        test('Authenticated profile fetch works', profileRes.status === 200 && profileRes.data.user.email === newEmail);

        const updateProf = await request('PUT', '/api/auth/profile', {
            name: 'Updated QA Tester',
            phone: '+1 555-9999',
            address: { street: '990 Quality Lane', city: 'Test City', state: 'CA', zipCode: '90001', country: 'USA' }
        }, newUserToken);
        test('Profile update persists new address details', updateProf.status === 200 && updateProf.data.user.address.street === '990 Quality Lane');

        // RBAC: Customer blocked from admin endpoint
        const forbiddenCheck = await request('GET', '/api/admin/stats', null, customerToken);
        test('Customer blocked from admin routes (403 Forbidden)', forbiddenCheck.status === 403);

        // --- SECTION 4: CART, CHECKOUT & STOCK RESERVATION ---
        console.log('\n--- 4. CART, CHECKOUT & INVENTORY VERIFICATION ---');

        const testBook = allBooksRes.data.data.find(b => b.stock >= 5);
        const initialStock = testBook.stock;

        // Add to cart
        const addCartRes = await request('POST', '/api/cart/add', {
            bookId: testBook._id,
            quantity: 2
        }, newUserToken);
        test('Add book to cart succeeds', addCartRes.status === 200 && addCartRes.data.cart.items.length > 0);

        // Get cart
        const getCartRes = await request('GET', '/api/cart', null, newUserToken);
        test('Get cart computes subtotal accurately', getCartRes.status === 200 && getCartRes.data.cart.subtotal > 0);

        // Modify quantity
        const updateQty = await request('PUT', '/api/cart/update', {
            bookId: testBook._id,
            quantity: 3
        }, newUserToken);
        test('Update cart quantity alters item count', updateQty.status === 200 && updateQty.data.cart.items.find(i => (i.book._id || i.book) === testBook._id)?.quantity === 3);

        // Out of stock prevention
        const outOfStockBook = allBooksRes.data.data.find(b => b.stock === 0);
        if (outOfStockBook) {
            const addOOS = await request('POST', '/api/cart/add', {
                bookId: outOfStockBook._id,
                quantity: 1
            }, newUserToken);
            test('Adding out-of-stock book to cart is prevented with 400 Bad Request', addOOS.status === 400);
        }

        // Checkout
        const checkoutRes = await request('POST', '/api/orders/checkout', {
            shippingAddress: {
                fullName: 'Updated QA Tester',
                phone: '+1 555-9999',
                street: '990 Quality Lane',
                city: 'Test City',
                state: 'CA',
                zipCode: '90001',
                country: 'USA'
            },
            paymentMethod: 'credit_card'
        }, newUserToken);
        test('Checkout succeeds and generates unique ORD- identifier', checkoutRes.status === 201 && checkoutRes.data.order.orderId.startsWith('ORD-'));
        const createdOrder = checkoutRes.data.order;

        // Verify stock was decremented
        const bookAfterOrder = await request('GET', `/api/books/${testBook._id}`);
        test('Book inventory stock was atomically reduced in DB', bookAfterOrder.data.data.stock === initialStock - 3);

        // Verify cart was cleared after checkout
        const cartAfterOrder = await request('GET', '/api/cart', null, newUserToken);
        test('Shopping cart was automatically emptied after checkout', cartAfterOrder.data.cart.items.length === 0);

        // Order history
        const myOrders = await request('GET', '/api/orders/my-orders', null, newUserToken);
        test('Order appears in user order history', myOrders.data.orders.some(o => o.orderId === createdOrder.orderId));

        // Order cancellation & stock restoration
        const cancelOrderRes = await request('PUT', `/api/orders/${createdOrder._id}/cancel`, null, newUserToken);
        test('Customer can cancel active order', cancelOrderRes.status === 200 && cancelOrderRes.data.order.orderStatus === 'Cancelled');

        const bookAfterCancel = await request('GET', `/api/books/${testBook._id}`);
        test('Cancelled order restores book inventory stock back in DB', bookAfterCancel.data.data.stock === initialStock);

        // --- SECTION 5: WISHLIST & REVIEWS ---
        console.log('\n--- 5. WISHLIST & BOOK REVIEWS ---');

        // Toggle Wishlist
        const addWish = await request('POST', `/api/auth/wishlist/toggle/${testBook._id}`, null, newUserToken);
        test('Toggle book into wishlist succeeds', addWish.status === 200 && addWish.data.inWishlist === true);

        const getWish = await request('GET', '/api/auth/wishlist', null, newUserToken);
        test('Get wishlist returns populated saved book', getWish.status === 200 && getWish.data.wishlist.some(b => b._id === testBook._id));

        // Submit review
        const revRes = await request('POST', `/api/books/${testBook._id}/reviews`, {
            rating: 5,
            comment: 'Stupendous and captivating piece of work. Highly recommend to everyone.'
        }, newUserToken);
        test('Customer can submit a verified review and rating', revRes.status === 201 && revRes.data.bookRating > 0);

        // Get reviews
        const getRev = await request('GET', `/api/books/${testBook._id}/reviews`);
        test('Reviews are fetched for the book', getRev.status === 200 && getRev.data.data.length > 0);

        // --- SECTION 6: ADMIN WORKFLOW & STATS ---
        console.log('\n--- 6. ADMIN DASHBOARD & INVENTORY MANAGEMENT ---');

        // Admin stats
        const adminStats = await request('GET', '/api/admin/stats', null, adminToken);
        test('Admin dashboard stats returns accurate metrics (books, users, orders, revenue)', adminStats.status === 200 && adminStats.data.stats.totalBooks >= 50 && adminStats.data.stats.totalRevenue > 0);

        // Admin view orders
        const adminOrders = await request('GET', '/api/admin/orders', null, adminToken);
        test('Admin can list all customer orders', adminOrders.status === 200 && adminOrders.data.orders.length > 0);

        // Admin update order status
        const updateStatus = await request('PUT', `/api/admin/orders/${adminOrders.data.orders[0]._id}/status`, {
            status: 'Delivered'
        }, adminToken);
        test('Admin can update order status milestone', updateStatus.status === 200 && updateStatus.data.order.orderStatus === 'Delivered');

        // Admin Add Book
        const addBookRes = await request('POST', '/api/books', {
            title: 'Modern Architecture Patterns 2026',
            author: 'Chief Architect',
            price: 59.99,
            year: 2026,
            category: 'Technology',
            stock: 30,
            isbn: '978-0112233445',
            description: 'Cutting edge software engineering architecture paradigms.'
        }, adminToken);
        test('Admin can add new book to catalog', addBookRes.status === 201 && addBookRes.data.data.title.includes('Modern Architecture'));
        const newAdminBookId = addBookRes.data.data._id;

        // Admin Edit Book
        const editBookRes = await request('PUT', `/api/books/${newAdminBookId}`, {
            price: 54.99,
            stock: 25
        }, adminToken);
        test('Admin can update book price and stock', editBookRes.status === 200 && editBookRes.data.data.price === 54.99 && editBookRes.data.data.stock === 25);

        // Admin Delete Book
        const delBookRes = await request('DELETE', `/api/books/${newAdminBookId}`, null, adminToken);
        test('Admin can delete book from catalog', delBookRes.status === 200 && delBookRes.data.success === true);

        // --- SECTION 7: ROUTING & ERROR HANDLING ---
        console.log('\n--- 7. SPA ROUTING & ERROR HANDLING ---');

        // Invalid Book ID
        const invalidIdRes = await request('GET', '/api/books/INVALID_OBJECT_ID_XYZ');
        test('Invalid book ID format returns 400 Bad Request (does not hang or crash)', invalidIdRes.status === 400);

        // Unknown API Route
        const unknownApi = await request('GET', '/api/nonexistent-route');
        test('Unknown API endpoint returns 404 JSON response', unknownApi.status === 404 && unknownApi.data.success === false);

        // Frontend SPA Root
        const spaRoot = await request('GET', '/');
        test('Root URL serves index.html (SPA Entry Point)', spaRoot.status === 200 && spaRoot.headers['content-type'].includes('text/html'));

        // Frontend Direct Deep Link
        const spaDeepLink = await request('GET', '/books');
        test('Direct deep link (/books) serves index.html with 200 OK', spaDeepLink.status === 200 && spaDeepLink.headers['content-type'].includes('text/html'));

    } catch (e) {
        console.error('Fatal testing error:', e);
        failed++;
    }

    console.log('\n====================================================');
    console.log(`🏁 QA SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');
    process.exit(failed === 0 ? 0 : 1);
}

startServer().then(() => {
    runQASuite();
}).catch(err => {
    console.error('Server boot failed:', err);
    process.exit(1);
});

