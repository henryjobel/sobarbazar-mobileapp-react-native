// Export all contexts
export { AuthProvider, useAuth } from './AuthContext';
export { CartProvider, useCart } from './CartContext';
export { WishlistProvider, useWishlist } from './WishlistContext';
export { CartNotificationProvider, useCartNotification } from './CartNotificationContext';

// Combined Provider Component
import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { CartNotificationProvider } from './CartNotificationContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CartNotificationProvider>
            {children}
          </CartNotificationProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default AppProviders;
