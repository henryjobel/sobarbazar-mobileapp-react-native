/**
 * Products API Service
 * Example of using the new API client for product-related endpoints
 */

import { apiClient } from './client';

export interface ProductVariant {
  id: number;
  name: string;
  sku?: string;
  price: number;
  final_price: number;
  stock: number;
  available_stock: number;
  discount?: {
    name: string;
    type: string;
    value: number;
    is_percentage: boolean;
  };
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  default_variant?: ProductVariant;
  variants?: ProductVariant[];
  images?: string[];
  category?: string;
  brand?: string;
}

export interface ProductsResponse {
  results: Product[];
  count: number;
  pages: number;
}

export interface ProductFilters {
  page?: number;
  page_size?: number;
  category?: string;
  search?: string;
  brand?: string;
  store?: string;
}

/**
 * Get products with filters and pagination
 */
export async function getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  const {
    page = 1,
    page_size = 20,
    category,
    search,
    brand,
    store,
  } = filters;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', page_size.toString());

  if (category) params.append('supplier_product__subcategories__category', category);
  if (search) params.append('search', search);
  if (brand) params.append('supplier_product__brand_or_company', brand);
  if (store) params.append('supplier_product__store', store);

  const response = await apiClient.get<any>(
    `/api/v1.0/customers/products/?${params.toString()}`,
    { timeout: 15000 } // 15 second timeout for product lists
  );

  if (!response.success || !response.data) {
    return { results: [], count: 0, pages: 0 };
  }

  // Handle paginated response
  const results = response.data.results || response.data || [];
  const count = response.data.count || results.length;
  const pages = Math.ceil(count / page_size);

  return { results, count, pages };
}

/**
 * Get single product by ID
 */
export async function getProductById(id: number | string): Promise<Product | null> {
  const response = await apiClient.get<Product>(
    `/api/v1.0/customers/products/${id}/`,
    { timeout: 10000 }
  );

  return response.success ? response.data || null : null;
}

/**
 * Search products
 */
export async function searchProducts(
  query: string,
  page = 1,
  page_size = 20
): Promise<ProductsResponse> {
  return getProducts({ search: query, page, page_size });
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  categoryId: string,
  page = 1,
  page_size = 20
): Promise<ProductsResponse> {
  return getProducts({ category: categoryId, page, page_size });
}

/**
 * Get products with discounts (flash deals)
 */
export async function getFlashDeals(): Promise<Product[]> {
  const response = await getProducts({ page_size: 50 });

  // Filter products with discounts
  return response.results.filter(product => {
    const variant = product.default_variant;
    if (!variant) return false;

    // Has discount object
    if (variant.discount) return true;

    // Final price is less than original price
    if (variant.final_price && variant.price && variant.final_price < variant.price) {
      return true;
    }

    return false;
  });
}
