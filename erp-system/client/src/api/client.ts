/**
 * Base API client with interceptors and error handling
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5001/api';

/**
 * HTTP client with automatic token handling and interceptors
 */
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private getAuthHeaders(): Record<string, string> {
    // Try to get token from secure storage
    let token: string | null = null;
    
    if (typeof window !== 'undefined') {
      // Try localStorage first, then cookies
      token = localStorage.getItem('accessToken');
      
      if (!token) {
        // Fallback to cookie - simple implementation to avoid async in sync method
        const cookies = document.cookie.split(';');
        const accessTokenCookie = cookies.find(cookie => 
          cookie.trim().startsWith('accessToken=')
        );
        if (accessTokenCookie) {
          token = accessTokenCookie.split('=')[1];
        }
      }
    }
    
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    // Handle different content types
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text() as T;
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails: Record<string, unknown> | null = null;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.title || errorData.detail || errorMessage;
      errorDetails = errorData;
    } catch {
      // Keep default error message if JSON parsing fails
    }

    // Handle specific status codes
    switch (response.status) {
      case 0:
        throw new ApiError('Network error. Please check if the API server is running and CORS is configured.', 'NETWORK_ERROR', errorDetails);
      
      case 401:
        // Token expired or invalid
        // Don't auto-redirect on login attempts - let the component handle it
        const isLoginAttempt = response.url.includes('/api/auth/login');
        if (typeof window !== 'undefined' && !isLoginAttempt) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000); // Delay redirect to allow error message to be seen
        }
        throw new ApiError(
          isLoginAttempt 
            ? 'Invalid email or password. Please check your credentials.' 
            : 'Authentication failed. Please log in again.', 
          'AUTH_FAILED', 
          { ...errorDetails, status: 401 }
        );
      
      case 403:
        throw new ApiError('You do not have permission to perform this action.', 'FORBIDDEN', errorDetails);
      
      case 404:
        throw new ApiError('The requested resource was not found.', 'NOT_FOUND', errorDetails);
      
      case 422:
        throw new ApiError('Validation failed. Please check your input.', 'VALIDATION_ERROR', errorDetails);
      
      case 500:
        throw new ApiError('An internal server error occurred. Please try again later.', 'SERVER_ERROR', errorDetails);
      
      default:
        throw new ApiError(errorMessage, 'UNKNOWN_ERROR', errorDetails);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      // Handle network errors (CORS, connection refused, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          `Failed to connect to API server at ${this.baseURL}. Please check if the server is running and CORS is properly configured.`,
          'NETWORK_ERROR',
          { originalError: error.message, url }
        );
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public code: string;
  public details: Record<string, unknown> | null;
  public status?: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details?: Record<string, unknown> | null, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details ?? null;
    this.status = status;
  }
}

// Default API client instance
export const apiClient = new ApiClient();

/**
 * Common API response types
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}