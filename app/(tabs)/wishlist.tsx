import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export default function WishlistScreen() {
  const router = useRouter();
  const { items, isLoading, removeFromWishlist, refreshWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [removingItem, setRemovingItem] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRemoveItem = async (itemId: number) => {
    setRemovingItem(itemId);
    const success = await removeFromWishlist(itemId);
    if (!success) {
      Alert.alert('Error', 'Failed to remove item from wishlist');
    }
    setRemovingItem(null);
  };

  const handleAddToCart = async (item: any) => {
    if (addingToCart === item.id) return;
    setAddingToCart(item.id);

    try {
      const cartProduct = {
        id: item.product_id,
        name: item.name,
        price: item.price,
        image: item.image,
      };

      const success = await addItem(cartProduct, 1);
      if (success) {
        Alert.alert('Success', `${item.name} added to cart!`, [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
        ]);
      } else {
        Alert.alert('Error', 'Failed to add item to cart');
      }
    } finally {
      setAddingToCart(null);
    }
  };

  const handleClearWishlist = () => {
    if (items.length === 0) return;

    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to remove all items from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearWishlist();
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshWishlist();
    setIsRefreshing(false);
  };

  const handleProductPress = (item: any) => {
    router.push(`/screens/product/${item.product_id}`);
  };

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString()}`;
  };

  // Empty state
  if (!isLoading && items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-6 py-5 border-b border-gray-100 shadow-sm">
          <Text className="text-2xl font-bold text-gray-800">My Wishlist</Text>
          <Text className="text-sm text-gray-500 mt-1">Your saved items</Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="heart-outline" size={48} color="#EF4444" />
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</Text>
          <Text className="text-gray-500 text-center mb-8">
            Browse our products and save your favorites here
          </Text>
          <TouchableOpacity
            className="bg-green-500 px-8 py-4 rounded-2xl shadow-lg shadow-green-200"
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-5 border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-800">My Wishlist</Text>
            <Text className="text-sm text-gray-500 mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </Text>
          </View>
          {items.length > 0 && (
            <TouchableOpacity
              className="bg-red-50 p-3 rounded-xl"
              onPress={handleClearWishlist}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loading state */}
      {isLoading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22C55E" />
          <Text className="text-gray-500 mt-4">Loading wishlist...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#22C55E']}
              tintColor="#22C55E"
            />
          }
        >
          {/* Product Grid */}
          <View className="flex-row flex-wrap justify-between pb-32">
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="w-[48%] bg-white rounded-2xl mb-4 overflow-hidden shadow-sm"
                onPress={() => handleProductPress(item)}
                activeOpacity={0.9}
              >
                {/* Product Image */}
                <View className="relative">
                  <Image
                    source={{ uri: item.image || 'https://via.placeholder.com/200' }}
                    style={{ width: '100%', height: 160 }}
                    contentFit="cover"
                    transition={200}
                  />

                  {/* Remove Button */}
                  <TouchableOpacity
                    className="absolute top-2 right-2 bg-white w-8 h-8 rounded-full items-center justify-center shadow-md"
                    onPress={() => handleRemoveItem(item.id)}
                    disabled={removingItem === item.id}
                    activeOpacity={0.7}
                  >
                    {removingItem === item.id ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Ionicons name="heart" size={18} color="#EF4444" />
                    )}
                  </TouchableOpacity>

                  {/* Discount Badge */}
                  {item.discount && item.discount > 0 && (
                    <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-lg">
                      <Text className="text-white text-xs font-bold">-{item.discount}%</Text>
                    </View>
                  )}

                  {/* Out of Stock Overlay */}
                  {item.in_stock === false && (
                    <View className="absolute inset-0 bg-black/40 items-center justify-center">
                      <View className="bg-white px-3 py-1.5 rounded-lg">
                        <Text className="text-red-500 font-semibold text-xs">Out of Stock</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View className="p-3">
                  <Text className="text-gray-800 font-semibold text-sm mb-1" numberOfLines={2}>
                    {item.name}
                  </Text>

                  {/* Rating */}
                  {item.rating && (
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="star" size={12} color="#FBBF24" />
                      <Text className="text-gray-500 text-xs ml-1">{item.rating.toFixed(1)}</Text>
                    </View>
                  )}

                  {/* Price */}
                  <View className="flex-row items-center mb-3">
                    <Text className="text-green-600 font-bold text-base">
                      {formatPrice(item.price)}
                    </Text>
                    {item.original_price && item.original_price > item.price && (
                      <Text className="text-gray-400 text-xs line-through ml-2">
                        {formatPrice(item.original_price)}
                      </Text>
                    )}
                  </View>

                  {/* Add to Cart Button */}
                  <TouchableOpacity
                    className={`py-2.5 rounded-xl items-center ${
                      item.in_stock === false
                        ? 'bg-gray-200'
                        : addingToCart === item.id
                        ? 'bg-green-400'
                        : 'bg-green-500'
                    }`}
                    onPress={() => handleAddToCart(item)}
                    disabled={item.in_stock === false || addingToCart === item.id}
                    activeOpacity={0.8}
                  >
                    {addingToCart === item.id ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#fff" />
                        <Text className="text-white font-semibold text-sm ml-2">Adding...</Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center">
                        <Ionicons
                          name="cart-outline"
                          size={16}
                          color={item.in_stock === false ? '#9CA3AF' : '#fff'}
                        />
                        <Text
                          className={`font-semibold text-sm ml-1.5 ${
                            item.in_stock === false ? 'text-gray-400' : 'text-white'
                          }`}
                        >
                          {item.in_stock === false ? 'Unavailable' : 'Add to Cart'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
