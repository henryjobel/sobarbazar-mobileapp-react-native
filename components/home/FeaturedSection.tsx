import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface FeaturedSectionProps {
  brands?: any[];
  categories?: any[];
}

export default function FeaturedSection({ brands = [], categories = [] }: FeaturedSectionProps) {
  const router = useRouter();

  return (
    <View className="mt-6 px-4">
      {/* Section Title */}
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mr-3">
          <Ionicons name="flame" size={20} color="#F97316" />
        </View>
        <View>
          <Text className="text-lg font-bold text-gray-800">Explore More</Text>
          <Text className="text-xs text-gray-500">Discover brands and categories</Text>
        </View>
      </View>

      {/* Quick Action Cards */}
      <View className="flex-row mb-4">
        {/* All Products Card */}
        <TouchableOpacity
          className="flex-1 bg-green-500 rounded-2xl p-4 mr-2 overflow-hidden"
          onPress={() => router.push('/screens/shop')}
          activeOpacity={0.9}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white/80 text-xs font-medium">Shop</Text>
              <Text className="text-white text-lg font-bold">All Products</Text>
              <View className="flex-row items-center mt-2">
                <Text className="text-white text-sm font-semibold">Browse</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" className="ml-1" />
              </View>
            </View>
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
              <Ionicons name="bag-handle-outline" size={24} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* All Stores Card */}
        <TouchableOpacity
          className="flex-1 bg-purple-500 rounded-2xl p-4 ml-2 overflow-hidden"
          onPress={() => router.push('/screens/stores')}
          activeOpacity={0.9}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white/80 text-xs font-medium">Visit</Text>
              <Text className="text-white text-lg font-bold">All Stores</Text>
              <View className="flex-row items-center mt-2">
                <Text className="text-white text-sm font-semibold">Explore</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" className="ml-1" />
              </View>
            </View>
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
              <Ionicons name="storefront-outline" size={24} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Feature Cards Grid */}
      <View className="flex-row flex-wrap justify-between">
        {/* Deals Card */}
        <TouchableOpacity
          className="w-[48%] bg-red-50 rounded-2xl p-4 mb-3"
          onPress={() => router.push('/(tabs)/deals')}
          activeOpacity={0.8}
        >
          <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center mb-3">
            <Ionicons name="pricetag" size={20} color="#EF4444" />
          </View>
          <Text className="text-gray-800 font-bold text-base">Hot Deals</Text>
          <Text className="text-gray-500 text-xs mt-1">Up to 50% off</Text>
        </TouchableOpacity>

        {/* Categories Card */}
        <TouchableOpacity
          className="w-[48%] bg-blue-50 rounded-2xl p-4 mb-3"
          onPress={() => router.push('/(tabs)/categories')}
          activeOpacity={0.8}
        >
          <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mb-3">
            <Ionicons name="grid" size={20} color="#3B82F6" />
          </View>
          <Text className="text-gray-800 font-bold text-base">Categories</Text>
          <Text className="text-gray-500 text-xs mt-1">Browse all</Text>
        </TouchableOpacity>

        {/* Free Shipping Card */}
        <TouchableOpacity
          className="w-[48%] bg-green-50 rounded-2xl p-4 mb-3"
          activeOpacity={0.8}
        >
          <View className="w-10 h-10 bg-green-100 rounded-xl items-center justify-center mb-3">
            <Ionicons name="car" size={20} color="#22C55E" />
          </View>
          <Text className="text-gray-800 font-bold text-base">Free Shipping</Text>
          <Text className="text-gray-500 text-xs mt-1">On orders ৳500+</Text>
        </TouchableOpacity>

        {/* Support Card */}
        <TouchableOpacity
          className="w-[48%] bg-yellow-50 rounded-2xl p-4 mb-3"
          activeOpacity={0.8}
        >
          <View className="w-10 h-10 bg-yellow-100 rounded-xl items-center justify-center mb-3">
            <Ionicons name="headset" size={20} color="#EAB308" />
          </View>
          <Text className="text-gray-800 font-bold text-base">24/7 Support</Text>
          <Text className="text-gray-500 text-xs mt-1">Always here for you</Text>
        </TouchableOpacity>
      </View>

      {/* Brand Highlight (if brands exist) */}
      {brands && brands.length > 0 && (
        <View className="mt-4">
          <Text className="text-sm font-semibold text-gray-600 mb-3">Featured Brands</Text>
          <View className="flex-row">
            {brands.slice(0, 5).map((brand: any) => (
              <TouchableOpacity
                key={brand.id}
                className="w-16 h-16 bg-white rounded-2xl mr-3 items-center justify-center border border-gray-100 shadow-sm"
                activeOpacity={0.8}
              >
                {brand.logo ? (
                  <Image
                    source={{ uri: brand.logo }}
                    style={{ width: 40, height: 40 }}
                    contentFit="contain"
                  />
                ) : (
                  <Text className="text-gray-400 text-xs text-center">{brand.name?.substring(0, 3)}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
