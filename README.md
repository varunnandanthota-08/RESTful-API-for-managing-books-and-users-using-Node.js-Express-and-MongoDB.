# PageTurn - Full-Stack Book Store Web Application

A complete, production-ready full-stack e-commerce bookstore web application built with **React**, **Express 5**, and **MongoDB**. Features JWT authentication with role-based access control (Customers & Administrators), advanced book catalog search/filtering/pagination, persistent shopping cart, checkout flow with stock reservation, simulated payment processing, order tracking, book reviews/ratings, customer wishlists, and a comprehensive Admin Management Dashboard.

The project is organized in a clean two-folder architecture separating frontend (`client/`) and backend (`server/`).

---

## 📁 Project Architecture & Two-Folder Structure

```
BookStoreAPI/
├── client/                                 # Frontend (React + Vite)
│   ├── public/                             # Static public assets (.gitkeep)
│   ├── src/                                # React source code
│   │   ├── components/                     # Header, Footer, BookCard, ProtectedRoute
│   │   ├── context/                        # AuthContext, CartContext, WishlistContext
│   │   ├── pages/                          # Catalog, Details, Cart, Checkout, Admin, Auth
│   │   ├── utils/                          # imageHelper with cover resolvers & fallbacks
│   │   ├── App.jsx                         # Route tree and layout providers
│   │   ├── index.css                       # Design tokens, typography & responsive styles
│   │   └── main.jsx                        # React root entrypoint
│   ├── index.html                          # Single-page application HTML entry
│   ├── package.json                        # Frontend dependencies & Vite scripts
│   └── vite.config.js                      # Vite config with /api reverse proxy to :5000
│
├── server/                                 # Backend REST API (Node.js + Express 5)
│   ├── controllers/                        # Business logic handlers
│   │   ├── admin-controller.js             # Analytics KPI & order management
│   │   ├── auth-controller.js              # Registration, login & profile
│   │   ├── book-controller.js              # Catalog querying & admin CRUD
│   │   ├── cart-controller.js              # Shopping cart persistence & stock checks
│   │   └── order-controller.js             # Checkout, stock reservation & orders
│   ├── database/                           # Database connection & seed logic
│   │   ├── db.js                           # Resilient MongoDB connector (Atlas + fallback)
│   │   └── seedData.js                     # 50 books, realistic orders, users & reviews
│   ├── middleware/                         # Express middleware
│   │   ├── authMiddleware.js               # JWT bearer token verification
│   │   └── roleMiddleware.js               # Admin RBAC enforcement
│   ├── models/                             # Mongoose schemas
│   │   ├── book.js                         # Book schema & indexes
│   │   ├── cart.js                         # Cart & cart items schema
│   │   ├── order.js                        # Order schema & tracking status
│   │   ├── review.js                       # Verified customer reviews
│   │   └── user.js                         # User account schema with bcrypt
│   ├── postman/                            # Postman API collections & test specs
│   │   ├── collections/                    # Request collections
│   │   ├── environments/                   # Postman environments
│   │   ├── globals/                        # Postman global variables
│   │   └── resources.yaml                  # Postman workspace definition
│   ├── routes/                             # Express route definitions
│   │   ├── admin-routes.js                 # /api/admin/*
│   │   ├── auth-routes.js                  # /api/auth/*
│   │   ├── book-routes.js                  # /api/books/*
│   │   ├── cart-routes.js                  # /api/cart/*
│   │   └── order-routes.js                 # /api/orders/*
│   ├── tests/                              # Automated test suites
│   │   ├── test-backend.js                 # 27-endpoint API & RBAC test suite
│   │   ├── test-clean-code-quantity-pricing.js # Dynamic pricing calculation test suite
│   │   ├── test-qa-full.js                 # 45-point end-to-end QA verification suite
│   │   └── test-qa-ui-covers.js            # Publisher covers & UI asset test suite
│   ├── .env                                # Backend environment configuration (git-ignored)
│   ├── .env.example                        # Safe environment template
│   ├── package.json                        # Backend dependencies & test scripts
│   └── server.js                           # Express app entrypoint & static SPA handler
│
├── .gitignore                              # Excludes node_modules, .env, dist, caches
├── package.json                            # Workspace root orchestration scripts
├── PROJECT_RESTRUCTURE_REPORT.md           # Migration audit & architecture report
└── README.md                               # Project documentation
```

---

## 🌟 Key Features

### 👤 User Authentication & Authorization
- **Secure Registration & Login** with password hashing using `bcryptjs` and token-based authentication via `jsonwebtoken` (JWT).
- **Role-Based Access Control (RBAC)** distinguishing between **Customers** and **Store Administrators**.
- **User Profile Management** with custom contact info and delivery address persistence.
- **One-Click Demo Logins** on the sign-in page for instant testing.

