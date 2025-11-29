/**
 * Main API exports
 * 
 * This file provides a centralized way to import all API modules
 * and utilities throughout the application.
 */

// Import all API modules for the convenience object
import { authApi, tokenManager } from './auth';
import { usersApi } from './users';
import { categoriesApi } from './categories';
import { suppliersApi } from './suppliers';
import { customersApi } from './customers';
import { productsApi } from './products';
import { purchasesApi } from './purchases';
import { salesApi } from './sales';
import { statisticsApi } from './statistics';

// Core client and types
export { apiClient, ApiError, buildQueryString } from './client';
export type { 
  ApiResponse, 
  PaginatedResponse, 
  QueryParams 
} from './client';

// Authentication
export { authApi, tokenManager };
export type {
  LoginCredentials,
  RegisterCredentials,
  AuthTokens,
  User,
  LoginResponse,
  RefreshTokenRequest
} from './auth';

// Users
export { usersApi };

// Categories
export { categoriesApi };
export type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryQueryParams
} from './categories';

// Suppliers
export { suppliersApi };
export type {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierQueryParams
} from './suppliers';

// Customers
export { customersApi };
export type {
  Customer,
  CustomersCollection,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerQueryParams
} from './customers';

// Products
export { productsApi };
export type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams
} from './products';

// Purchases
export { purchasesApi };
export type {
  Purchase,
  PurchaseItem,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  PurchaseQueryParams
} from './purchases';

// Sales
export { salesApi };
export type {
  Sale,
  SaleItem,
  CreateSaleRequest,
  UpdateSaleRequest,
  SaleQueryParams
} from './sales';

// Statistics
export { statisticsApi };
export type {
  DashboardStatistics,
  SalesStatistics,
  ProductStatistics,
  CustomerStatistics
} from './statistics';

// Convenience object for accessing all APIs
export const api = {
  auth: authApi,
  users: usersApi,
  categories: categoriesApi,
  suppliers: suppliersApi,
  customers: customersApi,
  products: productsApi,
  sales: salesApi,
  statistics: statisticsApi,
};