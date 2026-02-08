import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  createCart,
  getCart,
  getOrCreateCart,
  addToCart as apiAddToCart,
  getCartItems,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  createOrder as apiCreateOrder,
} from '@/utils/api';
import { getUserData } from '@/hooks/useUser';
import GuestCheckoutModal from '@/components/ui/GuestCheckoutModal';

// Types matching backend structure
interface ProductVariant {
  id: number;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  available_stock: number;
  is_default: boolean;
  final_price: number;
  discount?: {
    name: string;
    type: string;
    value: number;
    is_percentage: boolean;
  };
  attributes?: string;
  image?: string;
}

interface CartItemVariant {
  id: number;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  available_stock: number;
  is_default: boolean;
  final_price: number;
  discount?: any;
  attributes?: string;
  image?: string;
}

interface CartItem {
  id: number; // Cart item ID from backend
  variant: CartItemVariant;
  quantity: number;
  total_price: number;
  discounted_price: number;
  // Additional fields for UI
  product_id?: number;
  product_name?: string;
  product_image?: string;
}

interface Cart {
  id: string; // UUID from backend
  items: CartItem[];
  total_amount: number;
  coupon_discount: number;
  discounted_price: number;
  discount: number;
  subtotal: number;
  delivery_charge_inside_dhaka: number;
  delivery_charge_outside_dhaka: number;
}

interface ShippingAddress {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  area: 'IN' | 'OUT'; // Inside or Outside Dhaka
  postal_code?: string;
}

interface OrderData {
  shipping_address: ShippingAddress;
  payment_method: 'COD' | 'OP';
  notes?: string;
}

interface CartContextType {
  cart: Cart | null;
  cartId: string | null;
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  total: number;
  deliveryCharge: number;
  shippingArea: 'IN' | 'OUT';
  addItem: (product: any, quantity?: number, variant?: any) => Promise<boolean>;
  updateQuantity: (itemId: number, quantity: number) => Promise<boolean>;
  removeItem: (itemId: number) => Promise<boolean>;
  clearCart: () => Promise<void>;
  checkout: (orderData: OrderData) => Promise<{ success: boolean; orderId?: string; payment_url?: string; error?: string }>;
  refreshCart: () => Promise<void>;
  setShippingArea: (area: 'IN' | 'OUT') => void;
  initializeCart: () => Promise<void>;
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Storage Keys
const CART_ID_KEY = 'cart_id';
const GUEST_MODE_KEY = 'guest_mode';

// Provider Component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shippingArea, setShippingAreaState] = useState<'IN' | 'OUT'>('IN');
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [pendingAddItem, setPendingAddItem] = useState<{
    product: any;
    quantity: number;
    variant?: any;
  } | null>(null);

  // Calculate derived values
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cart?.subtotal || cart?.total_amount || 0;
  const deliveryCharge = shippingArea === 'IN'
    ? (cart?.delivery_charge_inside_dhaka || 60)
    : (cart?.delivery_charge_outside_dhaka || 120);
  const total = subtotal - (cart?.coupon_discount || 0) + deliveryCharge;

  // Initialize cart on mount
  useEffect(() => {
    initializeCart();
    loadGuestMode();
  }, []);

  const loadGuestMode = async () => {
    try {
      const guestMode = await SecureStore.getItemAsync(GUEST_MODE_KEY);
      setIsGuestMode(guestMode === 'true');
    } catch (error) {
      console.error('Error loading guest mode:', error);
    }
  };

  const initializeCart = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🛒 CartContext: Initializing cart...');

      // Check for stored cart ID
      const storedCartId = await SecureStore.getItemAsync(CART_ID_KEY);

      if (storedCartId) {
        console.log('🛒 CartContext: Found stored cart ID:', storedCartId);
        // Try to fetch the existing cart
        const existingCart = await getCart(storedCartId);

        if (existingCart && existingCart.id) {
          console.log('✅ CartContext: Loaded existing cart with', existingCart.items?.length || 0, 'items');
          setCart(existingCart);
          setCartId(existingCart.id);
          return;
        }
      }

      // No valid stored cart, create or get a new one
      console.log('🛒 CartContext: Getting or creating new cart...');
      const newCart = await getOrCreateCart();

