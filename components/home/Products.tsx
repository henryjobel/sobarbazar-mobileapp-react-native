// components/home/Products.tsx - Fixed for Expo Router and backend data structure
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCartNotification } from '../../context/CartNotificationContext';
import { getExclusiveProducts } from '../../utils/api';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2;

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

interface ProductType {
  id: number;
  name: string;
  description?: string;
  default_variant?: ProductVariant;
  variants?: ProductVariant[];
  images?: { id: number; image: string }[];
  rating?: number;
  unit?: string;
  category?: {
    id: number;
    name: string;
  };
  brand?: {
    id: number;
    name: string;
  };
  store?: {
    id: number;
    name: string;
  };
  subcategories?: {
    id: number;
    name: string;
    category: {
      id: number;
      name: string;
    };
  }[];
}

interface ProductsProps {
  recommendedProducts?: ProductType[];
}

// Unified list item — either a regular product or an exclusive one
type ListItem =
  | ({ _type: 'regular' } & ProductType)
  | { _type: 'exclusive'; id: number; name: string; image?: string; image_url?: string; unit_price?: number; display_price?: number; regular_price?: number; selling_price?: string; discount_amount?: number; product_type?: string; is_variable?: boolean; qty?: number; stock_quantity?: number; product_images?: any[] };

