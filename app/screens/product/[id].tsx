import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getProductById } from '@/utils/api';

const { width } = Dimensions.get('window');

interface ProductVariant {
  id: number;
  name: string;
  price: number;
  stock: number;
  sku: string;
  image?: string;
  is_default?: boolean;
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
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  discount?: number;
  rating?: number;
  reviews_count?: number;
  stock?: number;
  sku?: string;
  brand?: { id: number; name: string };
  category?: { id: number; name: string };
  images: ProductImage[];
  variants: ProductVariant[];
  feature_image?: string;
  in_stock?: boolean;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem, isLoading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

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
      const data = await getProductById(id);
      if (data) {
        setProduct(data);
        // Set default variant
        if (data.variants && data.variants.length > 0) {
          const defaultVariant = data.variants.find((v: ProductVariant) => v.is_default) || data.variants[0];
          setSelectedVariant(defaultVariant);
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
    const success = await addItem(product, quantity, selectedVariant);
    setAddingToCart(false);

    if (success) {
      Alert.alert('Success', 'Product added to cart!', [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      ]);
    } else {
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    setAddingToCart(true);
    const success = await addItem(product, quantity, selectedVariant);
    setAddingToCart(false);

    if (success) {
      router.push('/screens/checkout');
    } else {
      Alert.alert('Error', 'Failed to add product to cart');
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

  const handleToggleWishlist = async () => {
    if (!product) return;
    await toggleWishlist(product);
  };

  const currentPrice = selectedVariant?.price || product?.price || 0;
  const originalPrice = product?.original_price || currentPrice;
  const discount = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const isWishlisted = product ? isInWishlist(product.id) : false;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : (product?.in_stock !== false);
  const maxQuantity = selectedVariant?.stock || product?.stock || 10;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
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

  const images = product.images?.length > 0
    ? product.images
    : [{ id: 0, image: product.feature_image || 'https://via.placeholder.com/400' }];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
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
                resizeMode="cover"
              />
            )}
            keyExtractor={(item) => item.id.toString()}
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
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleToggleWishlist}>
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={24}
                color={isWishlisted ? '#EF4444' : '#374151'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Brand & Category */}
          {(product.brand || product.category) && (
            <View style={styles.tagContainer}>
              {product.brand && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{product.brand.name}</Text>
                </View>
              )}
              {product.category && (
                <View style={[styles.tag, styles.categoryTag]}>
                  <Text style={[styles.tagText, styles.categoryTagText]}>{product.category.name}</Text>
                </View>
              )}
            </View>
          )}

          {/* Title */}
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Rating */}
          {product.rating && (
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(product.rating || 0) ? 'star' : 'star-outline'}
                    size={18}
                    color="#F59E0B"
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {product.rating.toFixed(1)} ({product.reviews_count || 0} reviews)
              </Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>৳{currentPrice.toLocaleString()}</Text>
            {discount > 0 && (
              <Text style={styles.originalPrice}>৳{originalPrice.toLocaleString()}</Text>
            )}
          </View>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <View style={[styles.stockBadge, inStock ? styles.inStockBadge : styles.outOfStockBadge]}>
              <Ionicons
                name={inStock ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={inStock ? '#22C55E' : '#EF4444'}
              />
              <Text style={[styles.stockText, inStock ? styles.inStockText : styles.outOfStockText]}>
                {inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
            {selectedVariant?.sku && (
              <Text style={styles.skuText}>SKU: {selectedVariant.sku}</Text>
            )}
          </View>

          {/* Variants */}
          {product.variants && product.variants.length > 1 && (
            <View style={styles.variantsSection}>
              <Text style={styles.sectionTitle}>Select Variant</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {product.variants.map((variant) => (
                  <TouchableOpacity
                    key={variant.id}
                    style={[
                      styles.variantButton,
                      selectedVariant?.id === variant.id && styles.variantButtonActive,
                      variant.stock === 0 && styles.variantButtonDisabled,
                    ]}
                    onPress={() => variant.stock > 0 && setSelectedVariant(variant)}
                    disabled={variant.stock === 0}
                  >
                    <Text
                      style={[
                        styles.variantButtonText,
                        selectedVariant?.id === variant.id && styles.variantButtonTextActive,
                        variant.stock === 0 && styles.variantButtonTextDisabled,
                      ]}
                    >
                      {variant.name}
                    </Text>
                    {variant.stock === 0 && (
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
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {product.description || product.short_description || 'No description available.'}
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <MaterialIcons name="local-shipping" size={24} color="#22C55E" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Free Delivery</Text>
                <Text style={styles.featureSubtitle}>Orders over ৳1000</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="verified" size={24} color="#22C55E" />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Genuine Products</Text>
                <Text style={styles.featureSubtitle}>100% Authentic</Text>
              </View>
            </View>
            <View style={[styles.featureItem, { borderBottomWidth: 0 }]}>
              <MaterialIcons name="autorenew" size={24} color="#22C55E" />
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
          disabled={!inStock || addingToCart || cartLoading}
        >
          {addingToCart ? (
            <ActivityIndicator color="#22C55E" size="small" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={22} color="#22C55E" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buyNowButton, (!inStock || addingToCart) && styles.buyNowButtonDisabled]}
          onPress={handleBuyNow}
          disabled={!inStock || addingToCart || cartLoading}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#22C55E',
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
    backgroundColor: '#22C55E',
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
  imageActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
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
    color: '#22C55E',
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#22C55E',
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
    color: '#22C55E',
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  variantButtonActive: {
    borderColor: '#22C55E',
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
    color: '#22C55E',
  },
  variantButtonTextDisabled: {
    color: '#9CA3AF',
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
    bottom: 0,
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
    borderColor: '#22C55E',
    backgroundColor: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#22C55E',
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
