/**
 * Statistics API service
 * 
 * Handles all dashboard statistics and analytics endpoints
 */

import { apiClient } from './client';

export interface DashboardStatistics {
  totalSales: number;
  totalProducts: number;
  totalCustomers: number;
  activeCustomers: number;
  completedSalesCount: number;
  pendingSalesCount: number;
}

export interface SalesStatistics {
  totalSales: number;
  completedSalesCount: number;
  pendingSalesCount: number;
  cancelledSalesCount: number;
  averageSaleAmount: number;
  lastSaleDate: string | null;
}

export interface ProductStatistics {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
}

export interface CustomerStatistics {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  customersWithSales: number;
  lastCustomerAdded: string | null;
}

export const statisticsApi = {
  /**
   * Get comprehensive dashboard statistics
   */
  getDashboardStatistics: async (): Promise<DashboardStatistics> => {
    return apiClient.get<DashboardStatistics>('/statistics/dashboard');
  },

  /**
   * Get total sales amount
   */
  getTotalSales: async (): Promise<number> => {
    return apiClient.get<number>('/statistics/total-sales');
  },

  /**
   * Get total products count
   */
  getTotalProducts: async (): Promise<number> => {
    return apiClient.get<number>('/statistics/total-products');
  },

  /**
   * Get total customers count
   */
  getTotalCustomers: async (): Promise<number> => {
    return apiClient.get<number>('/statistics/total-customers');
  },

  /**
   * Get detailed sales statistics
   */
  getSalesStatistics: async (): Promise<SalesStatistics> => {
    return apiClient.get<SalesStatistics>('/statistics/sales');
  },

  /**
   * Get detailed product statistics
   */
  getProductStatistics: async (): Promise<ProductStatistics> => {
    return apiClient.get<ProductStatistics>('/statistics/products');
  },

  /**
   * Get detailed customer statistics
   */
  getCustomerStatistics: async (): Promise<CustomerStatistics> => {
    return apiClient.get<CustomerStatistics>('/statistics/customers');
  },
};