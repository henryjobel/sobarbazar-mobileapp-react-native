import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './AuthContext';
import { getFavorites, addToFavorites, removeFromFavorites } from '@/utils/api';

// Types
interface WishlistItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  original_price?: number;
  image?: string;
  rating?: number;
  discount?: number;
  in_stock?: boolean;
}

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  itemCount: number;
  addToWishlist: (product: any) => Promise<boolean>;
  removeFromWishlist: (itemId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: any) => Promise<boolean>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

// Create Context
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Storage Key
const WISHLIST_KEY = 'user_wishlist';

// Provider Component
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { tokens, isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load wishlist on mount and auth change
  useEffect(() => {
    loadWishlist();
  }, [isAuthenticated, tokens]);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);

      if (isAuthenticated && tokens?.access) {
        // Fetch from server
        const serverWishlist = await getFavorites(tokens.access);
        if (serverWishlist && Array.isArray(serverWishlist)) {
          const formattedItems = serverWishlist.map((item: any) => ({
            id: item.id,
            product_id: item.product?.id || item.product_id,
            name: item.product?.name || item.name,
            price: item.product?.price || item.price,
            original_price: item.product?.original_price,
            image: item.product?.image || item.product?.feature_image || item.image,
            rating: item.product?.rating,
            discount: item.product?.discount,
            in_stock: item.product?.in_stock !== false,
          }));
          setItems(formattedItems);
        }
      } else {
        // Load from local storage for guests
        const storedWishlist = await SecureStore.getItemAsync(WISHLIST_KEY);
        if (storedWishlist) {
          setItems(JSON.parse(storedWishlist));
        }
      }
    } catch (error) {
      console.error('Load wishlist error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLocalWishlist = async (wishlistItems: WishlistItem[]) => {
    await SecureStore.setItemAsync(WISHLIST_KEY, JSON.stringify(wishlistItems));
  };

  const addToWishlist = async (product: any): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Check if already in wishlist
      if (isInWishlist(product.id)) {
        return true;
      }

      const newItem: WishlistItem = {
        id: Date.now(), // Temporary ID for local
        product_id: product.id,
        name: product.name || product.title,
        price: product.price || product.variants?.[0]?.price || 0,
        original_price: product.original_price,
        image: product.image || product.images?.[0]?.image || product.feature_image,
        rating: product.rating,
        discount: product.discount,
        in_stock: product.in_stock !== false,
      };

      if (isAuthenticated && tokens?.access) {
        const response = await addToFavorites(product.id, tokens.access);
        if (response) {
          await loadWishlist(); // Refresh from server
          return true;
        }
        return false;
      } else {
        const updatedItems = [...items, newItem];
        setItems(updatedItems);
        await saveLocalWishlist(updatedItems);
        return true;
      }
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: number): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (isAuthenticated && tokens?.access) {
        const success = await removeFromFavorites(itemId, tokens.access);
        if (success) {
          await loadWishlist();
          return true;
        }
        return false;
      } else {
        const updatedItems = items.filter(item => item.id !== itemId && item.product_id !== itemId);
        setItems(updatedItems);
        await saveLocalWishlist(updatedItems);
        return true;
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return items.some(item => item.product_id === productId);
  };

  const toggleWishlist = async (product: any): Promise<boolean> => {
    const existingItem = items.find(item => item.product_id === product.id);
    if (existingItem) {
      return removeFromWishlist(existingItem.id);
    } else {
      return addToWishlist(product);
    }
  };

  const clearWishlist = async () => {
    try {
      setIsLoading(true);

      if (isAuthenticated && tokens?.access) {
        for (const item of items) {
          await removeFromFavorites(item.id, tokens.access);
        }
      }

      setItems([]);
      await SecureStore.deleteItemAsync(WISHLIST_KEY);
    } catch (error) {
      console.error('Clear wishlist error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWishlist = async () => {
    await loadWishlist();
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        itemCount: items.length,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// Custom Hook
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export default WishlistContext;
