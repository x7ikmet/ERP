import { apiClient, type QueryParams, buildQueryString } from './client';

/**
 * Supplier types
 */
export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  isActive?: boolean;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

export interface SupplierQueryParams extends QueryParams {
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Suppliers API functions
 */
export const suppliersApi = {
  /**
   * Get all suppliers with optional filtering
   */
  async getSuppliers(params?: SupplierQueryParams): Promise<Supplier[]> {
    const queryString = params ? buildQueryString(params) : '';
    return apiClient.get<Supplier[]>(`/suppliers${queryString}`);
  },

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: number): Promise<Supplier> {
    return apiClient.get<Supplier>(`/suppliers/${id}`);
  },

  /**
   * Create a new supplier
   */
  async createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
    return apiClient.post<Supplier>('/suppliers', data);
  },

  /**
   * Update supplier by ID
   */
  async updateSupplier(id: number, data: UpdateSupplierRequest): Promise<Supplier> {
    return apiClient.put<Supplier>(`/suppliers/${id}`, data);
  },

  /**
   * Toggle supplier active status
   */
  async toggleSupplierStatus(id: number): Promise<Supplier> {
    return apiClient.patch<Supplier>(`/suppliers/${id}/toggle-status`);
  },

  /**
   * Delete supplier by ID
   */
  async deleteSupplier(id: number): Promise<void> {
    return apiClient.delete(`/suppliers/${id}`);
  },
};