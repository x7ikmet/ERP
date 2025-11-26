import { apiClient, type QueryParams, buildQueryString } from './client';
import type { Category } from './categories';
import type { Supplier } from './suppliers';

/**
 * Product types
 */
export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  categoryId?: number;
  category?: Category;
  supplierId?: number;
  supplier?: Supplier;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  categoryId?: number;
  supplierId?: number;
  isActive?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductQueryParams extends QueryParams {
  categoryId?: number;
  supplierId?: number;
  isActive?: boolean;
  lowStock?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Products API functions
 */
export const productsApi = {
  /**
   * Get all products with optional filtering
   */
  async getProducts(params?: ProductQueryParams): Promise<Product[]> {
    const queryString = params ? buildQueryString(params) : '';
    return apiClient.get<Product[]>(`/products${queryString}`);
  },

  /**
   * Get product by ID
   */
  async getProductById(id: number): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
  },

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    return apiClient.post<Product>('/products', data);
  },

  /**
   * Update product by ID
   */
  async updateProduct(id: number, data: UpdateProductRequest): Promise<Product> {
    return apiClient.put<Product>(`/products/${id}`, data);
  },

  /**
   * Delete product by ID
   */
  async deleteProduct(id: number): Promise<void> {
    return apiClient.delete(`/products/${id}`);
  },
};