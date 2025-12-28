# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

All endpoints except `/auth/*` require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

---

## Authentication Endpoints

### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "companyName": "My Company",
  "userName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "mobile": "1234567890"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "userId": 1,
    "userName": "John Doe",
    "email": "john@example.com",
    "companyId": 1,
    "userRoleId": 1
  },
  "company": {
    "companyId": 1,
    "companyName": "My Company"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "userId": 1,
    "userName": "John Doe",
    "email": "john@example.com",
    "companyId": 1,
    "userRoleId": 1
  }
}
```

---

## Product Endpoints

### Create Product
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "productName": "Product Name",
  "productCode": "PROD001",
  "quantity": 100,
  "basePrice": 50.00,
  "uom": "PER_PIECE"
}
```

**UOM Options:** `PER_PIECE`, `KG`, `GRAM`, `LITER`, `METER`

### Get All Products
```http
GET /products?companyId=1&searchTerm=product
Authorization: Bearer <token>
```

**Query Parameters:**
- `companyId` (optional): Filter by company
- `searchTerm` (optional): Search in product name or code

### Get Product by ID
```http
GET /products/:id
Authorization: Bearer <token>
```

### Update Product
```http
PATCH /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "productName": "Updated Name",
  "basePrice": 60.00
}
```

### Delete Product
```http
DELETE /products/:id
Authorization: Bearer <token>
```

---

## Cart Endpoints

### Add to Cart
```http
POST /cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": 1,
      "quantity": 5
    },
    {
      "productId": 2,
      "quantity": 10
    }
  ],
  "isDraft": true
}
```

**isDraft:**
- `true`: Save as draft (can be modified later)
- `false`: Proceed directly to billing

### Get Cart
```http
GET /cart
Authorization: Bearer <token>
```

### Clear Cart
```http
DELETE /cart
Authorization: Bearer <token>
```

### Calculate Rate
```http
POST /cart/calculate-rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "basePrice": 50.00,
      "quantity": 5,
      "uom": "PER_PIECE"
    },
    {
      "basePrice": 100.00,
      "quantity": 2,
      "uom": "KG"
    }
  ]
}
```

**Response:**
```json
{
  "items": [
    {
      "basePrice": 50.00,
      "quantity": 5,
      "uom": "PER_PIECE",
      "totalPrice": 250.00
    },
    {
      "basePrice": 100.00,
      "quantity": 2,
      "uom": "KG",
      "totalPrice": 200.00
    }
  ],
  "grandTotal": 450.00
}
```

---

## Bill Endpoints

### Create Bill
```http
POST /bills
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 5,
      "unitPrice": 50.00,
      "totalPrice": 250.00
    }
  ],
  "totalAmount": 250.00
}
```

### Get All Bills
```http
GET /bills
Authorization: Bearer <token>
```

### Get Bill by ID
```http
GET /bills/:id
Authorization: Bearer <token>
```

### Get Bill PDF URL
```http
GET /bills/:id/pdf
Authorization: Bearer <token>
```

**Response:**
```json
{
  "url": "https://s3.amazonaws.com/..."
}
```

### Share Bill via WhatsApp
```http
POST /bills/:id/share?mobile=1234567890
Authorization: Bearer <token>
```

**Response:**
```json
{
  "whatsappUrl": "https://wa.me/1234567890?text=...",
  "pdfUrl": "https://s3.amazonaws.com/...",
  "message": "Bill shared via WhatsApp"
}
```

### Delete Bill
```http
DELETE /bills/:id
Authorization: Bearer <token>
```

---

## Customer Endpoints

### Create Customer
```http
POST /customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerName": "Customer Name",
  "customerMobile": "1234567890"
}
```

### Get All Customers
```http
GET /customers
Authorization: Bearer <token>
```

### Get Customer by ID
```http
GET /customers/:id
Authorization: Bearer <token>
```

### Update Customer
```http
PATCH /customers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerName": "Updated Name"
}
```

### Delete Customer
```http
DELETE /customers/:id
Authorization: Bearer <token>
```

---

## Company Endpoints

### Get Company
```http
GET /companies
Authorization: Bearer <token>
```

### Upload Company Logo
```http
POST /companies/logo
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image-file>
```

### Update Company
```http
PATCH /companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "Updated Company Name"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

