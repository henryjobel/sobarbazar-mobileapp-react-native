/**
 * Environment Configuration with Validation
 * Ensures all required environment variables are present and valid
 */

import Constants from 'expo-constants';

interface AppConfig {
  apiUrl: string;
  authApiUrl: string;
  environment: 'development' | 'staging' | 'production';
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
}

function validateUrl(url: string, name: string): string {
  if (!url) {
    throw new Error(`${name} is required but not defined`);
  }

  try {
    new URL(url);
    return url;
  } catch {
    throw new Error(`${name} is not a valid URL: ${url}`);
  }
}

function loadConfig(): AppConfig {
  const extra = Constants.expoConfig?.extra || {};
  const nodeEnv = process.env.NODE_ENV || 'development';

  const apiUrl = validateUrl(
    extra.apiUrl || process.env.API_URL || 'https://api.hetdcl.com',
    'API_URL'
  );

  const authApiUrl = validateUrl(
    extra.authApiUrl || process.env.AUTH_API_URL || apiUrl,
    'AUTH_API_URL'
  );

  const environment = (nodeEnv === 'production' ? 'production' : 'development') as AppConfig['environment'];
  const isDevelopment = environment === 'development';
  const isProduction = environment === 'production';

  return {
    apiUrl,
    authApiUrl,
    environment,
    enableAnalytics: extra.enableAnalytics ?? isProduction,
    enableErrorReporting: extra.enableErrorReporting ?? isProduction,
    isDevelopment,
    isProduction,
  };
}

// Singleton instance
let config: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!config) {
    try {
      config = loadConfig();
      console.log('✅ Environment configuration loaded successfully');
      console.log('📍 Environment:', config.environment);
      console.log('🌐 API URL:', config.apiUrl);
    } catch (error: any) {
      console.error('❌ Environment configuration error:', error.message);
      throw error;
    }
  }
  return config;
}

// Export config instance for convenience
export const env = getConfig();