### 📚 Rich Book Catalog
- **Browse & Inspect**: Catalog of 50+ books featuring cover artwork, authors, categories, ISBNs, descriptions, publication years, pricing, and stock status.
- **Advanced Search & Filtering**: Multi-field search across titles, authors, and descriptions; category filtering pills; max-price range slider; and featured book toggles.
- **Dynamic Sorting & Pagination**: Sort by newest arrivals, price (low-to-high / high-to-low), customer rating, or title alphabetically.
- **Stock Indicators**: Real-time badges for *In Stock*, *Only X Left*, and *Out of Stock*.
- **Book Details & Related Recommendations**: Dedicated book details view showcasing synopsis, metadata, genuine buyer reviews, and related titles in the same category.
- **Reactive Dynamic Pricing**: On the Book Details page, incrementing or decrementing quantity immediately updates the displayed item total (`unitPrice * quantity`) while keeping unit price visible.

### 🛒 Shopping Cart & Wishlist
- **Interactive Cart**: Add books, increment/decrement quantities, validate against real-time inventory limits, and view instant subtotal, tax, and shipping calculations.
- **Cart Persistence**: Synchronized with user accounts in MongoDB when logged in, with fallback local persistence for guest visitors.
- **Wishlist**: Toggle and save favorite books to a personal reading wishlist with quick *Add to Cart* capability.

### 💳 Checkout & Order Processing
- **Seamless Checkout**: Captures recipient details, shipping destination, and contact phone number.
- **Simulated Payment Gateway**: Supports simulated Credit/Debit card, UPI instant payments, and Cash on Delivery.
- **Atomic Stock Reservation**: Automatically decrements book inventory in MongoDB upon order placement.
- **Unique Order IDs**: Generates distinct alphanumeric order numbers (e.g. `ORD-829104`).
- **Live Order Tracking**: Visual progress tracker showing `[Pending] → [Processing] → [Shipped] → [Delivered]`.
- **Order Cancellation**: Customers or admins can cancel active orders, automatically restoring book quantities back into store inventory.

### ⚡ Administrator Console & Dashboard
- **Executive Analytics**: Real-time KPI summary cards displaying Total Revenue ($), Total Orders, Total Books, and Total Customer Accounts.
- **Inventory Alerts**: Automatic warning table for books with low stock (<= 5 units remaining).
- **Book Catalog Management**: Full CRUD console to create new books, edit existing listings, update stock levels, and delete books.
- **Order Fulfillment**: Review customer orders, inspect items and delivery addresses, and update status milestones.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your system.

### 2. Environment Setup
The backend environment configuration is stored in `server/.env`. A safe template is provided in `server/.env.example`:

```bash
# From the project root, if server/.env does not exist:
cp server/.env.example server/.env
```

Contents of `server/.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/BookStore?retryWrites=true&w=majority
JWT_SECRET=supersecret_bookstore_jwt_key_2026_secure
NODE_ENV=development
```

> **Zero-Setup Database Fallback**: If the configured MongoDB Atlas URI is unreachable (e.g., due to IP whitelisting or firewall blocks), the server automatically launches a zero-setup embedded MongoDB memory instance and seeds 50 realistic books, sample orders, reviews, and customer accounts.

---

### 3. Installation & Running the Application

You can operate the project from the root directory or inside `server/` and `client/` independently:

#### Option A: Running from Root Directory (Recommended)

1. **Install dependencies across both client and server**:
   ```bash
   npm run install:all
   ```

2. **Production Unified Build & Start**:
   Builds the React frontend into `client/dist/` and runs the unified Express server serving both the REST API and the React SPA on port 5000:
   ```bash
   npm run build
   npm start
   ```
   Open **http://localhost:5000** in your browser.

3. **Concurrent Development Mode**:
   Run the backend and frontend in separate terminals:
   ```bash
   # Terminal 1: Backend server with auto-reload (Port 5000)
   npm run dev

   # Terminal 2: Vite frontend development server (Port 3000, proxies /api -> :5000)
   npm run client:dev
   ```
   Open **http://localhost:3000** in your browser.

---

#### Option B: Operating Folders Independently

##### Backend (`server/`)
```bash
cd server
npm install
npm run dev     # Starts nodemon development server on port 5000
npm start       # Starts production Node.js server
```

##### Frontend (`client/`)
```bash
cd client
npm install
npm run dev     # Starts Vite dev server on port 3000
npm run build   # Compiles production bundle into client/dist/
```

---

## 🔑 Pre-Seeded Demo Accounts