      if (newCart && newCart.id) {
        console.log('✅ CartContext: Got cart:', newCart.id);
        await SecureStore.setItemAsync(CART_ID_KEY, newCart.id);
        setCart(newCart);
        setCartId(newCart.id);
      } else {
        console.log('⚠️ CartContext: Could not get/create cart');
      }
    } catch (error) {
      console.error('❌ CartContext: Initialize error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!cartId) {
      await initializeCart();
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 CartContext: Refreshing cart:', cartId);

      const updatedCart = await getCart(cartId);

      if (updatedCart && updatedCart.id) {
        console.log('✅ CartContext: Cart refreshed with', updatedCart.items?.length || 0, 'items');
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('❌ CartContext: Refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cartId, initializeCart]);

  const addItem = useCallback(async (product: any, quantity: number = 1, variant?: any): Promise<boolean> => {
    // Check if user is authenticated or in guest mode
    const user = await getUserData();
    if (!user && !isGuestMode) {
      console.log('🔒 CartContext: User not authenticated, showing guest modal...');
      setPendingAddItem({ product, quantity, variant });
      setShowGuestModal(true);
      return false;
    }

    try {
      setIsLoading(true);
      console.log('➕ CartContext: Adding item to cart...');

      // Ensure we have a cart
      let currentCartId = cartId;
      if (!currentCartId) {
        console.log('🛒 CartContext: No cart, creating one...');
        const newCart = await getOrCreateCart();
        if (newCart && newCart.id) {
          await SecureStore.setItemAsync(CART_ID_KEY, newCart.id);
          setCart(newCart);
          setCartId(newCart.id);
          currentCartId = newCart.id;
        } else {
          console.error('❌ CartContext: Failed to create cart');
          return false;
        }
      }

      // Get the variant ID
      // Backend requires variant_id, not product_id
      let variantId: number;

      if (variant && variant.id) {
        variantId = variant.id;
      } else if (product.default_variant && product.default_variant.id) {
        variantId = product.default_variant.id;
      } else if (product.variants && product.variants.length > 0 && product.variants[0].id) {
        variantId = product.variants[0].id;
      } else if (product.variant_id) {
        variantId = product.variant_id;
      } else {
        console.error('❌ CartContext: No variant ID found for product:', product.name || product.id);
        // If no variant, we can't add to cart with this backend
        return false;
      }

      console.log('➕ CartContext: Adding variant', variantId, 'to cart', currentCartId);

      const result = await apiAddToCart(currentCartId, variantId, quantity);

      if (result.success) {
        console.log('✅ CartContext: Item added successfully');
        await refreshCart();
        return true;
      } else {
        console.error('❌ CartContext: Failed to add item:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ CartContext: Add item error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [cartId, refreshCart, isGuestMode]);

  const updateQuantity = useCallback(async (itemId: number, quantity: number): Promise<boolean> => {
    if (!cartId || quantity < 1) return false;

    try {
      setIsLoading(true);
      console.log('✏️ CartContext: Updating item', itemId, 'quantity to', quantity);

      const result = await apiUpdateCartItem(cartId, itemId, quantity);

      if (result.success) {
        console.log('✅ CartContext: Quantity updated');
        await refreshCart();
        return true;
      } else {
        console.error('❌ CartContext: Failed to update quantity:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ CartContext: Update quantity error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [cartId, refreshCart]);

  const removeItem = useCallback(async (itemId: number): Promise<boolean> => {
    if (!cartId) return false;

    try {
      setIsLoading(true);
      console.log('🗑️ CartContext: Removing item', itemId);

      const result = await apiRemoveFromCart(cartId, itemId);

      if (result.success) {
        console.log('✅ CartContext: Item removed');
        await refreshCart();
        return true;
      } else {
        console.error('❌ CartContext: Failed to remove item:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ CartContext: Remove item error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [cartId, refreshCart]);

  const clearCartItems = useCallback(async () => {
    if (!cartId) return;

    try {
      setIsLoading(true);
      console.log('🗑️ CartContext: Clearing cart');

      await apiClearCart(cartId);

      // Create a new cart after clearing
      const newCart = await createCart();
      if (newCart && newCart.id) {
        await SecureStore.setItemAsync(CART_ID_KEY, newCart.id);
        setCart(newCart);
        setCartId(newCart.id);
      }
    } catch (error) {
      console.error('❌ CartContext: Clear cart error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  const setShippingArea = useCallback((area: 'IN' | 'OUT') => {
    setShippingAreaState(area);
  }, []);

  const checkout = useCallback(async (orderData: OrderData): Promise<{ success: boolean; orderId?: string; payment_url?: string; error?: string }> => {
    if (!cartId) {
      return { success: false, error: 'No cart found' };
    }

    if (!cart?.items || cart.items.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    try {
      setIsLoading(true);
      console.log('📦 CartContext: Creating order...');

      // Get user authentication token
      const token = await SecureStore.getItemAsync('access_token');
      const isAuthenticated = !!token;

      // Build order payload based on authentication status
      const orderPayload: any = {
        cart_id: cartId,
        payment_method: orderData.payment_method,
        area: orderData.shipping_address.area,
      };

      // For guest users, add all required fields
      if (!isAuthenticated) {
        orderPayload.name = orderData.shipping_address.name;
        orderPayload.email = orderData.shipping_address.email;
        orderPayload.phone = orderData.shipping_address.phone;
        orderPayload.shipping_address = orderData.shipping_address.address;
      } else {
        // For authenticated users, only add shipping_address if provided
        if (orderData.shipping_address.address) {
          orderPayload.shipping_address = orderData.shipping_address.address;
        }
      }

      console.log('📦 CartContext: Order payload:', orderPayload);
      console.log('📦 CartContext: Is authenticated:', isAuthenticated);

      const result = await apiCreateOrder(orderPayload, token);

      if (result.success) {
        console.log('✅ CartContext: Order created successfully');

        // If online payment, return payment URL
        if (result.payment_url) {
          return {
            success: true,
            payment_url: result.payment_url,
          };
        }

        // COD order - clear cart and return order ID
        const orderId = result.order_id?.toString() || result.order?.id?.toString();

        // Create new cart after successful order
        const newCart = await createCart();
        if (newCart && newCart.id) {
          await SecureStore.setItemAsync(CART_ID_KEY, newCart.id);
          setCart(newCart);
          setCartId(newCart.id);
        }

        return { success: true, orderId };
      } else {
        console.error('❌ CartContext: Order failed:', result.error);
        return { success: false, error: result.error || 'Failed to create order' };
      }
    } catch (error: any) {
      console.error('❌ CartContext: Checkout error:', error);
      return { success: false, error: error.message || 'Checkout failed' };
    } finally {
      setIsLoading(false);
    }
  }, [cartId, cart]);

  const handleContinueAsGuest = useCallback(async () => {
    // Set guest mode
    await SecureStore.setItemAsync(GUEST_MODE_KEY, 'true');
    setIsGuestMode(true);
    setShowGuestModal(false);

    // Process pending item if exists
    if (pendingAddItem) {
      const { product, quantity, variant } = pendingAddItem;
      setPendingAddItem(null);
      // Recursively call addItem, but now guest mode is enabled
      await addItem(product, quantity, variant);
    }
  }, [pendingAddItem, addItem]);

  const handleCloseModal = useCallback(() => {
    setShowGuestModal(false);
    setPendingAddItem(null);
  }, []);

  const handleLogin = useCallback(() => {
    // Simply close the modal
    // User should navigate to Profile tab and tap Login manually
    // This avoids navigation context issues since modal is outside nav tree
    console.log('💡 Please go to Profile tab to login');
    // Clear pending item since user chose to login instead
    setPendingAddItem(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        isLoading,
        itemCount,
        subtotal,
        total,
        deliveryCharge,
        shippingArea,
        addItem,
        updateQuantity,
        removeItem,
        clearCart: clearCartItems,
        checkout,
        refreshCart,
        setShippingArea,
        initializeCart,
      }}
    >
      {children}
      <GuestCheckoutModal
        visible={showGuestModal}
        onContinueAsGuest={handleContinueAsGuest}
        onLogin={handleLogin}
        onClose={handleCloseModal}
      />
    </CartContext.Provider>
  );
}

// Custom Hook
export function useCart() {
  const context = useContext(CartContext);

  // Return a safe fallback if context is not available
  // This prevents errors when component is used outside provider
  if (context === undefined) {
    console.warn('useCart: Context not available, using fallback');
    return {
      cart: null,
      cartId: null,
      isLoading: false,
      itemCount: 0,
      subtotal: 0,
      total: 0,
      deliveryCharge: 60,
      shippingArea: 'IN' as const,
      addItem: async () => false,
      updateQuantity: async () => false,
      removeItem: async () => false,
      clearCart: async () => {},
      checkout: async () => ({ success: false, error: 'Context not available' }),
      refreshCart: async () => {},
      setShippingArea: () => {},
      initializeCart: async () => {},
    };
  }
  return context;
}

export default CartContext;
