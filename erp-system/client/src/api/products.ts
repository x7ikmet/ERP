import { apiClient, type PaginatedResponse, type QueryParams, buildQueryString } from './client';

/**
 * Product types matching backend structure
 */
export interface Product {
  id: number;
  sku?: string;
  name: string;
  slug: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  unitPrice: number;
  costPrice: number;
  stockQty: number;
  barcode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  sku?: string;
  slug: string;
  categoryId: number;
  unitPrice: number;
  costPrice: number;
  stockQty: number;
  barcode?: string;
  isActive: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductQueryParams extends QueryParams {
  search?: string;
  categoryName?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductsCollection extends PaginatedResponse<Product> {}

/**
 * Products API functions
 */
export const productsApi = {
  /**
   * Get all products with optional filtering
   */
  async getProducts(params?: ProductQueryParams): Promise<ProductsCollection> {
    const queryString = params ? buildQueryString(params) : '';
    return apiClient.get<ProductsCollection>(`/products${queryString}`);
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
  async updateProduct(id: number, data: UpdateProductRequest): Promise<void> {
    return apiClient.put<void>(`/products/${id}`, data);
  },

  /**
   * Delete product by ID
   */
  async deleteProduct(id: number): Promise<void> {
    return apiClient.delete(`/products/${id}`);
  },
};