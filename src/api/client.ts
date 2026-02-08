/**
 * API Client with Timeout, Retry, and Error Handling
 * Production-ready HTTP client for all API requests
 */

import Constants from 'expo-constants';
import { logger } from '@/utils/logger';

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipErrorLog?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout = 30000; // 30 seconds
  private defaultRetries = 2;

  constructor() {
    this.baseURL = Constants.expoConfig?.extra?.apiUrl || 'https://api.hetdcl.com';
    logger.info(`API Client initialized with base URL: ${this.baseURL}`);
  }

  /**
   * Create AbortController with timeout
   */
  private createTimeoutSignal(timeout: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller.signal;
  }

  /**
   * Fetch with retry logic and exponential backoff
   */
  private async fetchWithRetry(
    url: string,
    config: RequestConfig,
    attempt = 1
  ): Promise<Response> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      skipErrorLog = false,
      ...init
    } = config;

    try {
      const signal = this.createTimeoutSignal(timeout);
      const response = await fetch(url, { ...init, signal });

      // Retry on 5xx server errors
      if (response.status >= 500 && attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        logger.warn(`Request failed (${response.status}), retrying in ${delay}ms... (attempt ${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, config, attempt + 1);
      }

      return response;
    } catch (error: any) {
      // Handle timeout
      if (error.name === 'AbortError') {
        logger.error(`Request timeout after ${timeout}ms: ${url}`);
        throw new Error('Request timeout. Please check your internet connection.');
      }

      // Retry on network errors (no internet, DNS failure, etc.)
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        logger.warn(`Network error, retrying in ${delay}ms... (attempt ${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, config, attempt + 1);
      }

      // Final retry failed
      if (!skipErrorLog) {
        logger.error(`Request failed after ${retries} retries:`, error.message);
      }
      throw new Error('Network error. Please check your internet connection.');
    }
  }

  /**
   * Unified response normalizer
   * Handles various backend response structures
   */
  private normalizeResponse<T>(data: any): T | null {
    if (!data) return null;

    // Structure 1: {success: true, data: {...}}
    if (data.success && data.data !== undefined) {
      return data.data;
    }

    // Structure 2: {data: {...}}
    if (data.data !== undefined) {
      return data.data;
    }

    // Structure 3: {results: [...]} - DRF pagination
    if (data.results !== undefined) {
      return data;
    }

    // Structure 4: Direct data
    return data;
  }

  /**
   * Extract error message from various error formats
   */
  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error.detail) return error.detail;
    if (error.message) return error.message;
    if (error.error) return error.error;

    // Handle array of errors
    if (error.non_field_errors) {
      return Array.isArray(error.non_field_errors)
        ? error.non_field_errors[0]
        : error.non_field_errors;
    }

    // Handle field-specific errors
    for (const key of ['email', 'password', 'username', 'phone']) {
      if (error[key]) {
        return Array.isArray(error[key]) ? error[key][0] : error[key];
      }
    }

    return 'An unexpected error occurred';
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      logger.api('GET', endpoint);

      const response = await this.fetchWithRetry(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        ...config,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = this.extractErrorMessage(errorData);
        logger.error(`GET ${endpoint} failed:`, response.status, errorMessage);

        return {
          success: false,
          error: errorMessage,
          status: response.status,
        };
      }

      const json = await response.json();
      const data = this.normalizeResponse<T>(json);

      return {
        success: true,
        data: data || undefined,
        status: response.status,
      };
    } catch (error: any) {
      logger.error(`GET ${endpoint} error:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      logger.api('POST', endpoint);

      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        ...config,
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = this.extractErrorMessage(json);
        logger.error(`POST ${endpoint} failed:`, response.status, errorMessage);

        return {
          success: false,
          error: errorMessage,
          status: response.status,
        };
      }

      const data = this.normalizeResponse<T>(json);

      return {
        success: true,
        data: data || undefined,
        status: response.status,
      };
    } catch (error: any) {
      logger.error(`POST ${endpoint} error:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      logger.api('PATCH', endpoint);

      const response = await this.fetchWithRetry(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        ...config,
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = this.extractErrorMessage(json);
        logger.error(`PATCH ${endpoint} failed:`, response.status, errorMessage);

        return {
          success: false,
          error: errorMessage,
          status: response.status,
        };
      }

      const data = this.normalizeResponse<T>(json);

      return {
        success: true,
        data: data || undefined,
        status: response.status,
      };
    } catch (error: any) {
      logger.error(`PATCH ${endpoint} error:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      logger.api('DELETE', endpoint);

      const response = await this.fetchWithRetry(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        ...config,
      });

      // DELETE often returns 204 No Content
      if (response.status === 204) {
        return {
          success: true,
          status: response.status,
        };
      }

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = this.extractErrorMessage(json);
        logger.error(`DELETE ${endpoint} failed:`, response.status, errorMessage);

        return {
          success: false,
          error: errorMessage,
          status: response.status,
        };
      }

      const data = this.normalizeResponse<T>(json);

      return {
        success: true,
        data: data || undefined,
        status: response.status,
      };
    } catch (error: any) {
      logger.error(`DELETE ${endpoint} error:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Add authorization header
   */
  withAuth(token: string, useJWT = false): RequestConfig {
    return {
      headers: {
        Authorization: useJWT ? `JWT ${token}` : `Bearer ${token}`,
      },
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { RequestConfig, ApiResponse };
