import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

interface Product {
  name: string;
  price: number;
  image?: string;
}

interface CartNotificationContextType {
  showNotification: (product: Product, itemCount: number) => void;
  hideNotification: () => void;
  setNavigateToCart: (navigate: () => void) => void;
}

const CartNotificationContext = createContext<CartNotificationContextType | undefined>(undefined);

export function CartNotificationProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const [slideAnim] = useState(new Animated.Value(-200));
  const [opacityAnim] = useState(new Animated.Value(0));
  const navigateToCartRef = useRef<(() => void) | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setNavigateToCart = useCallback((navigate: () => void) => {
    navigateToCartRef.current = navigate;
  }, []);

  const hideNotification = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setProduct(null);
    });
  }, [slideAnim, opacityAnim]);

  const showNotification = useCallback((prod: Product, count: number) => {
    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    setProduct(prod);
    setItemCount(count);
    setVisible(true);

    // Reset animation values
    slideAnim.setValue(-200);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after 4 seconds
    hideTimeoutRef.current = setTimeout(() => {
      hideNotification();
    }, 4000);
  }, [slideAnim, opacityAnim, hideNotification]);

  const handleViewCart = useCallback(() => {
    hideNotification();
    if (navigateToCartRef.current) {
      navigateToCartRef.current();
    }
  }, [hideNotification]);

  return (
    <CartNotificationContext.Provider value={{ showNotification, hideNotification, setNavigateToCart }}>
      {children}

      {/* Cart Notification Toast */}
      {visible && product && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 50,
            left: 0,
            right: 0,
            zIndex: 9999,
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          }}
          pointerEvents="box-none"
        >
          <View
            style={{
              marginHorizontal: 16,
              backgroundColor: '#fff',
              borderRadius: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              overflow: 'hidden',
            }}
          >
            {/* Success Header */}
            <View
              style={{
                backgroundColor: '#22C55E',
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                  Added to Cart!
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={hideNotification}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Product Info */}
            <View
              style={{
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Image
                source={{ uri: product.image || 'https://via.placeholder.com/60' }}
                style={{ width: 60, height: 60, borderRadius: 12 }}
                contentFit="cover"
                transition={200}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{ color: '#1F2937', fontWeight: '600', fontSize: 14 }}
                  numberOfLines={2}
                >
                  {product.name}
                </Text>
                <Text style={{ color: '#22C55E', fontWeight: 'bold', fontSize: 16, marginTop: 4 }}>
                  ৳{product.price.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View
              style={{
                paddingHorizontal: 16,
                paddingBottom: 16,
                flexDirection: 'row',
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                  marginRight: 8,
                }}
                onPress={hideNotification}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#4B5563', fontWeight: '600' }}>Continue Shopping</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: '#22C55E',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
                onPress={handleViewCart}
                activeOpacity={0.8}
              >
                <Ionicons name="cart" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>View Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </CartNotificationContext.Provider>
  );
}

export function useCartNotification() {
  const context = useContext(CartNotificationContext);
  if (context === undefined) {
    throw new Error('useCartNotification must be used within a CartNotificationProvider');
  }
  return context;
}
