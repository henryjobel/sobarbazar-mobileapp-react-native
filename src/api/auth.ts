/**
 * Authentication API Service
 * Example of using the new API client for auth endpoints
 */

import { apiClient } from './client';
import Constants from 'expo-constants';

const AUTH_URL = Constants.expoConfig?.extra?.authApiUrl || 'https://api.hetdcl.com';

export interface AuthTokens {
  access: string;
  refresh?: string;
}

export interface User {
  id: number | string;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  name?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  shipping_address?: string;
}

/**
 * Login user and get JWT tokens
 */
export async function login(credentials: LoginCredentials): Promise<AuthTokens | null> {
  const { email, password } = credentials;

  // Try username field first (Django default)
  let response = await apiClient.post<AuthTokens>(
    '/auth/jwt/create/',
    { username: email, password },
    { skipErrorLog: true }
  );

  // If failed, try with email field
  if (!response.success) {
    response = await apiClient.post<AuthTokens>(
      '/auth/jwt/create/',
      { email, password }
    );
  }

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Invalid email or password');
  }

  return response.data;
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<{ user?: User; tokens?: AuthTokens }> {
  const registerPayload = {
    username: data.email, // Use email as username
    password: data.password,
    name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
    email: data.email,
    phone: data.phone || '',
    shipping_address: data.shipping_address || '',
  };

  const response = await apiClient.post<any>(
    '/api/v1.0/customers/register/',
    registerPayload
  );

  if (!response.success) {
    throw new Error(response.error || 'Registration failed');
  }

  // Try auto-login after registration
  try {
    const tokens = await login({ email: data.email, password: data.password });
    return {
      user: response.data,
      tokens: tokens || undefined,
    };
  } catch {
    // Return user data without tokens (manual login required)
    return { user: response.data };
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(refreshToken: string): Promise<AuthTokens | null> {
  const response = await apiClient.post<{ access: string }>(
    '/auth/jwt/refresh/',
    { refresh: refreshToken },
    { skipErrorLog: true }
  );

  if (!response.success || !response.data) {
    return null;
  }

  return {
    access: response.data.access,
    refresh: refreshToken, // Keep the same refresh token
  };
}

/**
 * Get user profile
 */
export async function getUserProfile(token: string): Promise<User | null> {
  // Try multiple endpoints
  const endpoints = [
    '/auth/users/me/',
    '/api/customer/profile/',
    '/api/customer/me/',
  ];

  for (const endpoint of endpoints) {
    const useJWT = endpoint.includes('/auth/users/me/');
    const config = apiClient.withAuth(token, useJWT);

    const response = await apiClient.get<User>(endpoint, {
      ...config,
      skipErrorLog: true, // Don't log errors for fallback attempts
    });

    if (response.success && response.data) {
      return response.data;
    }
  }

  return null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  token: string,
  updates: Partial<User>
): Promise<User | null> {
  const config = apiClient.withAuth(token, true); // Use JWT for auth endpoints

  const response = await apiClient.patch<User>(
    '/auth/users/me/',
    updates,
    config
  );

  return response.success ? response.data || null : null;
}
