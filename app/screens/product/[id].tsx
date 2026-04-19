import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PersistentTabBar from '@/components/ui/PersistentTabBar';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getProductById, getProducts } from '@/utils/api';
import { formatHtmlText } from '@/utils/htmlText';

const { width } = Dimensions.get('window');
const HERO_IMAGE_WIDTH = width - 48;
const API_BASE_URL = 'https://api.hetdcl.com';

interface ProductVariant {
  id: number;
  name: string;
  price: number;
  final_price: number;
  stock: number;
  available_stock?: number;
  sku?: string;
  image?: string;
  is_default?: boolean;
  discount?: {
    name: string;
    type: string;
    value: number;
    is_percentage: boolean;
  };
}

interface ProductImage {
  id: number;
  image: string;
  alt_text?: string;
  is_feature?: boolean;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  short_description?: string;
  brand?: string;
  subcategories?: any[];
  images?: ProductImage[];
  variants?: ProductVariant[];
  default_variant?: ProductVariant;
  store?: any;
  is_active?: boolean;
  related_products?: any[];
}

const formatPrice = (price: number) => `\u09F3${(price || 0).toLocaleString()}`;

const PRODUCT_BENEFITS = [
  { icon: 'shield-checkmark-outline', title: 'Authentic', subtitle: 'Verified items' },
  { icon: 'swap-horizontal-outline', title: 'Easy Return', subtitle: '7 day policy' },
  { icon: 'headset-outline', title: 'Support', subtitle: 'Always ready' },
] as const;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
    // Fetch only when route product id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    setRelatedProducts([]);
    setQuantity(1);
    setActiveImageIndex(0);
    try {
      __DEV__ && console.log('Fetching product:', id);
      const data = await getProductById(id);
      __DEV__ && console.log('Product data received:', JSON.stringify(data, null, 2));

      if (data) {
        setProduct(data);
        loadRelatedProducts(data);
        if (data.variants && data.variants.length > 0) {
          const defaultVariant = data.variants.find((v: ProductVariant) => v.is_default) || data.variants[0];
          setSelectedVariant(defaultVariant);
        } else if (data.default_variant) {
          setSelectedVariant(data.default_variant);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedProducts = async (productData: Product) => {
    const apiRelated =
      productData.related_products ||
      (productData as any).relatedProducts ||
      (productData as any).recommended_products ||
      [];

    if (Array.isArray(apiRelated) && apiRelated.length > 0) {
      setRelatedProducts(apiRelated.filter((item: any) => item?.id !== productData.id).slice(0, 8));
      return;
    }

    const categoryId =
      productData.subcategories?.[0]?.category?.id ||
      productData.subcategories?.[0]?.id ||
      null;

    try {
      const fallback = categoryId
        ? await getProducts(1, 8, categoryId)
        : await getProducts(1, 8);
      const fallbackProducts = fallback?.results || [];
      setRelatedProducts(fallbackProducts.filter((item: any) => item?.id !== productData.id).slice(0, 8));
    } catch (error) {
      console.error('Error loading related products:', error);
      setRelatedProducts([]);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const variant = selectedVariant || product.default_variant;
      const success = await addItem(product, quantity, variant);

      if (success) {
        Alert.alert('Added to cart', 'Product added successfully.', [
          { text: 'Keep Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
        ]);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const variant = selectedVariant || product.default_variant;
      const success = await addItem(product, quantity, variant);

      if (success) {
        router.push('/screens/checkout');
      }
    } catch (error) {
      console.error('Buy now error:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Check out ${product.name} on Sobarbazar!`,
        title: product.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;

    const variant = selectedVariant || product.default_variant;
    const price = variant?.final_price || variant?.price || 0;
    const imageUrl = getProductImage();

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price,
        image: imageUrl,
      });
    }
  };

  const getProductImage = () => {
    if (selectedVariant?.image) return selectedVariant.image;
    if (product?.images && product.images.length > 0) return product.images[0].image;
    if (product?.default_variant?.image) return product.default_variant.image;
    return 'https://via.placeholder.com/400';
  };

  const getImages = () => {
    if (selectedVariant?.image) {
      return [{ id: selectedVariant.id, image: selectedVariant.image }];
    }
    if (product?.images && product.images.length > 0) return product.images;
    if (product?.default_variant?.image) return [{ id: 0, image: product.default_variant.image }];
    return [{ id: 0, image: 'https://via.placeholder.com/400' }];
  };

  const ensureAbsoluteUrl = (url?: string | null): string => {
    if (!url) return 'https://via.placeholder.com/300x300/f3f8f1/299e60?text=Product';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getRelatedProductImage = (item: any): string => {
    const imageUrl =
      item?.default_variant?.image ||
      item?.images?.[0]?.image ||
      item?.images?.[0]?.image_url ||
      item?.variants?.[0]?.image ||
      item?.image ||
      item?.image_url ||
      item?.feature_image ||
      null;

    return ensureAbsoluteUrl(imageUrl);
  };

  const getRelatedProductPrice = (item: any): number => (
    item?.default_variant?.final_price ||
    item?.default_variant?.price ||
    item?.variants?.[0]?.final_price ||
    item?.variants?.[0]?.price ||
    item?.price ||
    0
  );

  const getRelatedProductOriginalPrice = (item: any): number => (
    item?.default_variant?.price ||
    item?.variants?.[0]?.price ||
    item?.original_price ||
    0
  );

  const handleRelatedProductPress = (item: any) => {
    if (!item?.id) return;
    router.push(`/screens/product/${item.id}`);
  };

  const variant = selectedVariant || product?.default_variant;
  const currentPrice = variant?.final_price || variant?.price || 0;
  const originalPrice = variant?.price || 0;
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : (variant?.discount?.is_percentage ? Math.round(variant.discount.value) : 0);

  const isWishlisted = product ? isInWishlist(product.id) : false;
  const stockCount = variant?.available_stock || variant?.stock || 0;
  const inStock = variant ? stockCount > 0 : true;
  const maxQuantity = variant?.available_stock || variant?.stock || 10;

  if (isLoading) {
    return (
      <LinearGradient colors={['#eefbf3', '#fffaf0']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#299e60" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </LinearGradient>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const images = getImages();
  const productDescription = formatHtmlText(product.description || product.short_description);
  const categoryName = product.subcategories?.[0]?.name || product.subcategories?.[0]?.category?.name;
  const totalPrice = currentPrice * quantity;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#eefbf3" />

      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#12382b" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerEyebrow}>Product Details</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={21} color="#12382b" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={['#e9fbf0', '#fff6e7']} style={styles.heroSection}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroImageCard}>
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / HERO_IMAGE_WIDTH);
                setActiveImageIndex(index);
              }}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                  contentFit="contain"
                />
              )}
              keyExtractor={(item, index) => `img-${item.id || index}`}
            />

            {discountPercent > 0 && (
              <View style={styles.discountBadge}>
                <Ionicons name="flash" size={13} color="#fff" />
                <Text style={styles.discountText}>Save {discountPercent}%</Text>
              </View>
            )}

            <TouchableOpacity style={styles.wishlistButton} onPress={handleToggleWishlist}>
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={23}
                color={isWishlisted ? '#EF4444' : '#12382b'}
              />
            </TouchableOpacity>

            {images.length > 1 && (
              <View style={styles.indicators}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === activeImageIndex && styles.indicatorActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.contentWrap}>
          <View style={styles.productCard}>
            <View style={styles.tagContainer}>
              {product.brand ? (
                <View style={styles.brandTag}>
                  <Ionicons name="ribbon-outline" size={13} color="#166534" />
                  <Text style={styles.brandTagText}>{product.brand}</Text>
                </View>
              ) : null}
              {categoryName ? (
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{categoryName}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.productTitle}>{product.name}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>{formatPrice(currentPrice)}</Text>
              {hasDiscount ? <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text> : null}
              {discountPercent > 0 ? (
                <View style={styles.pricePill}>
                  <Text style={styles.pricePillText}>{discountPercent}% OFF</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.metaRow}>
              <View style={[styles.stockBadge, inStock ? styles.inStockBadge : styles.outOfStockBadge]}>
                <Ionicons
                  name={inStock ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={inStock ? '#15803D' : '#DC2626'}
                />
                <Text style={[styles.stockText, inStock ? styles.inStockText : styles.outOfStockText]}>
                  {inStock ? `${stockCount || 'Ready'} in stock` : 'Out of stock'}
                </Text>
              </View>
              {variant?.sku ? (
                <View style={styles.skuPill}>
                  <Text style={styles.skuText}>SKU {variant.sku}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.benefitGrid}>
            {PRODUCT_BENEFITS.map((benefit) => (
              <View key={benefit.title} style={styles.benefitCard}>
                <View style={styles.benefitIconWrap}>
                  <Ionicons name={benefit.icon as any} size={19} color="#299e60" />
                </View>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitSubtitle}>{benefit.subtitle}</Text>
              </View>
            ))}
          </View>

          {product.variants && product.variants.length > 1 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Choose Variant</Text>
                <Text style={styles.sectionHint}>{product.variants.length} options</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantScroll}>
                {product.variants.map((v) => {
                  const variantStock = v.available_stock || v.stock || 0;
                  const isSelected = selectedVariant?.id === v.id;
                  const isDisabled = variantStock === 0;

                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[
                        styles.variantButton,
                        isSelected && styles.variantButtonActive,
                        isDisabled && styles.variantButtonDisabled,
                      ]}
                      onPress={() => !isDisabled && setSelectedVariant(v)}
                      disabled={isDisabled}
                    >
                      <Text style={[styles.variantButtonText, isSelected && styles.variantButtonTextActive]} numberOfLines={1}>
                        {v.name}
                      </Text>
                      <Text style={[styles.variantPrice, isSelected && styles.variantPriceActive]}>
                        {formatPrice(v.final_price || v.price)}
                      </Text>
                      {isDisabled ? <Text style={styles.variantOutOfStock}>Out of stock</Text> : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.sectionCard}>
            <View style={styles.quantityHeader}>
              <View>
                <Text style={styles.sectionTitle}>Quantity</Text>
                <Text style={styles.quantityHint}>Total {formatPrice(totalPrice)}</Text>
              </View>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={20} color={quantity <= 1 ? '#9CA3AF' : '#12382b'} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.quantityButton, quantity >= maxQuantity && styles.quantityButtonDisabled]}
                  onPress={() => quantity < maxQuantity && setQuantity(quantity + 1)}
                  disabled={quantity >= maxQuantity}
                >
                  <Ionicons name="add" size={20} color={quantity >= maxQuantity ? '#9CA3AF' : '#fff'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {product.store && (
            <TouchableOpacity
              style={styles.storeSection}
              onPress={() => router.push(`/screens/store/${product.store.id}`)}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: product.store.logo || 'https://via.placeholder.com/60' }}
                style={styles.storeLogo}
                contentFit="cover"
              />
              <View style={styles.storeInfo}>
                <Text style={styles.storeLabel}>Sold by</Text>
                <Text style={styles.storeName}>{product.store.name}</Text>
              </View>
              <View style={styles.storeCta}>
                <Text style={styles.storeCtaText}>Visit</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          )}

          {productDescription.length > 0 && (
            <View style={styles.descriptionSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Ionicons name="document-text-outline" size={20} color="#299e60" />
              </View>
              <Text style={styles.descriptionText}>{productDescription}</Text>
            </View>
          )}

          {relatedProducts.length > 0 ? (
            <View style={styles.relatedSection}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Related Products</Text>
                  <Text style={styles.sectionHint}>You may also like these</Text>
                </View>
                <TouchableOpacity style={styles.relatedViewAll} onPress={() => router.push('/(tabs)/shop')}>
                  <Text style={styles.relatedViewAllText}>View All</Text>
                  <Ionicons name="arrow-forward" size={14} color="#299e60" />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
                {relatedProducts.map((item) => {
                  const relatedPrice = getRelatedProductPrice(item);
                  const relatedOriginalPrice = getRelatedProductOriginalPrice(item);
                  const hasRelatedDiscount = relatedOriginalPrice > relatedPrice && relatedPrice > 0;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.relatedCard}
                      onPress={() => handleRelatedProductPress(item)}
                      activeOpacity={0.88}
                    >
                      <View style={styles.relatedImageWrap}>
                        <Image
                          source={{ uri: getRelatedProductImage(item) }}
                          style={styles.relatedImage}
                          contentFit="cover"
                        />
                        {hasRelatedDiscount ? (
                          <View style={styles.relatedDiscountBadge}>
                            <Text style={styles.relatedDiscountText}>
                              {Math.round(((relatedOriginalPrice - relatedPrice) / relatedOriginalPrice) * 100)}% OFF
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.relatedInfo}>
                        <Text style={styles.relatedName} numberOfLines={2}>
                          {item.name || item.title || 'Product'}
                        </Text>
                        <View style={styles.relatedPriceRow}>
                          <Text style={styles.relatedPrice}>{formatPrice(relatedPrice)}</Text>
                          {hasRelatedDiscount ? (
                            <Text style={styles.relatedOriginalPrice}>{formatPrice(relatedOriginalPrice)}</Text>
                          ) : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceBox}>
          <Text style={styles.bottomPriceLabel}>Payable</Text>
          <Text style={styles.bottomPrice}>{formatPrice(totalPrice || currentPrice)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.addToCartButton, (!inStock || addingToCart) && styles.buttonDisabled]}
          onPress={handleAddToCart}
          disabled={!inStock || addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color="#299e60" size="small" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={21} color="#299e60" />
              <Text style={styles.addToCartText}>Cart</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buyNowTouchable, (!inStock || addingToCart) && styles.buttonDisabled]}
          onPress={handleBuyNow}
          disabled={!inStock || addingToCart}
        >
          <LinearGradient colors={['#2fb36d', '#197a49']} style={styles.buyNowButton}>
            <Text style={styles.buyNowText}>Buy Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <PersistentTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F8F1',
  },
  headerSafeArea: {
    backgroundColor: '#eefbf3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(22,101,52,0.08)',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerEyebrow: {
    fontSize: 12,
    color: '#299e60',
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  headerTitle: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '800',
    color: '#12382b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#5B6B61',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#299e60',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 220,
  },
  heroSection: {
    minHeight: 340,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 34,
    overflow: 'hidden',
  },
  heroGlowOne: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(41,158,96,0.13)',
    top: 20,
    right: -44,
  },
  heroGlowTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,169,41,0.14)',
    bottom: 16,
    left: -32,
  },
  heroImageCard: {
    width: HERO_IMAGE_WIDTH,
    height: 306,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#145a34',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 9,
  },
  productImage: {
    width: HERO_IMAGE_WIDTH,
    height: 306,
    backgroundColor: '#FFFFFF',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  wishlistButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#C8D5CC',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#299e60',
    width: 24,
  },
  contentWrap: {
    marginTop: -24,
    paddingHorizontal: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    shadowColor: '#145a34',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 5,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  brandTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF8EF',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  brandTagText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '800',
  },
  categoryTag: {
    backgroundColor: '#FFF3DB',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  categoryTagText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '800',
  },
  productTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#102A21',
    lineHeight: 31,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  currentPrice: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1b995a',
    letterSpacing: -0.5,
  },
  originalPrice: {
    fontSize: 17,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '700',
  },
  pricePill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pricePillText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
  },
  inStockBadge: {
    backgroundColor: '#ECFDF3',
  },
  outOfStockBadge: {
    backgroundColor: '#FEF2F2',
  },
  stockText: {
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  inStockText: {
    color: '#15803D',
  },
  outOfStockText: {
    color: '#DC2626',
  },
  skuPill: {
    maxWidth: 132,
    backgroundColor: '#F4F6F5',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 14,
  },
  skuText: {
    fontSize: 11,
    color: '#65736A',
    fontWeight: '800',
  },
  benefitGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  benefitCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EFE8',
  },
  benefitIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF8EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  benefitTitle: {
    color: '#12382b',
    fontSize: 12,
    fontWeight: '900',
  },
  benefitSubtitle: {
    color: '#7A887F',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E6EFE8',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#12382b',
  },
  sectionHint: {
    fontSize: 12,
    color: '#7A887F',
    fontWeight: '700',
  },
  variantScroll: {
    paddingRight: 8,
  },
  variantButton: {
    minWidth: 116,
    minHeight: 82,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#DCE7DF',
    marginRight: 10,
    justifyContent: 'center',
    backgroundColor: '#FAFCFA',
  },
  variantButtonActive: {
    borderColor: '#299e60',
    backgroundColor: '#EAF8EF',
  },
  variantButtonDisabled: {
    opacity: 0.45,
  },
  variantButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#263C32',
  },
  variantButtonTextActive: {
    color: '#166534',
  },
  variantPrice: {
    fontSize: 12,
    color: '#7A887F',
    fontWeight: '800',
    marginTop: 6,
  },
  variantPriceActive: {
    color: '#299e60',
  },
  variantOutOfStock: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '700',
    marginTop: 4,
  },
  quantityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityHint: {
    marginTop: 4,
    color: '#7A887F',
    fontSize: 12,
    fontWeight: '700',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F7F4',
    borderRadius: 18,
    padding: 4,
  },
  quantityButton: {
    width: 38,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.45,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#12382b',
    marginHorizontal: 15,
    minWidth: 24,
    textAlign: 'center',
  },
  storeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12382b',
    borderRadius: 24,
    padding: 14,
    marginTop: 14,
  },
  storeLogo: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
  storeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  storeLabel: {
    fontSize: 11,
    color: '#BFE8CD',
    fontWeight: '800',
  },
  storeName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  storeCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#299e60',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
  },
  storeCtaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  descriptionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E6EFE8',
  },
  descriptionText: {
    fontSize: 15,
    color: '#4B5B52',
    lineHeight: 25,
    fontWeight: '500',
  },
  relatedSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 18,
    paddingLeft: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E6EFE8',
  },
  relatedViewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF8EF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 18,
  },
  relatedViewAllText: {
    color: '#299e60',
    fontSize: 12,
    fontWeight: '900',
  },
  relatedScroll: {
    paddingRight: 18,
    gap: 12,
  },
  relatedCard: {
    width: 154,
    backgroundColor: '#FAFCFA',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5EFE8',
  },
  relatedImageWrap: {
    width: '100%',
    height: 132,
    backgroundColor: '#F3F8F1',
    position: 'relative',
  },
  relatedImage: {
    width: '100%',
    height: '100%',
  },
  relatedDiscountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  relatedDiscountText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  relatedInfo: {
    padding: 12,
  },
  relatedName: {
    color: '#12382b',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    minHeight: 36,
  },
  relatedPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 9,
  },
  relatedPrice: {
    color: '#299e60',
    fontSize: 15,
    fontWeight: '900',
  },
  relatedOriginalPrice: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'line-through',
  },
  bottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 70,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 28,
    shadowColor: '#12382b',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    gap: 10,
  },
  bottomPriceBox: {
    minWidth: 82,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: '#7A887F',
    fontWeight: '800',
  },
  bottomPrice: {
    marginTop: 2,
    fontSize: 19,
    fontWeight: '900',
    color: '#12382b',
  },
  addToCartButton: {
    minWidth: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 15,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#299e60',
    backgroundColor: '#F3FBF6',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#299e60',
  },
  buyNowTouchable: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  buyNowButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
});
