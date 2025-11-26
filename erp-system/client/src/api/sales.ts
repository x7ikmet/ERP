import { apiClient, type QueryParams, buildQueryString } from './client';
import type { Customer } from './customers';
import type { Product } from './products';

/**
 * Sale types
 */
export interface SaleItem {
  id?: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface Sale {
  id: number;
  saleNumber: string;
  customerId?: number;
  customer?: Customer;
  status: 'draft' | 'completed' | 'canceled';
  subtotal: number;
  tax?: number;
  total: number;
  items: SaleItem[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateSaleRequest {
  customerId?: number;
  items: Omit<SaleItem, 'id' | 'product' | 'totalPrice'>[];
}

export interface UpdateSaleRequest {
  customerId?: number;
  status?: 'draft' | 'completed' | 'canceled';
  items: SaleItem[];
}

export interface SaleQueryParams extends QueryParams {
  status?: 'draft' | 'completed' | 'canceled';
  customerId?: number;
  search?: string;
  from?: string; // Date string (YYYY-MM-DD)
  to?: string;   // Date string (YYYY-MM-DD)
  page?: number;
  pageSize?: number;
}

/**
 * Sales API functions
 */
export const salesApi = {
  /**
   * Get all sales with optional filtering
   */
  async getSales(params?: SaleQueryParams): Promise<Sale[]> {
    const queryString = params ? buildQueryString(params) : '';
    return apiClient.get<Sale[]>(`/sales${queryString}`);
  },

  /**
   * Get sale by ID
   */
  async getSaleById(id: number): Promise<Sale> {
    return apiClient.get<Sale>(`/sales/${id}`);
  },

  /**
   * Create a new sale
   */
  async createSale(data: CreateSaleRequest): Promise<Sale> {
    return apiClient.post<Sale>('/sales', data);
  },

  /**
   * Update sale by ID
   */
  async updateSale(id: number, data: UpdateSaleRequest): Promise<Sale> {
    return apiClient.put<Sale>(`/sales/${id}`, data);
  },

  /**
   * Complete a sale
   */
  async completeSale(id: number): Promise<Sale> {
    return apiClient.patch<Sale>(`/sales/${id}/complete`);
  },

  /**
   * Cancel a sale
   */
  async cancelSale(id: number): Promise<Sale> {
    return apiClient.patch<Sale>(`/sales/${id}/cancel`);
  },

  /**
   * Delete sale by ID
   */
  async deleteSale(id: number): Promise<void> {
    return apiClient.delete(`/sales/${id}`);
  },
};