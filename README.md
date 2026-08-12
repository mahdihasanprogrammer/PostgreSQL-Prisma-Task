# PostgreSQL Prisma REST API

### General Information
- **Base URL:** `http://localhost:5500/api`
- **Main API Routes:** `/api/categories`, `/api/products`, `/api/reviews`, `/api/users`
- **Soft Delete:** All `DELETE` operations mark `isDeleted: true`. Permanent deletion (`?permanent=true`) is supported only for Users (`DELETE /api/users/:id?permanent=true`).

### Prisma Commands
```bash
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

---

## 1. Categories (`/api/categories`)

#### `POST /api/categories`
- **Description:** Create a new category.
- **Request Body:**
  ```json
  { "name": "Electronics" }
  ```
- **Response (201):**
  ```json
  { "success": true, "message": "Category created successfully", "data": { "id": "uuid", "name": "Electronics", "isDeleted": false } }
  ```
- **Status Codes:** `201`, `400`, `500`

#### `GET /api/categories`
- **Description:** Get all active categories with their products.
- **Response (200):**
  ```json
  { "success": true, "message": "Categories fetched successfully", "data": [{ "id": "uuid", "name": "Electronics", "products": [] }] }
  ```
- **Status Codes:** `200`, `500`

#### `GET /api/categories/:id`
- **Description:** Get category by ID with products.
- **Response (200):**
  ```json
  { "success": true, "message": "Category fetched successfully", "data": { "id": "uuid", "name": "Electronics", "products": [] } }
  ```
- **Status Codes:** `200`, `404`, `500`

#### `PATCH /api/categories/:id`
- **Description:** Update category name.
- **Request Body:**
  ```json
  { "name": "Smart Electronics" }
  ```
- **Response (200):**
  ```json
  { "success": true, "message": "Category updated successfully", "data": { "id": "uuid", "name": "Smart Electronics" } }
  ```
- **Status Codes:** `200`, `400`, `404`, `500`

#### `DELETE /api/categories/:id`
- **Description:** Soft-delete a category (`isDeleted: true`).
- **Response (200):**
  ```json
  { "success": true, "message": "Category deleted successfully", "data": { "id": "uuid", "message": "Category marked as deleted" } }
  ```
- **Status Codes:** `200`, `404`, `500`

---

## 2. Products (`/api/products`)

#### `POST /api/products`
- **Description:** Create a product (status auto-sets to `OUT_OF_STOCK` if stock is 0, else `ACTIVE`).
- **Request Body:**
  ```json
  { "title": "Headphones", "price": 150, "stock": 25, "categoryId": "uuid" }
  ```
- **Response (201):**
  ```json
  { "success": true, "message": "Product created successfully", "data": { "id": "uuid", "title": "Headphones", "price": 150, "status": "ACTIVE", "category": { "id": "uuid", "name": "Electronics" } } }
  ```
- **Status Codes:** `201`, `400`, `404`, `500`

#### `GET /api/products`
- **Description:** Get all active products with category details.
- **Response (200):**
  ```json
  { "success": true, "message": "Products retrieved successfully", "data": [{ "id": "uuid", "title": "Headphones", "price": 150, "category": { "id": "uuid", "name": "Electronics" } }] }
  ```
- **Status Codes:** `200`, `500`

#### `GET /api/products/:id`
- **Description:** Get product by ID with category details.
- **Response (200):**
  ```json
  { "success": true, "message": "Product fetched successfully", "data": { "id": "uuid", "title": "Headphones", "price": 150, "category": { "id": "uuid", "name": "Electronics" } } }
  ```
- **Status Codes:** `200`, `404`, `500`

#### `PATCH /api/products/:id`
- **Description:** Update product details.
- **Request Body:**
  ```json
  { "price": 125, "stock": 10 }
  ```
- **Response (200):**
  ```json
  { "success": true, "message": "Product updated successfully", "data": { "id": "uuid", "title": "Headphones", "price": 125, "category": { "id": "uuid", "name": "Electronics" } } }
  ```
- **Status Codes:** `200`, `400`, `404`, `500`

#### `DELETE /api/products/:id`
- **Description:** Soft-delete a product (`isDeleted: true`).
- **Response (200):**
  ```json
  { "success": true, "message": "Product deleted successfully", "data": { "id": "uuid", "message": "Product marked as deleted" } }
  ```
- **Status Codes:** `200`, `404`, `500`

---

## 3. Reviews (`/api/reviews`)

#### `POST /api/reviews`
- **Description:** Create a review (rating must be an integer from 1 to 5; checks active user & product).
- **Request Body:**
  ```json
  { "userId": "uuid", "productId": "uuid", "rating": 5, "comment": "Great product!" }
  ```
- **Response (201):**
  ```json
  { "success": true, "message": "Review created successfully", "data": { "id": "uuid", "rating": 5, "user": { "id": "uuid", "name": "John" }, "product": { "id": "uuid", "title": "Headphones" } } }
  ```
- **Status Codes:** `201`, `400`, `404`, `500`

#### `GET /api/reviews`
- **Description:** Get all active reviews with user and product details.
- **Response (200):**
  ```json
  { "success": true, "message": "Reviews fetched successfully", "data": [{ "id": "uuid", "rating": 5, "user": { "id": "uuid", "name": "John" }, "product": { "id": "uuid", "title": "Headphones" } }] }
  ```
- **Status Codes:** `200`, `500`

#### `GET /api/reviews/:id`
- **Description:** Get review by ID with user and product details.
- **Response (200):**
  ```json
  { "success": true, "message": "Review fetched successfully", "data": { "id": "uuid", "rating": 5, "user": { "id": "uuid", "name": "John" }, "product": { "id": "uuid", "title": "Headphones" } } }
  ```
- **Status Codes:** `200`, `404`, `500`

#### `PATCH /api/reviews/:id`
- **Description:** Update review rating or comment.
- **Request Body:**
  ```json
  { "rating": 4, "comment": "Updated comment" }
  ```
- **Response (200):**
  ```json
  { "success": true, "message": "Review updated successfully", "data": { "id": "uuid", "rating": 4, "user": { "id": "uuid", "name": "John" }, "product": { "id": "uuid", "title": "Headphones" } } }
  ```
- **Status Codes:** `200`, `400`, `404`, `500`

#### `DELETE /api/reviews/:id`
- **Description:** Soft-delete a review (`isDeleted: true`).
- **Response (200):**
  ```json
  { "success": true, "message": "Review deleted successfully", "data": { "id": "uuid", "message": "Review marked as deleted" } }
  ```
- **Status Codes:** `200`, `404`, `500`

---

## 4. Users (`/api/users`)

#### `POST /api/users`
- **Description:** Create a new user.
- **Request Body:**
  ```json
  { "name": "John Doe", "email": "john@example.com", "password": "pass", "role": "USER" }
  ```
- **Response (201):**
  ```json
  { "success": true, "message": "User created successfully", "data": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "role": "USER" } }
  ```
- **Status Codes:** `201`, `400`, `500`

#### `GET /api/users`
- **Description:** Get all active users (excludes password field).
- **Response (200):**
  ```json
  { "success": true, "message": "Users fetched successfully", "data": [{ "id": "uuid", "name": "John Doe", "email": "john@example.com" }] }
  ```
- **Status Codes:** `200`, `500`

#### `GET /api/users/:id`
- **Description:** Get user by ID with active reviews.
- **Response (200):**
  ```json
  { "success": true, "message": "User fetched successfully", "data": { "id": "uuid", "name": "John Doe", "reviews": [] } }
  ```
- **Status Codes:** `200`, `404`, `500`

#### `PATCH /api/users/:id`
- **Description:** Update user information.
- **Request Body:**
  ```json
  { "name": "Jane Doe", "email": "jane@example.com" }
  ```
- **Response (200):**
  ```json
  { "success": true, "data": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" } }
  ```
- **Status Codes:** `200`, `400`, `404`, `500`

#### `DELETE /api/users/:id`
- **Description:** Soft-delete user. Pass `?permanent=true` query parameter for permanent DB deletion.
- **Response (200):**
  ```json
  { "success": true, "message": "User deleted successfully", "data": { "id": "uuid", "message": "User marked as deleted" } }
  ```
- **Status Codes:** `200`, `404`, `500`
