import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getProductById } from '@/utils/api';
import PersistentTabBar from '@/components/ui/PersistentTabBar';

const { width } = Dimensions.get('window');

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

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching product:', id);
      const data = await getProductById(id);
      console.log('Product data received:', JSON.stringify(data, null, 2));

      if (data) {
        setProduct(data);
        // Set default variant
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

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const variant = selectedVariant || product.default_variant;

      // Call addItem with correct parameters: (product, quantity, variant)
      const success = await addItem(product, quantity, variant);

      if (success) {
        Alert.alert('Success', 'Product added to cart!', [
          { text: 'Continue Shopping', style: 'cancel' },
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

      // Call addItem with correct parameters: (product, quantity, variant)
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
        price: price,
        image: imageUrl,
      });
    }
  };

  const getProductImage = () => {
    // Try variant image first
    if (selectedVariant?.image) {
      return selectedVariant.image;
    }
    // Try product images
    if (product?.images && product.images.length > 0) {
      return product.images[0].image;
    }
    // Try default variant image
    if (product?.default_variant?.image) {
      return product.default_variant.image;
    }
    return 'https://via.placeholder.com/400';
  };

  const getImages = () => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    // Create a fallback image array
    const fallbackImage = selectedVariant?.image || product?.default_variant?.image;
    if (fallbackImage) {
      return [{ id: 0, image: fallbackImage }];
    }
    return [{ id: 0, image: 'https://via.placeholder.com/400' }];
  };

  // Get price info
  const variant = selectedVariant || product?.default_variant;
  const currentPrice = variant?.final_price || variant?.price || 0;
  const originalPrice = variant?.price || 0;
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : (variant?.discount?.is_percentage ? Math.round(variant.discount.value) : 0);

  const isWishlisted = product ? isInWishlist(product.id) : false;
  const inStock = variant ? (variant.available_stock || variant.stock || 0) > 0 : true;
  const maxQuantity = variant?.available_stock || variant?.stock || 10;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#299e60" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </SafeAreaView>
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.image }}
                style={styles.productImage}
                contentFit="cover"
              />
            )}
            keyExtractor={(item, index) => `img-${item.id || index}`}
          />

          {/* Image Indicators */}
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

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          )}

          {/* Wishlist Button */}
          <TouchableOpacity style={styles.wishlistButton} onPress={handleToggleWishlist}>
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={24}
              color={isWishlisted ? '#EF4444' : '#374151'}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Brand & Category */}
          <View style={styles.tagContainer}>
            {product.brand && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{product.brand}</Text>
              </View>
            )}
            {product.subcategories && product.subcategories.length > 0 && (
              <View style={[styles.tag, styles.categoryTag]}>
                <Text style={[styles.tagText, styles.categoryTagText]}>
                  {product.subcategories[0]?.name || product.subcategories[0]?.category?.name}
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>৳{currentPrice.toLocaleString()}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>৳{originalPrice.toLocaleString()}</Text>
            )}
          </View>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <View style={[styles.stockBadge, inStock ? styles.inStockBadge : styles.outOfStockBadge]}>
              <Ionicons
                name={inStock ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={inStock ? '#299e60' : '#EF4444'}
              />
              <Text style={[styles.stockText, inStock ? styles.inStockText : styles.outOfStockText]}>
                {inStock ? `In Stock (${variant?.available_stock || variant?.stock || 0})` : 'Out of Stock'}
              </Text>
            </View>
            {variant?.sku && (
              <Text style={styles.skuText}>SKU: {variant.sku}</Text>
            )}
          </View>

          {/* Variants */}
          {product.variants && product.variants.length > 1 && (
            <View style={styles.variantsSection}>
              <Text style={styles.sectionTitle}>Select Variant</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {product.variants.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.variantButton,
                      selectedVariant?.id === v.id && styles.variantButtonActive,
                      (v.available_stock || v.stock || 0) === 0 && styles.variantButtonDisabled,
                    ]}
                    onPress={() => (v.available_stock || v.stock || 0) > 0 && setSelectedVariant(v)}
                    disabled={(v.available_stock || v.stock || 0) === 0}
                  >
                    <Text
                      style={[
                        styles.variantButtonText,
                        selectedVariant?.id === v.id && styles.variantButtonTextActive,
                        (v.available_stock || v.stock || 0) === 0 && styles.variantButtonTextDisabled,
                      ]}
                    >
                      {v.name}
                    </Text>
                    <Text style={styles.variantPrice}>৳{v.final_price || v.price}</Text>
                    {(v.available_stock || v.stock || 0) === 0 && (
                      <Text style={styles.variantOutOfStock}>Out of Stock</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={24} color={quantity <= 1 ? '#9CA3AF' : '#374151'} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.quantityButton, quantity >= maxQuantity && styles.quantityButtonDisabled]}
                onPress={() => quantity < maxQuantity && setQuantity(quantity + 1)}
                disabled={quantity >= maxQuantity}
              >
                <Ionicons name="add" size={24} color={quantity >= maxQuantity ? '#9CA3AF' : '#374151'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          {(product.description || product.short_description) && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>
                {product.description || product.short_description}
              </Text>
            </View>
          )}

          {/* Store Info */}
          {product.store && (
            <TouchableOpacity
              style={styles.storeSection}
              onPress={() => router.push(`/screens/store/${product.store.id}`)}
            >
              <Image
                source={{ uri: product.store.logo || 'https://via.placeholder.com/50' }}
                style={styles.storeLogo}
                contentFit="cover"
              />
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{product.store.name}</Text>
                <Text style={styles.storeLink}>Visit Store →</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Features */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <MaterialIcons name="local-shipping" size={24} color="#299e60" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Free Delivery</Text>
                <Text style={styles.featureSubtitle}>Orders over ৳1000</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="verified" size={24} color="#299e60" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Genuine Products</Text>
                <Text style={styles.featureSubtitle}>100% Authentic</Text>
              </View>
            </View>
            <View style={[styles.featureItem, { borderBottomWidth: 0 }]}>
              <MaterialIcons name="autorenew" size={24} color="#299e60" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Easy Returns</Text>
                <Text style={styles.featureSubtitle}>7 Days Return Policy</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.addToCartButton, (!inStock || addingToCart) && styles.buttonDisabled]}
          onPress={handleAddToCart}
          disabled={!inStock || addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color="#299e60" size="small" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={22} color="#299e60" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buyNowButton, (!inStock || addingToCart) && styles.buyNowButtonDisabled]}
          onPress={handleBuyNow}
          disabled={!inStock || addingToCart}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* Persistent Tab Bar */}
      <PersistentTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerSafeArea: {
    backgroundColor: '#fff',
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
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
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#fff',
  },
  productImage: {
    width: width,
    height: width,
    backgroundColor: '#F3F4F6',
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#299e60',
    width: 24,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  wishlistButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryTag: {
    backgroundColor: '#DCFCE7',
  },
  categoryTagText: {
    color: '#299e60',
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 30,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#299e60',
  },
  originalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inStockBadge: {
    backgroundColor: '#DCFCE7',
  },
  outOfStockBadge: {
    backgroundColor: '#FEE2E2',
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  inStockText: {
    color: '#299e60',
  },
  outOfStockText: {
    color: '#EF4444',
  },
  skuText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  variantsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  variantButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  variantButtonActive: {
    borderColor: '#299e60',
    backgroundColor: '#F0FDF4',
  },
  variantButtonDisabled: {
    opacity: 0.5,
  },
  variantButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  variantButtonTextActive: {
    color: '#299e60',
  },
  variantButtonTextDisabled: {
    color: '#9CA3AF',
  },
  variantPrice: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  variantOutOfStock: {
    fontSize: 10,
    color: '#EF4444',
    marginTop: 2,
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  storeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  storeLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  storeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  storeLink: {
    fontSize: 13,
    color: '#3B82F6',
    marginTop: 2,
  },
  featuresSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  featureTextContainer: {
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 70, // Above tab bar
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#299e60',
    backgroundColor: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#299e60',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#299e60',
  },
  buyNowButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
