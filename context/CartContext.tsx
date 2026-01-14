import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './AuthContext';
import { getCart, addToCart, updateCartItem, removeFromCart, createOrder } from '@/utils/api';

// Types
interface ProductVariant {
  id: number;
  name: string;
  price: number;
  image?: string;
  sku?: string;
}

interface CartItem {
  id: number;
  product_id: number;
  variant_id?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: ProductVariant;
  stock?: number;
}

interface Cart {
  id?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon_code?: string;
  coupon_discount?: number;
}

interface ShippingAddress {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  area: 'IN' | 'OUT'; // Inside or Outside Dhaka
  postal_code?: string;
}

interface OrderData {
  shipping_address: ShippingAddress;
  payment_method: 'COD' | 'OP'; // Cash on Delivery or Online Payment
  notes?: string;
}

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  itemCount: number;
  addItem: (product: any, quantity?: number, variant?: any) => Promise<boolean>;
  updateQuantity: (itemId: number, quantity: number) => Promise<boolean>;
  removeItem: (itemId: number) => Promise<boolean>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  checkout: (orderData: OrderData) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  refreshCart: () => Promise<void>;
  setShippingArea: (area: 'IN' | 'OUT') => void;
  shippingArea: 'IN' | 'OUT';
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Storage Keys
const CART_KEY = 'shopping_cart';
const CART_ID_KEY = 'cart_id';

// Shipping rates
const SHIPPING_RATES = {
  IN: 60,  // Inside Dhaka
  OUT: 120, // Outside Dhaka
};

