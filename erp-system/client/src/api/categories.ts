import { apiClient, type PaginatedResponse, type QueryParams, buildQueryString } from './client';

/**
 * Category types
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CategoryQueryParams extends QueryParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CategoriesCollection {
  items: Category[];
}

/**
 * Categories API functions
 */
export const categoriesApi = {
  /**
   * Get all categories with optional filtering
   */
  async getCategories(params?: CategoryQueryParams): Promise<CategoriesCollection> {
    const queryString = params ? buildQueryString(params) : '';
    return apiClient.get<CategoriesCollection>(`/categories${queryString}`);
  },

  /**
   * Get category by ID
   */
  async getCategoryById(id: number): Promise<Category> {
    return apiClient.get<Category>(`/categories/${id}`);
  },

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    return apiClient.post<Category>('/categories', data);
  },

  /**
   * Update category by ID
   */
  async updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category> {
    return apiClient.put<Category>(`/categories/${id}`, data);
  },

  /**
   * Delete category by ID
   */
  async deleteCategory(id: number): Promise<void> {
    return apiClient.delete(`/categories/${id}`);
  },
};