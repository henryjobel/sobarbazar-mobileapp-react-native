import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { getStoreById, getStoreProducts } from '../../../utils/api';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

const { width } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (width - 48) / 2;

interface Store {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  rating?: number;
  total_products?: number;
  total_reviews?: number;
  is_verified?: boolean;
  address?: string;
  phone?: string;
  email?: string;
  opening_hours?: string;
  established_date?: string;
}

interface ProductVariant {
  id: number;
  name: string;
  price: number;
  final_price: number;
  stock: number;
  available_stock?: number;
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
  store?: {
    id: number;
    name: string;
  };
}

export default function StoreDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchStoreData = useCallback(async () => {
    try {
      const [storeData, productsData] = await Promise.all([
        getStoreById(Number(id)),
        getStoreProducts(Number(id), 1),
      ]);

      setStore(storeData);
      setProducts(productsData || []);
      setPage(1);
      setHasMore((productsData?.length || 0) >= 10);
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchStoreData();
  }, [fetchStoreData]);

  const loadMoreProducts = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const moreProducts = await getStoreProducts(Number(id), nextPage);

      if (moreProducts && moreProducts.length > 0) {
        setProducts(prev => [...prev, ...moreProducts]);
        setPage(nextPage);
        setHasMore(moreProducts.length >= 10);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Helper functions for product data
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
    // Try default_variant image first
    if (product.default_variant?.image) return product.default_variant.image;
    // Try images array
    if (product.images && product.images.length > 0) {
      const img = product.images[0];
      if (typeof img === 'string') return img;
      if (img?.image) return img.image;
    }
    // Try first variant
    if (product.variants && product.variants.length > 0 && product.variants[0]?.image) {
      return product.variants[0].image;
    }
    return 'https://via.placeholder.com/200';
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: getProductPrice(product),
      image: getProductImage(product),
      quantity: 1,
    });
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: getProductPrice(product),
        image: getProductImage(product),
      });
    }
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    const isWishlisted = isInWishlist(item.id);
    const productHasDiscount = hasDiscount(item);
    const discountPercent = getDiscountPercent(item);
    const price = getProductPrice(item);
    const originalPrice = getProductOriginalPrice(item);
    const imageUrl = getProductImage(item);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/screens/product/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            contentFit="cover"
          />
          {productHasDiscount && discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => toggleWishlist(item)}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={20}
              color={isWishlisted ? '#EF4444' : '#6B7280'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>
              ৳{price.toLocaleString()}
            </Text>
            {productHasDiscount && originalPrice > price && (
              <Text style={styles.originalPrice}>৳{originalPrice.toLocaleString()}</Text>
            )}
          </View>
          {item.rating ? (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              {item.total_reviews ? (
                <Text style={styles.reviewCount}>({item.total_reviews})</Text>
              ) : null}
            </View>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="cart-outline" size={16} color="#fff" />
          <Text style={styles.addToCartText}>Add</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderAboutSection = () => (
    <ScrollView style={styles.aboutContainer} showsVerticalScrollIndicator={false}>
      {store?.description && (
        <View style={styles.aboutSection}>
          <Text style={styles.aboutSectionTitle}>About</Text>
          <Text style={styles.aboutText}>{store.description}</Text>
        </View>
      )}

      <View style={styles.aboutSection}>
        <Text style={styles.aboutSectionTitle}>Store Information</Text>

        {store?.address && (
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="location-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{store.address}</Text>
            </View>
          </View>
        )}

        {store?.phone && (
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="call-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{store.phone}</Text>
            </View>
          </View>
        )}

        {store?.email && (
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{store.email}</Text>
            </View>
          </View>
        )}

        {store?.opening_hours && (
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="time-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Opening Hours</Text>
              <Text style={styles.infoValue}>{store.opening_hours}</Text>
            </View>
          </View>
        )}

        {store?.established_date && (
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Established</Text>
              <Text style={styles.infoValue}>{store.established_date}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="cube-outline" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{store?.total_products || 0}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="star-outline" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.statValue}>{store?.rating?.toFixed(1) || 'N/A'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="chatbubble-outline" size={24} color="#10B981" />
          </View>
          <Text style={styles.statValue}>{store?.total_reviews || 0}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderEmptyProducts = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No products yet</Text>
      <Text style={styles.emptySubtitle}>This store hasn't added any products</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading store...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!store) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Store Not Found</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="storefront-outline" size={64} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>Store not found</Text>
          <Text style={styles.emptySubtitle}>This store may have been removed</Text>
          <TouchableOpacity
            style={styles.backToStoresButton}
            onPress={() => router.push('/screens/stores')}
          >
            <Text style={styles.backToStoresText}>Browse All Stores</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {store.name}
        </Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Store Banner & Info */}
      <View style={styles.storeHeader}>
        {store.banner && (
          <Image
            source={{ uri: store.banner }}
            style={styles.storeBanner}
            contentFit="cover"
          />
        )}
        <View style={styles.storeInfoContainer}>
          <Image
            source={{ uri: store.logo || 'https://via.placeholder.com/80' }}
            style={styles.storeLogo}
            contentFit="cover"
          />
          <View style={styles.storeDetails}>
            <View style={styles.storeNameRow}>
              <Text style={styles.storeName} numberOfLines={1}>
                {store.name}
              </Text>
              {store.is_verified && (
                <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
              )}
            </View>
            <View style={styles.storeStats}>
              {store.rating && (
                <View style={styles.storeStat}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.storeStatText}>{store.rating.toFixed(1)}</Text>
                </View>
              )}
              <View style={styles.storeStat}>
                <Ionicons name="cube-outline" size={14} color="#6B7280" />
                <Text style={styles.storeStatText}>{store.total_products || 0} Products</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'about' && styles.activeTab]}
          onPress={() => setActiveTab('about')}
        >
          <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
            About
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'products' ? (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={[
            styles.productsContainer,
            products.length === 0 && styles.emptyProductsContainer,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyProducts}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            ) : null
          }
        />
      ) : (
        renderAboutSection()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginHorizontal: 12,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeHeader: {
    backgroundColor: '#fff',
  },
  storeBanner: {
    width: '100%',
    height: 120,
  },
  storeInfoContainer: {
    flexDirection: 'row',
    padding: 16,
    marginTop: -32,
  },
  storeLogo: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 3,
    borderColor: '#fff',
  },
  storeDetails: {
    flex: 1,
    marginLeft: 12,
    marginTop: 32,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  storeStats: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 16,
  },
  storeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeStatText: {
    fontSize: 13,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  productsContainer: {
    padding: 16,
  },
  emptyProductsContainer: {
    flex: 1,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: PRODUCT_CARD_WIDTH,
    backgroundColor: '#F3F4F6',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3B82F6',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    gap: 4,
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  aboutContainer: {
    flex: 1,
    padding: 16,
  },
  aboutSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  aboutSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  backToStoresButton: {
    marginTop: 24,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backToStoresText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
