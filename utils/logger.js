/**
 * Production-Ready Logger Utility
 * Conditionally logs based on environment
 * Usage: import { logger } from '@/utils/logger'
 */

// Check if running in development mode
const IS_DEV = __DEV__;

/**
 * Logger utility with environment-aware logging
 * In production, only errors and warnings are logged
 * In development, all logs are shown
 */
export const logger = {
  /**
   * Debug logs - Only in development
   * Use for detailed debugging information
   */
  debug: (...args) => {
    if (IS_DEV) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info logs - Only in development
   * Use for general information
   */
  info: (...args) => {
    if (IS_DEV) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warning logs - Always shown
   * Use for potential issues that don't break functionality
   */
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error logs - Always shown
   * Use for errors and exceptions
   */
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * API logs - Only in development
   * Use for API call logging
   */
  api: (endpoint, ...args) => {
    if (IS_DEV) {
      console.log(`[API] ${endpoint}`, ...args);
    }
  },

  /**
   * Cart operation logs - Only in development
   * Use for cart-related operations
   */
  cart: (...args) => {
    if (IS_DEV) {
      console.log('[CART]', ...args);
    }
  },

  /**
   * Auth logs - Only in development
   * Use for authentication flows
   */
  auth: (...args) => {
    if (IS_DEV) {
      console.log('[AUTH]', ...args);
    }
  },

  /**
   * Navigation logs - Only in development
   * Use for navigation tracking
   */
  nav: (...args) => {
    if (IS_DEV) {
      console.log('[NAV]', ...args);
    }
  },
};

/**
 * Legacy console.log replacement guide:
 *
 * Before: console.log("🛍️ Products URL:", url);
 * After:  logger.api('products', url);
 *
 * Before: console.log("✅ Cart updated");
 * After:  logger.cart('Cart updated');
 *
 * Before: console.error("Error:", error);
 * After:  logger.error('Error:', error);
 *
 * Before: console.log("User logged in");
 * After:  logger.auth('User logged in');
 */

export default logger;
