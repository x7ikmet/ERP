import { apiClient, type QueryParams, buildQueryString } from './client';

/**
 * Customer types
 */
export interface Customer {
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

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  isActive?: boolean;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

export interface CustomerQueryParams extends QueryParams {
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Customers API functions
 */
export const customersApi = {
  /**
   * Get all customers with optional filtering
   */
  async getCustomers(params?: CustomerQueryParams): Promise<Customer[]> {
    const queryString = params ? buildQueryString(params) : '';
    return apiClient.get<Customer[]>(`/customers${queryString}`);
  },

  /**
   * Get customer by ID
   */
  async getCustomerById(id: number): Promise<Customer> {
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  /**
   * Create a new customer
   */
  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    return apiClient.post<Customer>('/customers', data);
  },

  /**
   * Update customer by ID
   */
  async updateCustomer(id: number, data: UpdateCustomerRequest): Promise<Customer> {
    return apiClient.put<Customer>(`/customers/${id}`, data);
  },

  /**
   * Toggle customer active status
   */
  async toggleCustomerStatus(id: number): Promise<Customer> {
    return apiClient.patch<Customer>(`/customers/${id}/toggle-status`);
  },

  /**
   * Delete customer by ID
   */
  async deleteCustomer(id: number): Promise<void> {
    return apiClient.delete(`/customers/${id}`);
  },
};