# Migration Guide

This guide explains how to run database migrations for the Billing App.

## Prerequisites

1. MySQL database server running
2. Database created (default: `billing_app`)
3. Environment variables configured in `.env` file

## Running Migrations

### 1. Run all pending migrations

```bash
npm run migration:run
```

This will execute all migration files in the `src/migrations/` directory in order.

### 2. Revert the last migration

```bash
npm run migration:revert
```

This will undo the last executed migration.

### 3. Generate a new migration

```bash
npm run migration:generate
```

Note: This requires changes to entities first. After modifying entities, run this command to generate a new migration file.

## Migration Files

The migration files are located in `src/migrations/`:

1. `1700000000001-CreateCompanyTable.ts` - Creates company table
2. `1700000000002-CreateUserTable.ts` - Creates user table
3. `1700000000003-CreateProductTable.ts` - Creates product table
4. `1700000000004-CreateCustomerTable.ts` - Creates customer table
5. `1700000000005-CreateCartTable.ts` - Creates cart table
6. `1700000000006-CreateCartItemTable.ts` - Creates cart_item table
7. `1700000000007-CreateBillTable.ts` - Creates bill table
8. `1700000000008-CreateBillItemTable.ts` - Creates bill_item table

## Database Schema

All tables follow snake_case naming convention:

- `company` - Stores company information
- `user` - Stores user accounts
- `product` - Stores product catalog
- `customer` - Stores customer information
- `cart` - Stores shopping carts
- `cart_item` - Stores cart items
- `bill` - Stores bills
- `bill_item` - Stores bill line items

## Troubleshooting

### Migration fails with "Table already exists"

If you get this error, you may need to:
1. Drop the existing tables manually
2. Or modify the migration to check if table exists before creating

### Migration fails with connection error

Check your `.env` file and ensure:
- Database credentials are correct
- Database server is running
- Database exists

### Migration order issues

Migrations are executed in timestamp order. Ensure migration timestamps are sequential.