// Provider Component
export function CartProvider({ children }: { children: ReactNode }) {
  const { tokens, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    discount: 0,
    shipping: SHIPPING_RATES.IN,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [shippingArea, setShippingAreaState] = useState<'IN' | 'OUT'>('IN');

  // Calculate totals
  const calculateTotals = (items: CartItem[], discount: number = 0, couponDiscount: number = 0): Cart => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = items.length > 0 ? SHIPPING_RATES[shippingArea] : 0;
    const totalDiscount = discount + couponDiscount;
    const total = Math.max(0, subtotal - totalDiscount + shipping);

    return {
      ...cart,
      items,
      subtotal,
      discount: totalDiscount,
      shipping,
      total,
    };
  };

  // Load cart on mount and auth change
  useEffect(() => {
    loadCart();
  }, [isAuthenticated, tokens]);

  const loadCart = async () => {
    try {
      setIsLoading(true);

      if (isAuthenticated && tokens?.access) {
        // Fetch cart from server
        const serverCart = await getCart(tokens.access);
        if (serverCart && serverCart.items) {
          const newCart = calculateTotals(serverCart.items, 0, serverCart.coupon_discount || 0);
          newCart.id = serverCart.id;
          newCart.coupon_code = serverCart.coupon_code;
          newCart.coupon_discount = serverCart.coupon_discount;
          setCart(newCart);
        }
      } else {
        // Load from local storage for guests
        const storedCart = await SecureStore.getItemAsync(CART_KEY);
        if (storedCart) {
          const parsed = JSON.parse(storedCart);
          setCart(calculateTotals(parsed.items || [], 0, 0));
        }
      }
    } catch (error) {
      console.error('Load cart error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLocalCart = async (items: CartItem[]) => {
    const newCart = calculateTotals(items);
    await SecureStore.setItemAsync(CART_KEY, JSON.stringify(newCart));
  };

  const addItem = async (product: any, quantity: number = 1, variant?: any): Promise<boolean> => {
    try {
      setIsLoading(true);

      const newItem: CartItem = {
        id: Date.now(), // Temporary ID for local cart
        product_id: product.id,
        variant_id: variant?.id,
        name: product.name || product.title,
        price: variant?.price || product.price || product.variants?.[0]?.price || 0,
        quantity,
        image: product.image || product.images?.[0]?.image || product.feature_image,
        variant,
        stock: variant?.stock || product.stock,
      };

      if (isAuthenticated && tokens?.access) {
        // Add to server cart
        const response = await addToCart(product.id, quantity, tokens.access);
        if (response) {
          await loadCart(); // Refresh cart from server
          return true;
        }
        return false;
      } else {
        // Add to local cart
        const existingIndex = cart.items.findIndex(
          item => item.product_id === product.id && item.variant_id === variant?.id
        );

        let updatedItems: CartItem[];
        if (existingIndex >= 0) {
          updatedItems = cart.items.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedItems = [...cart.items, newItem];
        }

        const newCart = calculateTotals(updatedItems);
        setCart(newCart);
        await saveLocalCart(updatedItems);
        return true;
      }
    } catch (error) {
      console.error('Add item error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number): Promise<boolean> => {
    try {
      if (quantity < 1) return false;

      setIsLoading(true);

      if (isAuthenticated && tokens?.access) {
        const response = await updateCartItem(itemId, quantity, tokens.access);
        if (response) {
          await loadCart();
          return true;
        }
        return false;
      } else {
        const updatedItems = cart.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        const newCart = calculateTotals(updatedItems);
        setCart(newCart);
        await saveLocalCart(updatedItems);
        return true;
      }
    } catch (error) {
      console.error('Update quantity error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: number): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (isAuthenticated && tokens?.access) {
        const success = await removeFromCart(itemId, tokens.access);
        if (success) {
          await loadCart();
          return true;
        }
        return false;
      } else {
        const updatedItems = cart.items.filter(item => item.id !== itemId);
        const newCart = calculateTotals(updatedItems);
        setCart(newCart);
        await saveLocalCart(updatedItems);
        return true;
      }
    } catch (error) {
      console.error('Remove item error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);

      if (isAuthenticated && tokens?.access) {
        // Remove all items from server cart
        for (const item of cart.items) {
          await removeFromCart(item.id, tokens.access);
        }
      }

      setCart({
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0,
      });
      await SecureStore.deleteItemAsync(CART_KEY);
    } catch (error) {
      console.error('Clear cart error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; error?: string }> => {
    // This would typically call an API to validate the coupon
    // For now, we'll just store it
    try {
      setCart(prev => ({
        ...prev,
        coupon_code: code,
        coupon_discount: 0, // Would be calculated by server
      }));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const removeCoupon = () => {
    setCart(prev => ({
      ...prev,
      coupon_code: undefined,
      coupon_discount: 0,
      total: prev.subtotal - prev.discount + prev.shipping,
    }));
  };

  const setShippingArea = (area: 'IN' | 'OUT') => {
    setShippingAreaState(area);
    const newShipping = cart.items.length > 0 ? SHIPPING_RATES[area] : 0;
    setCart(prev => ({
      ...prev,
      shipping: newShipping,
      total: prev.subtotal - prev.discount + newShipping,
    }));
  };

  const checkout = async (orderData: OrderData): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    try {
      setIsLoading(true);

      if (cart.items.length === 0) {
        return { success: false, error: 'Cart is empty' };
      }

      const orderPayload = {
        items: cart.items.map(item => ({
          product: item.product_id,
          variant: item.variant_id,
          quantity: item.quantity,
        })),
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method,
        shipping_area: shippingArea,
        notes: orderData.notes,
        subtotal: cart.subtotal,
        shipping_cost: cart.shipping,
        discount: cart.discount,
        total: cart.total,
        coupon_code: cart.coupon_code,
      };

      if (isAuthenticated && tokens?.access) {
        const response = await createOrder(orderPayload, tokens.access);
        if (response && response.id) {
          await clearCart();
          return { success: true, orderId: response.id.toString() };
        }
        return { success: false, error: 'Failed to create order' };
      } else {
        // Guest checkout - would need different API endpoint
        const response = await createOrder({
          ...orderPayload,
          guest_email: orderData.shipping_address.email,
          guest_phone: orderData.shipping_address.phone,
          guest_name: orderData.shipping_address.name,
        }, '');

        if (response && response.id) {
          await clearCart();
          return { success: true, orderId: response.id.toString() };
        }
        return { success: false, error: 'Failed to create order' };
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      return { success: false, error: error.message || 'Checkout failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async () => {
    await loadCart();
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        checkout,
        refreshCart,
        setShippingArea,
        shippingArea,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom Hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