Use these pre-seeded accounts to explore customer and administrator features:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@bookstore.com` | `admin123` | Admin Dashboard, Stock Alerts, Catalog CRUD, Order Fulfillment, Revenue Analytics |
| **Customer** | `customer@bookstore.com` | `customer123` | Browsing, Cart, Checkout, Order Tracking, Wishlists, Reviews |

> **Quick-Fill Buttons**: On the `/login` page, click either the **Store Admin** or **Jane Customer** quick-fill button for one-click credential entry.

---

## 🧪 Automated Test Verification Suites

All test suites are located in `server/tests/` and can be executed from the root or inside `server/`:

```bash
# 1. Complete REST API & Role-Based Access Control Suite (27 tests)
npm test

# 2. Dynamic Quantity & Real-Time Price Calculation Suite (9 tests)
npm run test:pricing

# 3. Full End-to-End QA Business Flow Suite (45 tests)
npm run test:qa

# 4. Book Cover Resolution & UI Styling Verification Suite (5 tests)
npm run test:covers
```

### Test Suite Summary:
- **`server/tests/test-backend.js`**: Validates health check, legacy API endpoints, modern catalog search/filters/pagination, book recommendations, auth, cart, atomic stock reservation checkout, order status flow, review submission, and admin analytics.
- **`server/tests/test-clean-code-quantity-pricing.js`**: Specifically verifies Clean Code ($38.50/copy) pricing calculation across quantities 1, 2, 3, and 8 ($308.00), maximum stock bounds, decrementing to 1, instant buy payload, and cart subtotal consistency.
- **`server/tests/test-qa-full.js`**: Verifies comprehensive database seeding (50+ books, 11+ users, 18+ orders), out-of-stock guards, order cancellations with stock restoration, rating recalculations, and admin order updates.
- **`server/tests/test-qa-ui-covers.js`**: Verifies publisher cover images for titles (Clean Code, Pragmatic Programmer, JavaScript Definitive Guide, Python Crash Course), SVG cover generator fallbacks, and CSS 2:3 aspect ratio consistency.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create new customer account
- `POST /api/auth/login` - Authenticate user & receive JWT token
- `GET /api/auth/profile` - Fetch authenticated user profile [Auth]
- `PUT /api/auth/profile` - Update name, phone, or address [Auth]
- `GET /api/auth/wishlist` - Fetch user's wishlist [Auth]
- `POST /api/auth/wishlist/toggle/:bookId` - Add or remove book from wishlist [Auth]

### Book Catalog (`/api/books`)
- `GET /api/books` - List books with search, category, price, sort & pagination
- `GET /api/books/categories` - Distinct categories
- `GET /api/books/featured` - Curated featured books
- `GET /api/books/:id` - Book details, reviews, and related books
- `POST /api/books/:id/reviews` - Post rating (1-5) and review [Auth]
- `GET /api/books/:id/reviews` - Fetch reviews for a book
- `POST /api/books` - Add new book [Admin]
- `PUT /api/books/:id` - Update book details or stock [Admin]
- `DELETE /api/books/:id` - Remove book [Admin]
- *Legacy endpoints preserved:* `GET /api/books/get`, `GET /api/books/get/:id`, `POST /api/books/add`, `PUT /api/books/update/:id`, `DELETE /api/books/delete/:id`

### Shopping Cart (`/api/cart`) [Requires Auth]
- `GET /api/cart` - Get user's cart with subtotal
- `POST /api/cart/add` - Add book to cart with quantity validation
- `PUT /api/cart/update` - Modify quantity
- `DELETE /api/cart/remove/:bookId` - Remove specific item
- `DELETE /api/cart/clear` - Empty cart

### Orders & Checkout (`/api/orders`) [Requires Auth]
- `POST /api/orders/checkout` - Finalize order, decrement stock, generate order ID
- `GET /api/orders/my-orders` - Customer's past orders
- `GET /api/orders/:id` - Order receipt & shipment status
- `PUT /api/orders/:id/cancel` - Cancel order & restore inventory stock

### Admin Management (`/api/admin`) [Requires Admin]
- `GET /api/admin/stats` - Total revenue, orders, books, readers, and low-stock alerts
- `GET /api/admin/orders` - Filterable customer orders list
- `PUT /api/admin/orders/:id/status` - Update status (`Processing`, `Shipped`, `Delivered`, `Cancelled`)
- `GET /api/admin/users` - Registered customer list

---

## 📮 Postman Collections

Postman workspace and collections are located in `server/postman/`:
- `server/postman/collections/BookAPI/`: API request templates covering catalog endpoints, auth flows, and cart operations.
- `server/postman/environments/`: Pre-configured environment variables for local testing (`http://localhost:5000`).
