/**
 * API Services - Central Export
 * Import all API services from here
 */

// Export API client
export { apiClient } from './client';
export type { RequestConfig, ApiResponse } from './client';

// Export Auth API
export * from './auth';

// Export Products API
export * from './products';

// Re-export types for convenience
export type {
  AuthTokens,
  User,
  LoginCredentials,
  RegisterData,
} from './auth';

export type {
  Product,
  ProductVariant,
  ProductsResponse,
  ProductFilters,
} from './products';
