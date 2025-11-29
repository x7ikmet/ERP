import { apiClient, type QueryParams, type PaginatedResponse, buildQueryString } from './client';

/**
 * Sale types matching backend structure
 */
export interface SaleItem {
  id: number;
  productId: number;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: number;
  customerId?: number;
  customerName?: string;
  saleNo: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
  items: SaleItem[];
}

export interface CreateSaleItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleRequest {
  customerId?: number;
  items: CreateSaleItemRequest[];
}

export interface UpdateSaleItemRequest {
  id?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface UpdateSaleRequest {
  customerId?: number;
  status?: string;
  items: UpdateSaleItemRequest[];
}

export interface SaleQueryParams extends QueryParams {
  status?: string;
  customer?: number;
  search?: string;
  from?: string; // Date string (YYYY-MM-DD)
  to?: string;   // Date string (YYYY-MM-DD)
  page?: number;
  pageSize?: number;
}

export type SalesCollection = PaginatedResponse<Sale>;

/**
 * Sales API functions
 */
export const salesApi = {
  /**
   * Get all sales with optional filtering
   */
  async getSales(params?: SaleQueryParams): Promise<SalesCollection> {
    const queryString = params ? buildQueryString(params) : '';
    return apiClient.get<SalesCollection>(`/sales${queryString}`);
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
  async updateSale(id: number, data: UpdateSaleRequest): Promise<void> {
    return apiClient.put<void>(`/sales/${id}`, data);
  },

  /**
   * Complete a sale
   */
  async completeSale(id: number): Promise<void> {
    return apiClient.patch<void>(`/sales/${id}/complete`);
  },

  /**
   * Cancel a sale
   */
  async cancelSale(id: number): Promise<void> {
    return apiClient.patch<void>(`/sales/${id}/cancel`);
  },

  /**
   * Delete sale by ID
   */
  async deleteSale(id: number): Promise<void> {
    return apiClient.delete(`/sales/${id}`);
  },
};