# ERP API Design

## Authentication Endpoints
```
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

## Users & Roles
```
GET    /users
POST   /users
GET    /users/{id}
PUT    /users/{id}
DELETE /users/{id}

GET    /roles
```

## Categories
```
GET    /categories
POST   /categories
GET    /categories/{id}
PUT    /categories/{id}
DELETE /categories/{id}
```

## Products
```
GET    /products
POST   /products
GET    /products/{id}
PUT    /products/{id}
DELETE /products/{id}
GET    /products/by-category/{categoryId}
```

## Suppliers
```
GET    /suppliers
POST   /suppliers
GET    /suppliers/{id}
PUT    /suppliers/{id}
DELETE /suppliers/{id}
```

## Customers
```
GET    /customers
POST   /customers
GET    /customers/{id}
PUT    /customers/{id}
DELETE /customers/{id}
```

## Purchases
```
GET    /purchases
POST   /purchases
GET    /purchases/{id}
PUT    /purchases/{id}
DELETE /purchases/{id}
GET    /purchases/by-supplier/{supplierId}

GET    /purchases/{id}/items
POST   /purchases/{id}/items
PUT    /purchases/{id}/items/{itemId}
DELETE /purchases/{id}/items/{itemId}
```

## Sales
```
GET    /sales
POST   /sales
GET    /sales/{id}
PUT    /sales/{id}
DELETE /sales/{id}
GET    /sales/by-customer/{customerId}

GET    /sales/{id}/items
POST   /sales/{id}/items
PUT    /sales/{id}/items/{itemId}
DELETE /sales/{id}/items/{itemId}
```

## Request/Response Examples

### Login
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### Create Product
```json
POST /products
{
  "sku": "PROD001",
  "name": "Product Name",
  "category_id": 1,
  "unit_price": 100.00,
  "cost_price": 60.00,
  "stock_qty": 50
}
```

### Create Purchase
```json
POST /purchases
{
  "supplier_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 10,
      "unit_cost": 60.00
    }
  ]
}
```

### Create Sale
```json
POST /sales
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 100.00
    }
  ]
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term
- `sort`: Sort field
- `order`: asc/desc