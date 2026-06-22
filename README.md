# Gamers Hub — Full-Stack Gaming Accessories E-Commerce Request System

Gamers Hub is a complete full-stack web application for a local gaming accessories store. Customers can register, log in, browse products, add products to cart or wishlist, and send product requests to the admin. The admin can manage products, view customer requests, and accept or reject requests.

The sample system link in the assignment is used only to understand the basic idea and flow. This project uses a new theme, new product data, new UI design, new code structure, new database structure, and custom local SVG product images.

---

## 1. Technology Stack

### Frontend
- React.js with Vite
- React Router DOM
- Axios
- React Hooks
- LocalStorage for JWT/user session
- React Toastify notifications
- React Icons
- Custom responsive CSS

### Backend
- Node.js
- Express.js
- MySQL database
- mysql2/promise
- cors
- dotenv
- bcryptjs password hashing
- JWT authentication
- nodemon
- Nodemailer optional mail feature

### Database
- MySQL
- No temporary array storage is used for final data.

---

## 2. Main Features

### Customer Features
- Customer registration
- Customer login
- View products
- Product search, category filter, and price filter
- Product details page
- Add to cart
- Update cart quantity
- Remove cart item
- Empty cart validation before request
- Add to wishlist
- Remove from wishlist
- Send product request from cart
- View request status: pending, accepted, rejected
- Profile update
- Optional password change
- Contact form

### Admin Features
- Separate admin login
- Admin dashboard statistics
- Product create, read, update, delete/inactive
- View all customer requests
- Filter requests by status
- Accept request
- Reject request
- Accepted request automatically reduces product stock
- View users
- Ban or activate users

---

## 3. Folder Structure

```txt
gamers-hub-fullstack/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── contactController.js
│   │   ├── productController.js
│   │   ├── requestController.js
│   │   └── wishlistController.js
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── productRoutes.js
│   │   ├── requestRoutes.js
│   │   └── wishlistRoutes.js
│   ├── utils/
│   │   ├── mailer.js
│   │   ├── response.js
│   │   └── validators.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/images/
│   │   └── custom SVG product images
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 4. Database Setup

### Step 1: Open MySQL

```bash
mysql -u root -p
```

### Step 2: Run the schema file

From the project root:

```bash
mysql -u root -p < backend/database/schema.sql
```

This creates the database `gamers_hub_db` and all required tables.

### Tables
- `users`
- `products`
- `cart_items`
- `wishlist_items`
- `product_requests`
- `request_items`

---

## 5. Backend Setup

### Step 1: Go to backend folder

```bash
cd backend
```

### Step 2: Install packages

```bash
npm install
```

### Step 3: Create `.env`

Copy `.env.example` and rename it to `.env`.

```bash
cp .env.example .env
```

Update your MySQL password and JWT secret:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=gamers_hub_db
DB_PORT=3306
JWT_SECRET=your_long_secret_key
JWT_EXPIRES_IN=7d
```

### Step 4: Seed demo data

```bash
node database/seed.js
```

This adds demo admin, demo user, and gaming accessory products.

### Demo Accounts

```txt
Admin:
Email: admin@gamershub.lk
Password: Admin@123

Customer:
Email: user@gamershub.lk
Password: User@1234
```

### Step 5: Start backend

```bash
npm run dev
```

Backend runs at:

```txt
http://localhost:5000
```

---

## 6. Frontend Setup

Open a new terminal.

### Step 1: Go to frontend folder

```bash
cd frontend
```

### Step 2: Install packages

```bash
npm install
```

### Step 3: Create `.env`

```bash
cp .env.example .env
```

Check the API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Start frontend

```bash
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

---

## 7. User Flow

1. Customer opens the home page.
2. Customer registers or logs in.
3. Customer views gaming accessories.
4. Customer searches and filters products.
5. Customer opens product details.
6. Customer adds products to cart or wishlist.
7. Customer opens cart and updates quantities.
8. Customer sends cart as a product request.
9. Request status becomes `pending`.
10. Customer checks status in `My Requests` page.
11. When admin accepts or rejects, status changes for the customer.

---

## 8. Admin Flow

1. Admin opens `/admin/login`.
2. Admin logs in with admin account.
3. Admin views dashboard statistics.
4. Admin creates, edits, or removes products.
5. Admin views customer product requests.
6. Admin accepts or rejects pending requests.
7. If accepted, product stock is reduced automatically.
8. Admin can view users and ban/activate customer accounts.

---

## 9. Validation Included

### Frontend Validation
- Required field checks
- Email format validation
- Password length validation
- Confirm password match
- Sri Lankan phone format validation: `0771234567`
- Product image extension validation
- Price greater than 0
- Quantity must be 0 or greater for product stock
- Quantity must be greater than 0 for cart
- Empty cart validation before request
- Error messages shown below inputs in red

### Backend Validation
- Required field validation before save
- Duplicate email validation
- Invalid login credential validation
- Invalid/expired JWT token validation
- Role-based access control
- Duplicate cart product check
- Duplicate wishlist product check
- Product stock validation
- Clear success/error JSON response format

---

## 10. Important API Routes

### Auth
```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/admin-login
GET  /api/auth/me
PUT  /api/auth/profile
PUT  /api/auth/change-password
```

### Products
```txt
GET    /api/products
GET    /api/products/categories
GET    /api/products/:id
POST   /api/products             admin only
PUT    /api/products/:id         admin only
DELETE /api/products/:id         admin only
```

### Cart
```txt
GET    /api/cart                 user only
POST   /api/cart                 user only
PUT    /api/cart/:id             user only
DELETE /api/cart/:id             user only
DELETE /api/cart                 user only
```

### Wishlist
```txt
GET    /api/wishlist             user only
POST   /api/wishlist             user only
DELETE /api/wishlist/:id         user only
```

### Requests
```txt
POST /api/requests               user only
GET  /api/requests/my            user only
GET  /api/requests               admin only
PUT  /api/requests/:id/status    admin only
```

### Admin
```txt
GET /api/admin/stats             admin only
GET /api/admin/users             admin only
PUT /api/admin/users/:id/status  admin only
```

---

## 11. Optional Features Implemented

- Nodemailer contact form route included
- Nodemailer request status email included when admin accepts/rejects
- Pagination for products and admin requests
- Search and filter for products
- Toastify notifications
- React Icons
- Responsive design
- Dashboard statistics
- Clean custom UI

Nodemailer requires real SMTP credentials in backend `.env`. Without SMTP credentials, the main application still works.

---

## 12. Review Explanation Points

During project review, explain these parts clearly:

- React Router DOM handles page navigation.
- Axios connects frontend to backend API.
- LocalStorage stores JWT token and user details.
- AuthContext manages logged-in state.
- Express routes separate auth, products, cart, wishlist, requests, and admin actions.
- JWT middleware protects private routes.
- Role middleware prevents users from accessing admin features.
- bcryptjs hashes passwords before saving to MySQL.
- MySQL tables store real data, not temporary arrays.
- Product request workflow uses `product_requests` and `request_items` tables.
- Admin accept/reject updates request status.
- Accepted request reduces product stock.

---

## 13. Notes

- This project uses MySQL because the assignment first says the database is MySQL.
- The later line mentioning MongoDB/Atlas appears to be from a template requirement. For this submitted version, the selected database is MySQL.
- Product images are original local SVG images stored in `frontend/public/images`.
