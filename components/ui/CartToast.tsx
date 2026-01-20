import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface CartToastProps {
  visible: boolean;
  onHide: () => void;
  product?: {
    name: string;
    price: number;
    image?: string;
  };
  itemCount?: number;
}

export default function CartToast({ visible, onHide, product, itemCount = 0 }: CartToastProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
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
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
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
      onHide();
    });
  };

  const handleViewCart = () => {
    hideToast();
    router.push('/(tabs)/cart');
  };

  if (!visible && !product) return null;

  return (
    <Animated.View
      className="absolute top-0 left-0 right-0 z-50"
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <View className="mx-4 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Success Header */}
        <View className="bg-green-500 px-4 py-3 flex-row items-center">
          <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-3">
            <Ionicons name="checkmark" size={20} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base">Added to Cart!</Text>
            <Text className="text-white/80 text-sm">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </Text>
          </View>
          <TouchableOpacity
            className="w-8 h-8 items-center justify-center"
            onPress={hideToast}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        {product && (
          <View className="p-4 flex-row items-center">
            <Image
              source={{ uri: product.image || 'https://via.placeholder.com/60' }}
              style={{ width: 60, height: 60, borderRadius: 12 }}
              contentFit="cover"
              transition={200}
            />
            <View className="flex-1 ml-3">
              <Text className="text-gray-800 font-semibold text-sm" numberOfLines={2}>
                {product.name}
              </Text>
              <Text className="text-green-600 font-bold text-base mt-1">
                ৳{product.price.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View className="px-4 pb-4 flex-row">
          <TouchableOpacity
            className="flex-1 py-3 rounded-xl bg-gray-100 items-center mr-2"
            onPress={hideToast}
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 font-semibold">Continue Shopping</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 rounded-xl bg-green-500 items-center flex-row justify-center"
            onPress={handleViewCart}
            activeOpacity={0.8}
          >
            <Ionicons name="cart" size={18} color="#fff" />
            <Text className="text-white font-semibold ml-2">View Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
