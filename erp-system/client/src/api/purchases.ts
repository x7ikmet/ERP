import { apiClient, type QueryParams, type PaginatedResponse, buildQueryString } from './client';

/**
 * Purchase types matching backend structure
 */
export interface PurchaseItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface Purchase {
  id: number;
  supplierId?: number;
  supplierName?: string;
  purchaseNo: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
  items: PurchaseItem[];
}

export interface CreatePurchaseItemRequest {
  productId: number;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseRequest {
  supplierId?: number;
  items: CreatePurchaseItemRequest[];
}

export interface UpdatePurchaseItemRequest {
  id?: number;
  productId: number;
  quantity: number;
  unitCost: number;
}

export interface UpdatePurchaseRequest {
  supplierId?: number;
  status?: string;
  items: UpdatePurchaseItemRequest[];
}

export interface PurchaseQueryParams extends QueryParams {
  status?: string;
  supplierId?: number;
  search?: string;
  fromDate?: string; // Date string (YYYY-MM-DD)
  toDate?: string;   // Date string (YYYY-MM-DD)
  page?: number;
  pageSize?: number;
}

export type PurchasesCollection = PaginatedResponse<Purchase>;

/**
 * Purchases API functions
 */
export const purchasesApi = {
  /**
   * Get all purchases with optional filtering
   */
  async getPurchases(params?: PurchaseQueryParams): Promise<PurchasesCollection> {
    const queryString = params ? buildQueryString(params) : '';
    return apiClient.get<PurchasesCollection>(`/purchases${queryString}`);
  },

  /**
   * Get purchase by ID
   */
  async getPurchaseById(id: number): Promise<Purchase> {
    return apiClient.get<Purchase>(`/purchases/${id}`);
  },

  /**
   * Create a new purchase
   */
  async createPurchase(data: CreatePurchaseRequest): Promise<Purchase> {
    return apiClient.post<Purchase>('/purchases', data);
  },

  /**
   * Update purchase by ID
   */
  async updatePurchase(id: number, data: UpdatePurchaseRequest): Promise<void> {
    return apiClient.put<void>(`/purchases/${id}`, data);
  },

  /**
   * Complete a purchase
   */
  async completePurchase(id: number): Promise<void> {
    return apiClient.patch<void>(`/purchases/${id}/complete`);
  },

  /**
   * Cancel a purchase
   */
  async cancelPurchase(id: number): Promise<void> {
    return apiClient.patch<void>(`/purchases/${id}/cancel`);
  },

  /**
   * Delete purchase by ID
   */
  async deletePurchase(id: number): Promise<void> {
    return apiClient.delete(`/purchases/${id}`);
  },
};