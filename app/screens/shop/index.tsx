import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProducts, getCategories } from '@/utils/api';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCartNotification } from '@/context/CartNotificationContext';

interface ProductVariant {
  id: number;
  name: string;
  price: number;
  final_price: number;
  stock: number;
  image?: string;
  discount?: {
    name: string;
    type: string;
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
  total_reviews?: number;
  store?: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
}

type SortOption = 'default' | 'price_low' | 'price_high' | 'newest' | 'rating';

export default function ShopScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = params.category as string | undefined;
  const categoryName = params.name ? decodeURIComponent(params.name as string) : undefined;

  const { addItem, itemCount } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showNotification, setNavigateToCart } = useCartNotification();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryId);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Set up navigation callback for cart notification
  useEffect(() => {
    setNavigateToCart(() => router.push('/(tabs)/cart'));
  }, [router, setNavigateToCart]);

  const fetchProducts = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (pageNum === 1) setIsLoading(true);

      const data = await getProducts(pageNum, 20, selectedCategory || undefined, searchQuery || undefined);

      let sortedData = [...(data || [])];

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          sortedData.sort((a, b) => getProductPrice(a) - getProductPrice(b));
          break;
        case 'price_high':
          sortedData.sort((a, b) => getProductPrice(b) - getProductPrice(a));
          break;
        case 'rating':
          sortedData.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          sortedData.sort((a, b) => b.id - a.id);
          break;
      }

      if (reset || pageNum === 1) {
        setProducts(sortedData);
      } else {
        setProducts(prev => [...prev, ...sortedData]);
      }

      setPage(pageNum);
      setHasMore((data?.length || 0) >= 20);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategory, searchQuery, sortBy]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(1, true);
  }, [selectedCategory, sortBy]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProducts(1, true);
  }, [fetchProducts]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    fetchProducts(page + 1);
  }, [isLoadingMore, hasMore, page, fetchProducts]);

  const handleSearch = () => {
    fetchProducts(1, true);
  };

  // Helper functions
  const getProductPrice = (product: Product): number => {
    return product.default_variant?.final_price || product.default_variant?.price || 0;
  };

  const getProductOriginalPrice = (product: Product): number => {
    return product.default_variant?.price || 0;
  };

  const hasDiscount = (product: Product): boolean => {
    const variant = product.default_variant;
    if (!variant) return false;
    return !!(variant.discount || (variant.price > variant.final_price));
  };

  const getDiscountPercent = (product: Product): number => {
    const variant = product.default_variant;
    if (!variant) return 0;
    if (variant.discount?.is_percentage) return variant.discount.value;
    if (variant.price > variant.final_price) {
      return Math.round(((variant.price - variant.final_price) / variant.price) * 100);
    }
    return 0;
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

  const handleAddToCart = async (product: Product) => {
    if (addingToCart === product.id) return;
    setAddingToCart(product.id);

    try {
      const success = await addItem({
        id: product.id,
        name: product.name,
        price: getProductPrice(product),
        image: getProductImage(product),
      }, 1);

      if (success) {
        // Show beautiful cart notification popup
        showNotification(
          {
            name: product.name,
            price: getProductPrice(product),
            image: getProductImage(product),
          },
          itemCount + 1
        );
      }
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

  const sortOptions: { value: SortOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'default', label: 'Default', icon: 'apps-outline' },
    { value: 'price_low', label: 'Price: Low to High', icon: 'trending-up-outline' },
    { value: 'price_high', label: 'Price: High to Low', icon: 'trending-down-outline' },
    { value: 'rating', label: 'Highest Rated', icon: 'star-outline' },
    { value: 'newest', label: 'Newest First', icon: 'time-outline' },
  ];

  const renderProductCard = ({ item }: { item: Product }) => {
    const isWishlisted = isInWishlist(item.id);
    const productHasDiscount = hasDiscount(item);
    const discountPercent = getDiscountPercent(item);
    const price = getProductPrice(item);
    const originalPrice = getProductOriginalPrice(item);
    const imageUrl = getProductImage(item);

    if (viewMode === 'list') {
      return (
        <TouchableOpacity
          className="bg-white mx-4 mb-3 rounded-2xl flex-row overflow-hidden shadow-sm"
          onPress={() => router.push(`/screens/product/${item.id}`)}
          activeOpacity={0.9}
        >
          <View className="relative">
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 120, height: 120 }}
              contentFit="cover"
              transition={200}
            />
            {productHasDiscount && discountPercent > 0 && (
              <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-lg">
                <Text className="text-white text-xs font-bold">-{discountPercent}%</Text>
              </View>
            )}
          </View>
          <View className="flex-1 p-3 justify-between">
            <View>
              <Text className="text-gray-800 font-semibold text-sm" numberOfLines={2}>
                {item.name}
              </Text>
              {item.store && (
                <Text className="text-gray-400 text-xs mt-1">{item.store.name}</Text>
              )}
              {item.rating && (
                <View className="flex-row items-center mt-1">
                  <Ionicons name="star" size={12} color="#FBBF24" />
                  <Text className="text-gray-500 text-xs ml-1">{item.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center justify-between mt-2">
              <View>
                <Text className="text-green-600 font-bold text-base">{formatPrice(price)}</Text>
                {productHasDiscount && originalPrice > price && (
                  <Text className="text-gray-400 text-xs line-through">{formatPrice(originalPrice)}</Text>
                )}
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity
                  className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-2"
                  onPress={() => toggleWishlist(item)}
                >
                  <Ionicons
                    name={isWishlisted ? 'heart' : 'heart-outline'}
                    size={18}
                    color={isWishlisted ? '#EF4444' : '#6B7280'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    addingToCart === item.id ? 'bg-green-400' : 'bg-green-500'
                  }`}
                  onPress={() => handleAddToCart(item)}
                  disabled={addingToCart === item.id}
                >
                  {addingToCart === item.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="cart-outline" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        className="w-[48%] bg-white rounded-2xl mb-4 overflow-hidden shadow-sm"
        onPress={() => router.push(`/screens/product/${item.id}`)}
        activeOpacity={0.9}
      >
        <View className="relative">
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: 160 }}
            contentFit="cover"
            transition={200}
          />
          {productHasDiscount && discountPercent > 0 && (
            <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-lg">
              <Text className="text-white text-xs font-bold">-{discountPercent}%</Text>
            </View>
          )}
          <TouchableOpacity
            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full items-center justify-center shadow-md"
            onPress={() => toggleWishlist(item)}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={18}
              color={isWishlisted ? '#EF4444' : '#6B7280'}
            />
          </TouchableOpacity>
        </View>
        <View className="p-3">
          <Text className="text-gray-800 font-semibold text-sm" numberOfLines={2}>
            {item.name}
          </Text>
          {item.rating && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text className="text-gray-500 text-xs ml-1">{item.rating.toFixed(1)}</Text>
            </View>
          )}
          <View className="flex-row items-center mt-2">
            <Text className="text-green-600 font-bold text-base">{formatPrice(price)}</Text>
            {productHasDiscount && originalPrice > price && (
              <Text className="text-gray-400 text-xs line-through ml-2">{formatPrice(originalPrice)}</Text>
            )}
          </View>
          <TouchableOpacity
            className={`mt-3 py-2.5 rounded-xl items-center ${
              addingToCart === item.id ? 'bg-green-400' : 'bg-green-500'
            }`}
            onPress={() => handleAddToCart(item)}
            disabled={addingToCart === item.id}
          >
            {addingToCart === item.id ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-semibold text-sm ml-2">Adding...</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="cart-outline" size={16} color="#fff" />
                <Text className="text-white font-semibold text-sm ml-1.5">Add to Cart</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View className="mb-4">
      {/* Category Chips */}
      {categories.length > 0 && (
        <View className="px-4 mb-4">
          <FlatList
            horizontal
            data={[{ id: 0, name: 'All' }, ...categories]}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`mr-2 px-4 py-2 rounded-full ${
                  (item.id === 0 && !selectedCategory) || selectedCategory === item.id.toString()
                    ? 'bg-green-500'
                    : 'bg-white border border-gray-200'
                }`}
                onPress={() => {
                  setSelectedCategory(item.id === 0 ? undefined : item.id.toString());
                }}
              >
                <Text
                  className={`font-semibold text-sm ${
                    (item.id === 0 && !selectedCategory) || selectedCategory === item.id.toString()
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Results count and view toggle */}
      <View className="px-4 flex-row items-center justify-between">
        <Text className="text-gray-500 text-sm">
          {products.length} products found
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity
            className={`w-9 h-9 rounded-lg items-center justify-center mr-2 ${
              viewMode === 'grid' ? 'bg-green-500' : 'bg-gray-100'
            }`}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid-outline" size={18} color={viewMode === 'grid' ? '#fff' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            className={`w-9 h-9 rounded-lg items-center justify-center ${
              viewMode === 'list' ? 'bg-green-500' : 'bg-gray-100'
            }`}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list-outline" size={18} color={viewMode === 'list' ? '#fff' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="bag-outline" size={48} color="#9CA3AF" />
      </View>
      <Text className="text-gray-800 font-bold text-lg mb-2">No products found</Text>
      <Text className="text-gray-500 text-center px-8">
        Try adjusting your filters or search term
      </Text>
      <TouchableOpacity
        className="mt-6 bg-green-500 px-6 py-3 rounded-xl"
        onPress={() => {
          setSelectedCategory(undefined);
          setSearchQuery('');
          setSortBy('default');
        }}
      >
        <Text className="text-white font-semibold">Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && products.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22C55E" />
          <Text className="text-gray-500 mt-4">Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">
              {categoryName || 'All Products'}
            </Text>
            <Text className="text-sm text-gray-500">Browse our collection</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mr-3">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-800"
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center mr-2"
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="swap-vertical-outline" size={22} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-12 h-12 bg-green-500 rounded-xl items-center justify-center"
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        columnWrapperStyle={viewMode === 'grid' ? { paddingHorizontal: 16, justifyContent: 'space-between' } : undefined}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#22C55E']}
            tintColor="#22C55E"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#22C55E" />
            </View>
          ) : null
        }
      />

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View className="bg-white rounded-t-3xl">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center my-4" />
            <Text className="text-xl font-bold text-gray-800 px-6 mb-4">Sort By</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                className={`flex-row items-center px-6 py-4 border-b border-gray-100 ${
                  sortBy === option.value ? 'bg-green-50' : ''
                }`}
                onPress={() => {
                  setSortBy(option.value);
                  setShowSortModal(false);
                }}
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                  sortBy === option.value ? 'bg-green-500' : 'bg-gray-100'
                }`}>
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={sortBy === option.value ? '#fff' : '#6B7280'}
                  />
                </View>
                <Text className={`flex-1 font-semibold ${
                  sortBy === option.value ? 'text-green-600' : 'text-gray-700'
                }`}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                )}
              </TouchableOpacity>
            ))}
            <View className="h-8" />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '70%' }}>
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center my-4" />
            <View className="flex-row items-center justify-between px-6 mb-4">
              <Text className="text-xl font-bold text-gray-800">Filter by Category</Text>
              <TouchableOpacity onPress={() => setSelectedCategory(undefined)}>
                <Text className="text-green-500 font-semibold">Clear</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row items-center px-6 py-4 border-b border-gray-100 ${
                    selectedCategory === item.id.toString() ? 'bg-green-50' : ''
                  }`}
                  onPress={() => {
                    setSelectedCategory(item.id.toString());
                    setShowFilterModal(false);
                  }}
                >
                  <Text className={`flex-1 font-medium ${
                    selectedCategory === item.id.toString() ? 'text-green-600' : 'text-gray-700'
                  }`}>
                    {item.name}
                  </Text>
                  {selectedCategory === item.id.toString() && (
                    <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                  )}
                </TouchableOpacity>
              )}
            />
            <View className="h-8" />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