const Products = ({ recommendedProducts }: ProductsProps) => {
  const router = useRouter();
  const { addItem, addDropshippingItem, itemCount } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showNotification, setNavigateToCart } = useCartNotification();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [exclusives, setExclusives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [addingExclusive, setAddingExclusive] = useState<number | null>(null);

  // Interleave: insert 2 exclusive cards after every 4 regular cards
  const buildMixedList = (regularList: ProductType[], exclusiveList: any[]): ListItem[] => {
    const result: ListItem[] = [];
    let eIdx = 0;
    for (let i = 0; i < regularList.length; i++) {
      result.push({ _type: 'regular', ...regularList[i] });
      if ((i + 1) % 4 === 0 && eIdx < exclusiveList.length) {
        result.push({ _type: 'exclusive', ...exclusiveList[eIdx++] });
        if (eIdx < exclusiveList.length) {
          result.push({ _type: 'exclusive', ...exclusiveList[eIdx++] });
        }
      }
    }
    // Append remaining exclusives at the end if any
    while (eIdx < exclusiveList.length) {
      result.push({ _type: 'exclusive', ...exclusiveList[eIdx++] });
    }
    return result;
  };

  // Set up navigation callback for cart notification
  useEffect(() => {
    setNavigateToCart(() => router.push('/(tabs)/cart'));
  }, [router, setNavigateToCart]);

  // সরাসরি fetch ফাংশন
  const fetchProductsDirectly = async (pageNum = 1) => {
    try {
      const url = `https://api.hetdcl.com/api/v1.0/customers/products/?pagination=1&page=${pageNum}&page_size=20`;
      __DEV__ && __DEV__ && console.log("🚀 Direct fetch from:", url);
      
      const response = await fetch(url);
      __DEV__ && __DEV__ && console.log("📊 Response status:", response.status);
      
      if (!response.ok) {
        __DEV__ && __DEV__ && console.log("❌ Fetch failed with status:", response.status);
        return [];
      }
      
      const text = await response.text();
      __DEV__ && __DEV__ && console.log("📦 Full response received, length:", text.length);
      
      const json = JSON.parse(text);
      __DEV__ && __DEV__ && console.log("✅ JSON parsed successfully");
      __DEV__ && __DEV__ && console.log("📊 JSON keys:", Object.keys(json));
      __DEV__ && __DEV__ && console.log("📊 Has success:", json.success);
      __DEV__ && __DEV__ && console.log("📊 Has data:", !!json.data);
      
      // Structure: {success: true, message: "Status OK", data: {count: 12, next: null, previous: null, results: [...]}}
      if (json.success && json.data && json.data.results && Array.isArray(json.data.results)) {
        __DEV__ && __DEV__ && console.log(`🎉 Found ${json.data.results.length} products in data.results`);
        
        // Show first product details for debugging
        if (json.data.results.length > 0) {
          const firstProduct = json.data.results[0];
          __DEV__ && __DEV__ && console.log("🔍 First product details:", {
            id: firstProduct.id,
            name: firstProduct.name,
            price: firstProduct.price,
            hasImages: !!firstProduct.images,
            imagesCount: firstProduct.images?.length || 0,
            subcategories: firstProduct.subcategories?.length || 0
          });
        }
        
        return json.data.results;
      } else {
        __DEV__ && __DEV__ && console.log("⚠️ Unexpected structure");
        __DEV__ && __DEV__ && console.log("📊 Full response:", JSON.stringify(json, null, 2));
        return [];
      }
    } catch (error) {
      __DEV__ && __DEV__ && console.log("❌ Fetch error:", error);
      return [];
    }
  };

  // Load products function
  const loadProducts = async (pageNum = 1, isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        if (pageNum === 1) setLoading(true);
      }

      __DEV__ && __DEV__ && console.log(`🔄 Loading page ${pageNum}...`);
      
      // Fetch regular products + exclusive on first page
      const [data, exclusiveData] = await Promise.all([
        fetchProductsDirectly(pageNum),
        pageNum === 1 ? getExclusiveProducts(1, 20).catch(() => ({ results: [] })) : Promise.resolve(null),
      ]);

      __DEV__ && __DEV__ && console.log(`📊 Received ${data?.length || 0} products`);
      
      if (data && Array.isArray(data) && data.length > 0) {
        const transformedData = data.map((item: any) => ({
          id: item.id,
          name: item.name || 'No Name',
          description: item.description,
          default_variant: item.default_variant,
          variants: item.variants,
          images: item.images || [],
          rating: item.rating || 0,
          unit: item.unit || 'piece',
          category: item.category,
          brand: item.brand,
          store: item.store,
          subcategories: item.subcategories || [],
        }));

        if (pageNum === 1) {
          setProducts(transformedData);
        } else {
          setProducts(prev => [...prev, ...transformedData]);
        }
        setHasMore(data.length >= 20);
      } else {
        if (pageNum === 1) setProducts([]);
        setHasMore(false);
      }

      if (exclusiveData && pageNum === 1) {
        setExclusives(exclusiveData.results || []);
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProducts(1);
    // Load the first page once; pagination and refresh call loadProducts explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load more products
  const loadMore = () => {
    if (!loading && hasMore && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage);
    }
  };

  // Refresh products
  const onRefresh = () => {
    setPage(1);
    setHasMore(true);
    loadProducts(1, true);
  };

  // Handle product press - use Expo Router
  const handleProductPress = (product: ProductType & { is_exclusive?: boolean; exclusive_id?: number }) => {
    __DEV__ && __DEV__ && console.log("👉 Product pressed:", product.id, product.name);
    if (product.is_exclusive) {
      const exclusiveId = product.exclusive_id || product.id;
      router.push(`/screens/exclusive/${exclusiveId}`);
    } else {
      router.push(`/screens/product/${product.id}`);
    }
  };

  // Handle add to cart - using CartContext with nice popup
  const handleAddToCart = async (product: ProductType) => {
    if (addingToCart === product.id) return; // Prevent double-tap

    setAddingToCart(product.id);
    __DEV__ && __DEV__ && console.log('🛒 Adding to cart:', product.id, product.name);

    try {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: getPrice(product),
        image: getImageUrl(product),
        variants: product.variants,
      };

      const success = await addItem(cartProduct, 1, product.default_variant);

      if (success) {
        // Show beautiful cart notification popup
        showNotification(
          {
            name: product.name,
            price: getPrice(product),
            image: getImageUrl(product),
          },
          itemCount + 1
        );
      }
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  // Handle favorite toggle - using WishlistContext
  const handleToggleFavorite = (product: ProductType) => {
    const productData = {
      id: product.id,
      name: product.name,
      price: getPrice(product),
      image: getImageUrl(product),
    };

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      __DEV__ && __DEV__ && console.log('💔 Removed from wishlist:', product.id);
    } else {
      addToWishlist(productData);
      __DEV__ && __DEV__ && console.log('❤️ Added to wishlist:', product.id);
    }
  };

  // Base URL for images
  const BASE_URL = 'https://api.hetdcl.com';

  // Ensure URL is absolute
  const ensureAbsoluteUrl = (url: string | undefined | null): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Handle relative URLs
    if (url.startsWith('/')) {
      return `${BASE_URL}${url}`;
    }
    return `${BASE_URL}/${url}`;
  };

  // Get image URL - handle backend structure
  const getImageUrl = (item: ProductType): string => {
    let imageUrl: string | null = null;

    // Try default_variant image first
    if (item.default_variant?.image) {
      imageUrl = ensureAbsoluteUrl(item.default_variant.image);
      if (imageUrl) return imageUrl;
    }

    // Try images array
    if (item.images && item.images.length > 0) {
      const firstImage = item.images[0];
      if (typeof firstImage === 'string') {
        imageUrl = ensureAbsoluteUrl(firstImage);
      } else if (firstImage?.image) {
        imageUrl = ensureAbsoluteUrl(firstImage.image);
      }
      if (imageUrl) return imageUrl;
    }

    // Try first variant image
    if (item.variants && item.variants.length > 0 && item.variants[0]?.image) {
      imageUrl = ensureAbsoluteUrl(item.variants[0].image);
      if (imageUrl) return imageUrl;
    }

    // Try supplier_product image (some API responses nest images here)
    const supplierProduct = (item as any).supplier_product;
    if (supplierProduct?.images && supplierProduct.images.length > 0) {
      const spImage = supplierProduct.images[0];
      if (typeof spImage === 'string') {
        imageUrl = ensureAbsoluteUrl(spImage);
      } else if (spImage?.image) {
        imageUrl = ensureAbsoluteUrl(spImage.image);
      }
      if (imageUrl) return imageUrl;
    }

    // Try direct image field
    if ((item as any).image) {
      imageUrl = ensureAbsoluteUrl((item as any).image);
      if (imageUrl) return imageUrl;
    }

    return 'https://via.placeholder.com/300x300/cccccc/969696?text=No+Image';
  };

  // Get category name
  const getCategoryName = (item: ProductType): string => {
    if (item.category?.name) return item.category.name;
    if (item.subcategories?.[0]?.category?.name) return item.subcategories[0].category.name;
    if (item.brand?.name) return item.brand.name;
    if (item.store?.name) return item.store.name;
    return '';
  };

  // Get price from default_variant
  const getPrice = (item: ProductType): number => {
    return item.default_variant?.final_price || item.default_variant?.price || 0;
  };

  // Get original price
  const getOriginalPrice = (item: ProductType): number => {
    return item.default_variant?.price || 0;
  };

  // Check if has discount
  const hasDiscount = (item: ProductType): boolean => {
    const variant = item.default_variant;
    if (!variant) return false;
    return !!(variant.discount || (variant.price > variant.final_price));
  };

  // Get discount percentage
  const getDiscountPercentage = (item: ProductType): number => {
    const variant = item.default_variant;
    if (!variant) return 0;

    if (variant.discount?.is_percentage) {
      return variant.discount.value;
    }

    if (variant.price > variant.final_price) {
      return Math.round(((variant.price - variant.final_price) / variant.price) * 100);
    }

    return 0;
  };

  // Render product item
  const renderProduct = ({ item }: { item: ListItem }) => {
    // ── Exclusive / RAKAMARI card ──────────────────────────────────────────
    if (item._type === 'exclusive') {
      const price = item.unit_price || item.display_price || 0;
      const imgUrl = item.image || item.image_url || 'https://via.placeholder.com/300';
      const isVar = item.product_type === 'variable' || item.is_variable;
      const isAdding = addingExclusive === item.id;

      return (
        <TouchableOpacity
          style={styles.productContainer}
          onPress={() => router.push(`/screens/exclusive/${item.id}` as any)}
          activeOpacity={0.7}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imgUrl }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.exclusiveBadgeOnCard}>
              <Text style={styles.exclusiveBadgeText}>RAKAMARI</Text>
            </View>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.categoryText} numberOfLines={1}>Rakamari</Text>
            <Text style={styles.nameText} numberOfLines={2}>{item.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>৳{price.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={[styles.addToCartButton, isAdding && styles.addingButton]}
              onPress={async () => {
                if (isVar) { router.push(`/screens/exclusive/${item.id}` as any); return; }
                setAddingExclusive(item.id);
                try {
                  const imgId = item.product_images?.[0]?.id || 0;
                  await addDropshippingItem({ productId: item.id, droplooImageId: imgId, unitPrice: price, quantity: 1, name: item.name, image: imgUrl });
                } catch {} finally { setAddingExclusive(null); }
              }}
              disabled={isAdding}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="cart-outline" size={16} color="#fff" />
                  <Text style={styles.addToCartText}>{isVar ? 'Select' : 'Add'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }

    // ── Regular product card ───────────────────────────────────────────────
    const isFavorite = isInWishlist(item.id);
    const stock = item.default_variant?.available_stock ?? item.default_variant?.stock ?? 10;
    const isOutOfStock = stock <= 0;

    // Get prices using helper functions
    const price = getPrice(item);
    const originalPrice = getOriginalPrice(item);
    const discountPercent = getDiscountPercentage(item);
    const showDiscount = hasDiscount(item) && discountPercent > 0;

    // Format prices
    const formattedPrice = `৳${price.toLocaleString()}`;
    const formattedOriginalPrice = `৳${originalPrice.toLocaleString()}`;

    // Get image URL and category
    const imageUrl = getImageUrl(item);
    const categoryName = getCategoryName(item);

    return (
      <TouchableOpacity
        style={[styles.productContainer, isOutOfStock && styles.outOfStock]}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.7}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />

          {/* Discount Badge */}
          {showDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleToggleFavorite(item)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#FF6B6B" : "#666"}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Category/Brand */}
          {categoryName ? (
            <Text style={styles.categoryText} numberOfLines={1}>
              {categoryName}
            </Text>
          ) : null}

          {/* Product Name */}
          <Text style={styles.nameText} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{formattedPrice}</Text>

            {showDiscount && originalPrice > price && (
              <Text style={styles.originalPriceText}>
                {formattedOriginalPrice}
              </Text>
            )}
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              isOutOfStock && styles.disabledButton,
              addingToCart === item.id && styles.addingButton
            ]}
            onPress={() => !isOutOfStock && handleAddToCart(item)}
            disabled={isOutOfStock || addingToCart === item.id}
          >
            {addingToCart === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cart-outline" size={16} color="#fff" />
                <Text style={styles.addToCartText}>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading indicator
  if (loading && products.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Products</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Products</Text>
        <Text style={styles.productCount}>({products.length + exclusives.length} items)</Text>
      </View>

      {/* Products Grid */}
      {(() => {
        const mixedList = buildMixedList(products, exclusives);
        return mixedList.length > 0 ? (
          <>
            <View style={styles.productsGrid}>
              {mixedList.map((item: ListItem) => (
                <React.Fragment key={`${item._type}-${item.id}`}>
                  {renderProduct({ item })}
                </React.Fragment>
              ))}
            </View>

            {loading && products.length > 0 ? (
              <View style={styles.footerContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.footerText}>Loading more...</Text>
              </View>
            ) : null}

            {!loading && hasMore ? (
              <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No products available</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRefresh}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryText}>Refresh Products</Text>
            </TouchableOpacity>
          </View>
        );
      })()}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  productCount: {
    fontSize: 12,
    color: '#666',
  },
  exclusiveBadgeOnCard: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#1a3c34',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  exclusiveBadgeText: {
    color: '#f59e0b',
    fontSize: 9,
    fontWeight: 'bold',
  },
  productContainer: {
    width: itemWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: itemWidth,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContainer: {
    padding: 12,
  },
  categoryText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    height: 40,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  originalPriceText: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  addingButton: {
    backgroundColor: '#66BB6A',
  },
  row: {
    justifyContent: 'space-between',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  footerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  loadMoreButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 10,
    gap: 6,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  outOfStock: {
    opacity: 0.7,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
});

export default Products;
