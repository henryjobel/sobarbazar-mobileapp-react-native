import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategories } from '@/utils/api';

interface Category {
  id: number;
  name: string;
  slug?: string;
  image?: string;
  icon?: string;
  product_count?: number;
  subcategories?: Category[];
}

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      console.log('📂 Categories: Fetching categories');
      const data = await getCategories();
      console.log('📂 Categories: Got', data?.length || 0, 'categories');
      // Ensure we have an array
      const categoriesArray = Array.isArray(data) ? data : [];
      setCategories(categoriesArray);
      setFilteredCategories(categoriesArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setFilteredCategories([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (searchText === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchText, categories]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryPress = (category: Category) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setSelectedCategory(category);
    } else {
      router.push(`/(tabs)/shop?category=${category.id}&name=${encodeURIComponent(category.name)}`);
    }
  };

  const handleSubcategoryPress = (subcategory: Category) => {
    router.push(`/(tabs)/shop?category=${subcategory.id}&name=${encodeURIComponent(subcategory.name)}`);
  };

  const getCategoryImage = (category: Category): string => {
    if (category.image) return category.image;
    if (category.icon) return category.icon;
    return 'https://via.placeholder.com/100';
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#299e60" />
          <Text className="text-gray-500 mt-4">Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Subcategory view
  if (selectedCategory) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-100 shadow-sm">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
              onPress={() => setSelectedCategory(null)}
            >
              <Ionicons name="arrow-back" size={22} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-800">{selectedCategory.name}</Text>
              <Text className="text-sm text-gray-500">
                {selectedCategory.subcategories?.length || 0} subcategories
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {/* All products in category */}
          <TouchableOpacity
            className="bg-main-600 rounded-2xl p-4 mb-4 flex-row items-center"
            onPress={() => router.push(`/screens/shop?category=${selectedCategory.id}&name=${encodeURIComponent(selectedCategory.name)}`)}
            activeOpacity={0.8}
          >
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
              <Ionicons name="grid-outline" size={24} color="#fff" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-white font-bold text-lg">All {selectedCategory.name}</Text>
              <Text className="text-white/80 text-sm">Browse all products</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Subcategories */}
          <View className="flex-row flex-wrap justify-between pb-32">
            {selectedCategory.subcategories?.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                className="w-[48%] bg-white rounded-2xl mb-4 overflow-hidden shadow-sm"
                onPress={() => handleSubcategoryPress(sub)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: getCategoryImage(sub) }}
                  style={{ width: '100%', height: 100 }}
                  contentFit="cover"
                  transition={200}
                />
                <View className="p-3">
                  <Text className="text-gray-800 font-semibold text-sm" numberOfLines={2}>
                    {sub.name}
                  </Text>
                  {sub.product_count !== undefined && (
                    <Text className="text-gray-400 text-xs mt-1">
                      {sub.product_count} products
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-5 border-b border-gray-100 shadow-sm">
        <Text className="text-2xl font-bold text-gray-800">Categories</Text>
        <Text className="text-sm text-gray-500 mt-1">Browse products by category</Text>

        {/* Search */}
        <View className="mt-4 flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-800"
            placeholder="Search categories..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#299e60']}
            tintColor="#299e60"
          />
        }
      >
        {/* Featured Category Banner */}
        <TouchableOpacity
          className="mx-4 mt-4 bg-gradient-to-r from-main-600 to-emerald-600 rounded-2xl overflow-hidden"
          onPress={() => router.push('/screens/shop')}
          activeOpacity={0.9}
        >
          <View className="bg-main-600 p-5 flex-row items-center">
            <View className="flex-1">
              <Text className="text-white/80 text-sm font-medium">Explore All</Text>
              <Text className="text-white text-xl font-bold mt-1">Shop All Products</Text>
              <View className="flex-row items-center mt-2">
                <Text className="text-white font-semibold">Browse Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" className="ml-1" />
              </View>
            </View>
            <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center">
              <Ionicons name="bag-handle-outline" size={32} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Categories Count */}
        <View className="px-4 py-4">
          <Text className="text-gray-500 text-sm">
            {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} available
          </Text>
        </View>

        {/* Categories Grid */}
        <View className="px-4 flex-row flex-wrap justify-between pb-32">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className="w-[48%] bg-white rounded-2xl mb-4 overflow-hidden shadow-sm"
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.8}
              >
                {/* Category Image */}
                <View className="relative">
                  <Image
                    source={{ uri: getCategoryImage(category) }}
                    style={{ width: '100%', height: 120 }}
                    contentFit="cover"
                    transition={200}
                  />
                  {/* Gradient Overlay */}
                  <View className="absolute inset-0 bg-black/10" />

                  {/* Subcategories badge */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <View className="absolute top-2 right-2 bg-main-600 px-2 py-1 rounded-lg">
                      <Text className="text-white text-xs font-bold">
                        {category.subcategories.length} sub
                      </Text>
                    </View>
                  )}
                </View>

                {/* Category Info */}
                <View className="p-4">
                  <Text className="text-gray-800 font-bold text-base" numberOfLines={2}>
                    {category.name}
                  </Text>
                  <View className="flex-row items-center justify-between mt-2">
                    {category.product_count !== undefined && (
                      <Text className="text-gray-400 text-xs">
                        {category.product_count} products
                      </Text>
                    )}
                    <View className="flex-row items-center">
                      <Text className="text-main-600 text-xs font-semibold">View</Text>
                      <Ionicons name="chevron-forward" size={14} color="#299e60" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-16 w-full">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="search-outline" size={40} color="#9CA3AF" />
              </View>
              <Text className="text-gray-800 font-bold text-lg">No categories found</Text>
              <Text className="text-gray-500 text-center mt-2">
                Try a different search term
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
