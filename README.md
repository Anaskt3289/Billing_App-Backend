# Billing App Backend

A comprehensive billing application backend built with NestJS, MySQL, and TypeORM.

## Features

1. **Authentication**
   - User signup with company creation
   - Login with JWT token
   - Password hashing with bcrypt

2. **Product Management**
   - CRUD operations for products
   - Filter by company_id and search term
   - Support for multiple UOM (Unit of Measurement)

3. **Cart Functionality**
   - Add products to cart
   - Save as draft or proceed to billing
   - Rate calculation API

4. **Billing**
   - Generate bills with PDF
   - Store PDFs in AWS S3
   - Download/print bills
   - Share bills via WhatsApp

5. **Customer Management**
   - CRUD operations for customers

6. **Logging**
   - Winston logger with daily rotation
   - Automatic file zipping
   - 10-day retention policy

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env` and update the values:
   - Database credentials
   - JWT secret
   - AWS S3 credentials

## Database Setup

Run migrations to create database tables:

```bash
npm run migration:run
```

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /auth/signup` - User signup
- `POST /auth/login` - User login

### Products
- `POST /products` - Create product
- `GET /products` - Get all products (with filters)
- `GET /products/:id` - Get product by ID
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Cart
- `POST /cart` - Add items to cart
- `GET /cart` - Get cart
- `DELETE /cart` - Clear cart
- `POST /cart/calculate-rate` - Calculate rates

### Bills
- `POST /bills` - Create bill
- `GET /bills` - Get all bills
- `GET /bills/:id` - Get bill by ID
- `GET /bills/:id/pdf` - Get bill PDF URL
- `POST /bills/:id/share?mobile=1234567890` - Share bill via WhatsApp
- `DELETE /bills/:id` - Delete bill

### Customers
- `POST /customers` - Create customer
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `PATCH /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

## Database Schema

All tables use snake_case naming convention:
- `company` - Company information
- `user` - User accounts
- `product` - Product catalog
- `cart` - Shopping cart
- `cart_item` - Cart items
- `bill` - Bills
- `bill_item` - Bill items
- `customer` - Customer information

## Logging

Logs are stored in the `logs/` directory with daily rotation:
- `application-YYYY-MM-DD.log` - General logs
- `error-YYYY-MM-DD.log` - Error logs
- Old logs are automatically zipped
- Logs older than 10 days are automatically removed

## Notes

- All endpoints (except auth) require JWT authentication
- Company isolation is enforced at the service level
- PDF generation uses Puppeteer
- File uploads are stored in AWS S3
- WhatsApp sharing generates a shareable link

