const http = require('http');
const assert = require('assert');
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

async function runCleanCodePricingTest() {
    console.log('================================================================');
    console.log('🧪 CLEAN CODE QUANTITY & DYNAMIC PRICE CALCULATION TEST SUITE');
    console.log('================================================================\n');

    let server;
    try {
        server = await startServer();
    } catch (e) {
        console.error('Server boot error:', e);
        process.exit(1);
    }

    try {
        // 1. Fetch "Clean Code" from backend catalog
        const searchRes = await request('GET', '/api/books?search=Clean+Code');
        assert(searchRes.status === 200, 'Search for Clean Code succeeded');
        const cleanCode = searchRes.data.data.find(b => b.title.includes('Clean Code'));
        assert(cleanCode, 'Found Clean Code in database catalog');

        const unitPrice = cleanCode.price;
        console.log(`[PASS] Book Found: "${cleanCode.title}"`);
        console.log(`[PASS] Verified Unit Price: $${unitPrice.toFixed(2)} (Original DB Price)`);
        console.log(`[PASS] Available Stock: ${cleanCode.stock} units`);

        assert.strictEqual(unitPrice, 38.50, 'Unit price must strictly equal $38.50');

        // 2. Validate Dynamic Price Calculations for Clean Code ($38.50):
        const testCases = [
            { qty: 1, expected: '38.50' },
            { qty: 2, expected: '77.00' },
            { qty: 3, expected: '115.50' },
            { qty: 8, expected: '308.00' }
        ];

        for (const tc of testCases) {
            const calculatedTotal = (unitPrice * tc.qty).toFixed(2);
            assert.strictEqual(calculatedTotal, tc.expected, `Qty ${tc.qty} should produce $${tc.expected}`);
            console.log(`[PASS] Dynamic Price Formula Check: Qty ${tc.qty} × $${unitPrice.toFixed(2)} = $${calculatedTotal} (Matches Expected: $${tc.expected})`);
        }

        // 3. Authenticate customer account
        const loginRes = await request('POST', '/api/auth/login', {
            email: 'customer@bookstore.com',
            password: 'customer123'
        });
        assert(loginRes.status === 200 && loginRes.data.token, 'Customer login succeeded');
        const token = loginRes.data.token;

        // Clear cart first to have a clean state
        await request('DELETE', '/api/cart/clear', null, token);

        // 4. Test Adding Clean Code with Quantity = 8
        console.log('\n--- Testing Add to Cart with Quantity = 8 ---');
        const addRes = await request('POST', '/api/cart/add', {
            bookId: cleanCode._id,
            quantity: 8
        }, token);
        assert(addRes.status === 200, 'Add 8 copies of Clean Code to cart succeeded');
        assert.strictEqual(addRes.data.cart.items.length, 1, 'Cart has 1 line item');
        assert.strictEqual(addRes.data.cart.items[0].quantity, 8, 'Item quantity is 8');
        assert.strictEqual(addRes.data.cart.subtotal, 308.00, 'Cart subtotal for 8 copies is exactly $308.00');
        console.log(`[PASS] Added 8 copies to cart. Subtotal: $${addRes.data.cart.subtotal.toFixed(2)}`);

        // 5. Test Cart Quantity Updates (Decrement & Increment)
        console.log('\n--- Testing In-Cart Quantity Modifications ---');
        
        // Decrement to 2
        const decRes = await request('PUT', '/api/cart/update', {
            bookId: cleanCode._id,
            quantity: 2
        }, token);
        assert(decRes.status === 200, 'Update quantity to 2 succeeded');
        assert.strictEqual(decRes.data.cart.subtotal, 77.00, 'Subtotal for 2 copies is $77.00');
        console.log(`[PASS] Decremented to 2 copies. Subtotal: $${decRes.data.cart.subtotal.toFixed(2)}`);

        // Update back to 8
        const update8Res = await request('PUT', '/api/cart/update', {
            bookId: cleanCode._id,
            quantity: 8
        }, token);
        assert(update8Res.status === 200, 'Update quantity back to 8 succeeded');
        assert.strictEqual(update8Res.data.cart.subtotal, 308.00, 'Subtotal for 8 copies is $308.00');
        console.log(`[PASS] Restored quantity to 8 copies. Subtotal: $${update8Res.data.cart.subtotal.toFixed(2)}`);

        // 6. Test Maximum Stock Boundary Protection
        console.log('\n--- Testing Maximum Stock Boundary Protection ---');
        const excessiveQty = cleanCode.stock + 10;
        const overStockRes = await request('PUT', '/api/cart/update', {
            bookId: cleanCode._id,
            quantity: excessiveQty
        }, token);
        assert(overStockRes.status === 400, 'Exceeding available stock is properly blocked with 400 Bad Request');
        console.log(`[PASS] Attempting to set quantity (${excessiveQty}) above stock (${cleanCode.stock}) correctly rejected: "${overStockRes.data.message}"`);

        // 7. Test Instant Buy & Order Placement with Quantity = 8
        console.log('\n--- Testing Checkout & Order Creation for 8 Copies ---');
        const initialStock = cleanCode.stock;

        const checkoutRes = await request('POST', '/api/orders/checkout', {
            shippingAddress: {
                fullName: 'Jane Customer',
                phone: '+1 (555) 749-1029',
                street: '742 Evergreen Terrace',
                city: 'Springfield',
                state: 'OR',
                zipCode: '97477',
                country: 'USA'
            },
            paymentMethod: 'credit_card'
        }, token);

        assert(checkoutRes.status === 201, 'Order placement succeeded');
        const order = checkoutRes.data.order;
        console.log(`[PASS] Order Generated: ${order.orderId}`);
        console.log(`[PASS] Order Items: ${order.items[0].quantity} × "${order.items[0].title}" @ $${order.items[0].price.toFixed(2)}`);
        
        assert.strictEqual(order.subtotal, 308.00, 'Order subtotal is $308.00');
        assert.strictEqual(order.tax, 24.64, 'Order 8% tax is $24.64');
        assert.strictEqual(order.shippingFee, 0, 'Shipping is Free (subtotal > $50)');
        assert.strictEqual(order.totalAmount, 332.64, 'Grand Total is $332.64 ($308.00 + $24.64)');
        console.log(`[PASS] Verified Order Math: Subtotal $${order.subtotal.toFixed(2)} + Tax $${order.tax.toFixed(2)} = Total $${order.totalAmount.toFixed(2)}`);

        // 8. Verify Inventory Stock Decrement in DB
        const refreshedBook = await request('GET', `/api/books/${cleanCode._id}`);
        assert.strictEqual(refreshedBook.data.data.stock, initialStock - 8, 'Book stock correctly decremented by 8 in database');
        console.log(`[PASS] Stock atomically updated in DB: ${initialStock} -> ${refreshedBook.data.data.stock} units`);

        // 9. Cancel Order and Verify Stock Restitution
        console.log('\n--- Testing Order Cancellation & Stock Restitution ---');
        const cancelRes = await request('PUT', `/api/orders/${order._id}/cancel`, {}, token);
        assert(cancelRes.status === 200, 'Order cancellation succeeded');
        
        const restoredBook = await request('GET', `/api/books/${cleanCode._id}`);
        assert.strictEqual(restoredBook.data.data.stock, initialStock, 'Book stock fully restored after cancellation');
        console.log(`[PASS] Stock atomically restored to initial level: ${restoredBook.data.data.stock} units`);

        console.log('\n================================================================');
        console.log('🎉 ALL CLEAN CODE QUANTITY & PRICING TESTS PASSED (100%)');
        console.log('================================================================\n');

    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    } finally {
        if (server && server.close) {
            server.close();
        }
        process.exit(0);
    }
}

runCleanCodePricingTest();

