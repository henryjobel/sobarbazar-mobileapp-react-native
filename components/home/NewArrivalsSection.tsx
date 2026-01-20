import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;

interface ProductVariant {
  id: number;
  name: string;
  price: number;
  final_price: number;
  stock: number;
  image?: string;
  discount?: {
    value: number;
    is_percentage: boolean;
  };
}

interface Product {
  id: number;
  name: string;
  default_variant?: ProductVariant;
  variants?: ProductVariant[];
  images?: { id: number; image: string }[];
  rating?: number;
  created_at?: string;
}

interface NewArrivalsSectionProps {
  products?: Product[];
  title?: string;
  onViewAll?: () => void;
}

export default function NewArrivalsSection({
  products = [],
  title = 'New Arrivals',
  onViewAll,
}: NewArrivalsSectionProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  if (!products || products.length === 0) {
    return null;
  }

  // Sort by newest (assuming higher ID = newer)
  const newProducts = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 10);

  const getProductPrice = (product: Product): number => {
    return product.default_variant?.final_price || product.default_variant?.price || 0;
  };

  const getProductOriginalPrice = (product: Product): number => {
    return product.default_variant?.price || 0;
  };

  const getProductImage = (product: Product): string => {
    if (product.default_variant?.image) return product.default_variant.image;
    if (product.images && product.images.length > 0) {
      const img = product.images[0];
      if (typeof img === 'string') return img;
      if (img?.image) return img.image;
    }
    if (product.variants && product.variants.length > 0 && product.variants[0]?.image) {
      return product.variants[0].image;
    }
    return 'https://via.placeholder.com/200';
  };

  const hasDiscount = (product: Product): boolean => {
    const variant = product.default_variant;
    if (!variant) return false;
    return !!(variant.discount || (variant.price > variant.final_price));
  };

  const handleAddToCart = async (product: Product) => {
    if (addingToCart === product.id) return;
    setAddingToCart(product.id);

    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: getProductPrice(product),
        image: getProductImage(product),
      }, 1);
    } finally {
      setAddingToCart(null);
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist({
        id: product.id,
        name: product.name,
        price: getProductPrice(product),
        image: getProductImage(product),
      });
    }
  };

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`;

  return (
    <View className="mt-6">
      {/* Section Header */}
      <View className="px-4 flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-3">
            <Ionicons name="sparkles" size={20} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-800">{title}</Text>
            <Text className="text-xs text-gray-500">Fresh products just for you</Text>
          </View>
        </View>
        <TouchableOpacity
          className="flex-row items-center bg-blue-50 px-3 py-2 rounded-lg"
          onPress={onViewAll || (() => router.push('/screens/shop'))}
        >
          <Text className="text-blue-600 font-semibold text-sm mr-1">View All</Text>
          <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Products Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
      >
        {newProducts.map((product) => {
          const isWishlisted = isInWishlist(product.id);
          const price = getProductPrice(product);
          const originalPrice = getProductOriginalPrice(product);
          const productHasDiscount = hasDiscount(product);
          const imageUrl = getProductImage(product);

          return (
            <TouchableOpacity
              key={product.id}
              className="bg-white rounded-2xl mr-3 overflow-hidden shadow-sm border border-gray-100"
              style={{ width: CARD_WIDTH }}
              onPress={() => router.push(`/screens/product/${product.id}`)}
              activeOpacity={0.9}
            >
              {/* Image */}
              <View className="relative">
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: CARD_WIDTH, height: CARD_WIDTH }}
                  contentFit="cover"
                  transition={200}
                />

                {/* NEW Badge */}
                <View className="absolute top-2 left-2 bg-blue-500 px-2 py-1 rounded-lg">
                  <Text className="text-white text-xs font-bold">NEW</Text>
                </View>

                {/* Wishlist Button */}
                <TouchableOpacity
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full items-center justify-center shadow-md"
                  onPress={() => toggleWishlist(product)}
                >
                  <Ionicons
                    name={isWishlisted ? 'heart' : 'heart-outline'}
                    size={18}
                    color={isWishlisted ? '#EF4444' : '#6B7280'}
                  />
                </TouchableOpacity>
              </View>

              {/* Info */}
              <View className="p-3">
                <Text className="text-gray-800 font-semibold text-sm" numberOfLines={2}>
                  {product.name}
                </Text>

                {product.rating && (
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="star" size={12} color="#FBBF24" />
                    <Text className="text-gray-500 text-xs ml-1">{product.rating.toFixed(1)}</Text>
                  </View>
                )}

                <View className="flex-row items-center mt-2">
                  <Text className="text-blue-600 font-bold text-base">{formatPrice(price)}</Text>
                  {productHasDiscount && originalPrice > price && (
                    <Text className="text-gray-400 text-xs line-through ml-2">
                      {formatPrice(originalPrice)}
                    </Text>
                  )}
                </View>

                {/* Add to Cart Button */}
                <TouchableOpacity
                  className={`mt-3 py-2.5 rounded-xl items-center ${
                    addingToCart === product.id ? 'bg-blue-400' : 'bg-blue-500'
                  }`}
                  onPress={() => handleAddToCart(product)}
                  disabled={addingToCart === product.id}
                >
                  {addingToCart === product.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <View className="flex-row items-center">
                      <Ionicons name="cart-outline" size={16} color="#fff" />
                      <Text className="text-white font-semibold text-sm ml-1.5">Add</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
