import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { getStoreById, getStoreProducts } from '../../../utils/api';
import { formatHtmlText } from '@/utils/htmlText';

const { width } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (width - 48) / 2;
const API_BASE_URL = 'https://api.hetdcl.com';

interface Store {
  id: number;
  name: string;
  slug?: string;
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
  city?: string;
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
  images?: { id: number; image: string; image_url?: string }[];
  rating?: number;
  total_reviews?: number;
}

const formatPrice = (price: number) => `\u09F3${(price || 0).toLocaleString()}`;

const ensureAbsoluteUrl = (url?: string | null, fallback = 'https://via.placeholder.com/300x300/f3f8f1/299e60?text=Store'): string => {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function StoreDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const storeId = Number(id);

  const fetchStoreData = useCallback(async () => {
    try {
      const [storeData, productsData] = await Promise.all([
        getStoreById(storeId),
        getStoreProducts(storeId, 1),
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
  }, [storeId]);

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
      const moreProducts = await getStoreProducts(storeId, nextPage);

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

  const getProductPrice = (product: Product): number => (
    product.default_variant?.final_price || product.default_variant?.price || product.variants?.[0]?.final_price || product.variants?.[0]?.price || 0
  );

  const getProductOriginalPrice = (product: Product): number => (
    product.default_variant?.price || product.variants?.[0]?.price || 0
  );

  const hasDiscount = (product: Product): boolean => {
    const variant = product.default_variant || product.variants?.[0];
    if (!variant) return false;
    return !!(variant.discount || (variant.price > variant.final_price));
  };

  const getDiscountPercent = (product: Product): number => {
    const variant = product.default_variant || product.variants?.[0];
    if (!variant) return 0;
    if (variant.discount?.is_percentage) return variant.discount.value;
    if (variant.price > variant.final_price) {
      return Math.round(((variant.price - variant.final_price) / variant.price) * 100);
    }
    return 0;
  };

  const getProductImage = (product: Product): string => {
    const imageUrl =
      product.default_variant?.image ||
      product.images?.[0]?.image ||
      product.images?.[0]?.image_url ||
      product.variants?.[0]?.image ||
      null;

    return ensureAbsoluteUrl(imageUrl, 'https://via.placeholder.com/300x300/f3f8f1/299e60?text=Product');
  };

  const handleAddToCart = async (product: Product) => {
    if (addingProductId === product.id) return;

    setAddingProductId(product.id);
    try {
      await addItem(product, 1, product.default_variant || product.variants?.[0]);
    } finally {
      setAddingProductId(null);
    }
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

  const handleShare = async () => {
    if (!store) return;
    await Share.share({
      title: store.name,
      message: `Visit ${store.name} on Sobarbazar`,
    });
  };

  const renderHeader = () => {
    if (!store) return null;

    const rating = store.rating || 0;
    const totalProducts = store.total_products || products.length;
    const description = formatHtmlText(store.description);

    return (
      <>
        <LinearGradient colors={['#e9fbf0', '#fff5df']} style={styles.hero}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroTopRow}>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#12382b" />
            </TouchableOpacity>
            <Text style={styles.heroTitle} numberOfLines={1}>Seller Store</Text>
            <TouchableOpacity style={styles.headerIconButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={21} color="#12382b" />
            </TouchableOpacity>
          </View>

          <View style={styles.storeHeroCard}>
            {store.banner ? (
              <Image source={{ uri: ensureAbsoluteUrl(store.banner) }} style={styles.storeBanner} contentFit="cover" />
            ) : (
              <LinearGradient colors={['#12382b', '#299e60']} style={styles.storeBanner}>
                <Ionicons name="storefront-outline" size={42} color="rgba(255,255,255,0.55)" />
              </LinearGradient>
            )}

            <View style={styles.storeIdentityRow}>
              <View style={styles.logoOuter}>
                <Image
                  source={{ uri: ensureAbsoluteUrl(store.logo, 'https://via.placeholder.com/120x120/eaf8ef/299e60?text=Shop') }}
                  style={styles.storeLogo}
                  contentFit="cover"
                />
              </View>
              <View style={styles.storeIdentityText}>
                <View style={styles.storeNameRow}>
                  <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
                  {store.is_verified ? <Ionicons name="checkmark-circle" size={20} color="#299e60" /> : null}
                </View>
                <Text style={styles.storeSubtitle} numberOfLines={1}>
                  {store.city || store.address || 'Trusted seller on Sobarbazar'}
                </Text>
              </View>
            </View>

            {description ? <Text style={styles.storeDescription} numberOfLines={2}>{description}</Text> : null}

            <View style={styles.statsGrid}>
              <View style={styles.statPill}>
                <Ionicons name="cube-outline" size={17} color="#299e60" />
                <View>
                  <Text style={styles.statValue}>{totalProducts}</Text>
                  <Text style={styles.statLabel}>Products</Text>
                </View>
              </View>
              <View style={styles.statPill}>
                <Ionicons name="star" size={17} color="#f59e0b" />
                <View>
                  <Text style={styles.statValue}>{rating > 0 ? rating.toFixed(1) : 'New'}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </View>
              <View style={styles.statPill}>
                <Ionicons name="chatbubble-outline" size={17} color="#2563eb" />
                <View>
                  <Text style={styles.statValue}>{store.total_reviews || 0}</Text>
                  <Text style={styles.statLabel}>Reviews</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.tabShell}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'products' && styles.tabButtonActive]}
            onPress={() => setActiveTab('products')}
          >
            <Ionicons name="bag-handle-outline" size={17} color={activeTab === 'products' ? '#fff' : '#299e60'} />
            <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>Products</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'about' && styles.tabButtonActive]}
            onPress={() => setActiveTab('about')}
          >
            <Ionicons name="information-circle-outline" size={18} color={activeTab === 'about' ? '#fff' : '#299e60'} />
            <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>About Seller</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'products' ? (
          <View style={styles.productsHeader}>
            <View>
              <Text style={styles.sectionTitle}>Store Products</Text>
              <Text style={styles.sectionHint}>{products.length} items available</Text>
            </View>
            <View style={styles.sortChip}>
              <Ionicons name="sparkles-outline" size={14} color="#299e60" />
              <Text style={styles.sortChipText}>Featured</Text>
            </View>
          </View>
        ) : null}
      </>
    );
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    const isWishlisted = isInWishlist(item.id);
    const productHasDiscount = hasDiscount(item);
    const discountPercent = getDiscountPercent(item);
    const price = getProductPrice(item);
    const originalPrice = getProductOriginalPrice(item);
    const imageUrl = getProductImage(item);
    const isAdding = addingProductId === item.id;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/screens/product/${item.id}`)}
        activeOpacity={0.88}
      >
        <View style={styles.productImageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.productImage} contentFit="cover" />
          {productHasDiscount && discountPercent > 0 ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          ) : null}
          <TouchableOpacity style={styles.wishlistButton} onPress={() => toggleWishlist(item)}>
            <Ionicons name={isWishlisted ? 'heart' : 'heart-outline'} size={19} color={isWishlisted ? '#EF4444' : '#12382b'} />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{formatPrice(price)}</Text>
            {productHasDiscount && originalPrice > price ? (
              <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
            ) : null}
          </View>
          {(item.rating ?? 0) > 0 ? (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.rating?.toFixed(1)}</Text>
              {(item.total_reviews ?? 0) > 0 ? <Text style={styles.reviewCount}>({item.total_reviews})</Text> : null}
            </View>
          ) : null}
        </View>

        <TouchableOpacity style={styles.addToCartButton} onPress={() => handleAddToCart(item)} disabled={isAdding}>
          {isAdding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={16} color="#fff" />
              <Text style={styles.addToCartText}>Add</Text>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderAboutSection = () => {
    if (!store) return null;

    const description = formatHtmlText(store.description) || 'This seller has not added a description yet.';
    const infoRows = [
      { icon: 'location-outline', label: 'Address', value: store.address },
      { icon: 'call-outline', label: 'Phone', value: store.phone },
      { icon: 'mail-outline', label: 'Email', value: store.email },
      { icon: 'time-outline', label: 'Opening Hours', value: store.opening_hours },
      { icon: 'calendar-outline', label: 'Established', value: store.established_date },
    ].filter(item => item.value);

    return (
      <ScrollView style={styles.aboutContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.aboutContent}>
        <View style={styles.aboutCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>About Seller</Text>
            <Ionicons name="storefront-outline" size={20} color="#299e60" />
          </View>
          <Text style={styles.aboutText}>{description}</Text>
        </View>

        <View style={styles.aboutCard}>
          <Text style={styles.sectionTitle}>Store Information</Text>
          {infoRows.length > 0 ? (
            infoRows.map((row) => (
              <View key={row.label} style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name={row.icon as any} size={20} color="#299e60" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.aboutText}>No additional seller information available.</Text>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderEmptyProducts = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="cube-outline" size={58} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No products yet</Text>
      <Text style={styles.emptySubtitle}>This seller has not added products yet.</Text>
    </View>
  );

  if (isLoading) {
    return (
      <LinearGradient colors={['#e9fbf0', '#fff5df']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#299e60" />
        <Text style={styles.loadingText}>Loading seller store...</Text>
      </LinearGradient>
    );
  }

  if (!store) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.notFoundHeader}>
          <TouchableOpacity style={styles.headerIconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#12382b" />
          </TouchableOpacity>
          <Text style={styles.notFoundTitle}>Store Not Found</Text>
          <View style={styles.headerIconButtonPlaceholder} />
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="storefront-outline" size={58} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>Store not found</Text>
          <Text style={styles.emptySubtitle}>This seller may have been removed.</Text>
          <TouchableOpacity style={styles.backToStoresButton} onPress={() => router.push('/screens/stores')}>
            <Text style={styles.backToStoresText}>Browse All Stores</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {activeTab === 'products' ? (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[styles.productsContainer, products.length === 0 && styles.emptyProductsContainer]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#299e60']} tintColor="#299e60" />}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyProducts}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#299e60" />
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.container}>
          {renderHeader()}
          {renderAboutSection()}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F8F1',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#53665b',
    fontWeight: '700',
  },
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  heroGlowOne: {
    position: 'absolute',
    right: -48,
    top: 46,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(41,158,96,0.12)',
  },
  heroGlowTwo: {
    position: 'absolute',
    left: -42,
    bottom: 20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,169,41,0.14)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 12,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(41,158,96,0.1)',
  },
  headerIconButtonPlaceholder: {
    width: 42,
    height: 42,
  },
  heroTitle: {
    color: '#12382b',
    fontSize: 16,
    fontWeight: '900',
  },
  storeHeroCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#12382b',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 8,
  },
  storeBanner: {
    width: '100%',
    height: 122,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: -30,
  },
  logoOuter: {
    width: 78,
    height: 78,
    borderRadius: 24,
    padding: 4,
    backgroundColor: '#fff',
    shadowColor: '#12382b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  storeLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#EAF8EF',
  },
  storeIdentityText: {
    flex: 1,
    marginLeft: 13,
    paddingTop: 28,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeName: {
    flex: 1,
    color: '#12382b',
    fontSize: 21,
    fontWeight: '900',
  },
  storeSubtitle: {
    marginTop: 4,
    color: '#718077',
    fontSize: 12,
    fontWeight: '700',
  },
  storeDescription: {
    paddingHorizontal: 16,
    paddingTop: 12,
    color: '#4b5b52',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 9,
    padding: 16,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#F3F8F1',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  statValue: {
    color: '#12382b',
    fontSize: 15,
    fontWeight: '900',
  },
  statLabel: {
    color: '#7A887F',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },
  tabShell: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    marginHorizontal: 16,
    marginTop: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#12382b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#EAF8EF',
  },
  tabButtonActive: {
    backgroundColor: '#299e60',
  },
  tabText: {
    color: '#299e60',
    fontSize: 14,
    fontWeight: '900',
  },
  tabTextActive: {
    color: '#fff',
  },
  productsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  sectionTitle: {
    color: '#12382b',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionHint: {
    color: '#7A887F',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF8EF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortChipText: {
    color: '#299e60',
    fontSize: 12,
    fontWeight: '900',
  },
  productsContainer: {
    paddingBottom: 28,
  },
  emptyProductsContainer: {
    flexGrow: 1,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 22,
    marginBottom: 16,
    shadowColor: '#12382b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    backgroundColor: '#F3F8F1',
  },
  productImage: {
    width: '100%',
    height: PRODUCT_CARD_WIDTH,
  },
  discountBadge: {
    position: 'absolute',
    top: 9,
    left: 9,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#12382b',
    marginBottom: 8,
    lineHeight: 18,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#299e60',
  },
  originalPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#12382b',
  },
  reviewCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#299e60',
    paddingVertical: 11,
    gap: 5,
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
  },
  aboutContainer: {
    flex: 1,
  },
  aboutContent: {
    padding: 16,
    paddingBottom: 32,
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E6EFE8',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#4B5B52',
    lineHeight: 23,
    fontWeight: '500',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3EF',
  },
  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#EAF8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#7A887F',
    fontWeight: '800',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    color: '#12382b',
    fontWeight: '700',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 44,
  },
  emptyIconContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#EAF8EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#12382b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7A887F',
    textAlign: 'center',
    lineHeight: 20,
  },
  backToStoresButton: {
    marginTop: 22,
    backgroundColor: '#299e60',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
  },
  backToStoresText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
  notFoundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#e9fbf0',
  },
  notFoundTitle: {
    color: '#12382b',
    fontSize: 17,
    fontWeight: '900',
  },
  loadingMore: {
    paddingVertical: 22,
    alignItems: 'center',
  },
});
