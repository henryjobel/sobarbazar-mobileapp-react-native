import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '@/context/CartContext';
import { getExclusiveProductById } from '@/utils/api';

const BASE_URL = 'https://api.hetdcl.com';

interface ProductImage {
  id: number;
  color?: string;
  size?: string;
  price?: number;
  imageUrl?: string;
}

interface ExclusiveProduct {
  id: number;
  name: string;
  image?: string;
  unit_price?: number;
  discount_amount?: number;
  stock_quantity?: number;
  qty?: number;
  product_type?: string;
  category?: string;
  description?: string;
  rating?: number;
  num_reviews?: number;
  delivery_charge_inside_dhaka?: number;
  delivery_charge_outside_dhaka?: number;
  product_images?: ProductImage[];
}

const ensureAbsoluteUrl = (url?: string | null): string => {
  if (!url) return 'https://via.placeholder.com/400';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function ExclusiveProductDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addDropshippingItem } = useCart();

  const [product, setProduct] = useState<ExclusiveProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductImage | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getExclusiveProductById(Number(id));
      setProduct(data);
      if (data?.product_images && data.product_images.length > 0 && data.product_type === 'variable') {
        setSelectedVariant(data.product_images[0]);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const getDisplayImage = (): string => {
    if (selectedVariant?.imageUrl) return ensureAbsoluteUrl(selectedVariant.imageUrl);
    if (product?.product_images?.[0]?.imageUrl) return ensureAbsoluteUrl(product.product_images[0].imageUrl);
    return ensureAbsoluteUrl(product?.image);
  };

  const getPrice = (): number => {
    if (selectedVariant?.price) return selectedVariant.price;
    return product?.unit_price || 0;
  };

  const getOriginalPrice = (): number => {
    const price = getPrice();
    const discount = product?.discount_amount || 0;
    return price + discount;
  };

  const getStock = (): number => product?.stock_quantity ?? product?.qty ?? 0;

  const handleAddToCart = async () => {
    if (!product) return;
    const isVariable = product.product_type === 'variable';
    if (isVariable && !selectedVariant) return;

    const imageId = selectedVariant?.id || product.product_images?.[0]?.id || 0;
    setAdding(true);
    const success = await addDropshippingItem({
      productId: product.id,
      droplooImageId: imageId,
      size: selectedVariant?.size || '',
      color: selectedVariant?.color || '',
      unitPrice: getPrice(),
      quantity,
      name: product.name,
      image: getDisplayImage(),
    });
    setAdding(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const discountPct = (() => {
    const price = getPrice();
    const disc = product?.discount_amount || 0;
    if (!disc || !price) return 0;
    const original = price + disc;
    return Math.round((disc / original) * 100);
  })();

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#299e60" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const stock = getStock();
  const isVariable = product.product_type === 'variable';
  const needsVariantSelection = isVariable && !selectedVariant;
  const variants = product.product_images || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a3c34" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text style={styles.headerTitle}> RAKAMARI Exclusive</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/cart')} style={styles.headerCartBtn}>
          <Ionicons name="cart-outline" size={24} color="#1a3c34" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getDisplayImage() }}
            style={styles.mainImage}
            contentFit="contain"
          />
          {discountPct > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPct}% OFF</Text>
            </View>
          )}
          <View style={styles.exclusiveBadge}>
            <Ionicons name="star" size={10} color="#fff" />
            <Text style={styles.exclusiveBadgeText}> RAKAMARI</Text>
          </View>
        </View>

        {/* Variant Thumbnails */}
        {variants.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailsScroll}
            contentContainerStyle={styles.thumbnailsContent}
          >
            {variants.map(v => (
              <TouchableOpacity
                key={v.id}
                onPress={() => setSelectedVariant(v)}
                style={[
                  styles.thumbnail,
                  selectedVariant?.id === v.id && styles.thumbnailActive,
                ]}
              >
                <Image
                  source={{ uri: ensureAbsoluteUrl(v.imageUrl) }}
                  style={styles.thumbnailImage}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {product.category && (
            <Text style={styles.categoryText}>{product.category}</Text>
          )}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          {(product.rating || product.num_reviews) ? (
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <Ionicons
                  key={i}
                  name={i <= Math.floor(product.rating || 0) ? 'star' : 'star-outline'}
                  size={16}
                  color="#f59e0b"
                />
              ))}
              <Text style={styles.reviewsText}> ({product.num_reviews || 0} reviews)</Text>
            </View>
          ) : null}

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>৳{getPrice().toLocaleString()}</Text>
            {(product.discount_amount || 0) > 0 && (
              <Text style={styles.originalPrice}>৳{getOriginalPrice().toLocaleString()}</Text>
            )}
            {discountPct > 0 && (
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>Save {discountPct}%</Text>
              </View>
            )}
          </View>

          {/* Stock */}
          <View style={styles.stockRow}>
            <Ionicons
              name={stock > 0 ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={stock > 0 ? '#10b981' : '#ef4444'}
            />
            <Text style={[styles.stockText, { color: stock > 0 ? '#10b981' : '#ef4444' }]}>
              {stock > 0 ? ` In Stock (${stock} available)` : ' Out of Stock'}
            </Text>
          </View>

          {/* Variant Selector (color/size) */}
          {isVariable && variants.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={styles.variantLabel}>Select Variant:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {variants.map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.variantChip,
                      selectedVariant?.id === v.id && styles.variantChipActive,
                    ]}
                    onPress={() => setSelectedVariant(v)}
                  >
                    <Text style={[
                      styles.variantChipText,
                      selectedVariant?.id === v.id && styles.variantChipTextActive,
                    ]}>
                      {[v.color, v.size].filter(Boolean).join(' / ') || `Option ${v.id}`}
                    </Text>
                    {v.price && (
                      <Text style={[styles.variantPrice, selectedVariant?.id === v.id && { color: '#fff' }]}>
                        ৳{v.price.toLocaleString()}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(q => Math.max(1, q - 1))}
              >
                <Ionicons name="remove" size={18} color="#1a3c34" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(q => Math.min(stock > 0 ? stock : 99, q + 1))}
              >
                <Ionicons name="add" size={18} color="#1a3c34" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Delivery Info */}
          <View style={styles.deliverySection}>
            <Text style={styles.deliveryLabel}>Delivery Charges:</Text>
            <View style={styles.deliveryRow}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text style={styles.deliveryText}>
                Inside Dhaka: ৳{product.delivery_charge_inside_dhaka || 60}
              </Text>
            </View>
            <View style={styles.deliveryRow}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text style={styles.deliveryText}>
                Outside Dhaka: ৳{product.delivery_charge_outside_dhaka || 120}
              </Text>
            </View>
          </View>

          {/* Trust Badges */}
          <View style={styles.trustSection}>
            {[
              { icon: 'rocket-outline', label: 'Fast Delivery' },
              { icon: 'refresh-outline', label: 'Easy Returns' },
              { icon: 'shield-checkmark-outline', label: 'Secure Pay' },
              { icon: 'headset-outline', label: '24/7 Support' },
            ].map(badge => (
              <View key={badge.icon} style={styles.trustItem}>
                <Ionicons name={badge.icon as any} size={20} color="#299e60" />
                <Text style={styles.trustLabel}>{badge.label}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descSection}>
              <Text style={styles.descLabel}>Description</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Add to Cart */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceWrap}>
          <Text style={styles.bottomPriceLabel}>Total</Text>
          <Text style={styles.bottomPrice}>৳{(getPrice() * quantity).toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addToCartBtn,
            (stock === 0 || needsVariantSelection) && styles.addToCartBtnDisabled,
            added && styles.addToCartBtnSuccess,
          ]}
          onPress={handleAddToCart}
          disabled={stock === 0 || needsVariantSelection || adding}
        >
          {adding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : added ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.addToCartBtnText}> Added!</Text>
            </>
          ) : (
            <>
              <Ionicons name="cart" size={20} color="#fff" />
              <Text style={styles.addToCartBtnText}>
                {stock === 0 ? ' Out of Stock' : needsVariantSelection ? ' Select Variant' : ' Add to Cart'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles: any = {
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },
  errorText: { fontSize: 16, color: '#6b7280', marginTop: 12 },
  backButton: { marginTop: 16, backgroundColor: '#299e60', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backButtonText: { color: '#fff', fontWeight: '600' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  headerBackBtn: { padding: 4 },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1a3c34' },
  headerCartBtn: { padding: 4 },
  scrollContent: { paddingBottom: 100 },
  imageContainer: {
    backgroundColor: '#fff', height: 300, position: 'relative',
  },
  mainImage: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  discountText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  exclusiveBadge: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a3c34', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  exclusiveBadgeText: { color: '#f59e0b', fontSize: 10, fontWeight: '700' },
  thumbnailsScroll: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  thumbnailsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  thumbnail: {
    width: 56, height: 56, borderRadius: 8, overflow: 'hidden',
    borderWidth: 2, borderColor: '#e5e7eb',
  },
  thumbnailActive: { borderColor: '#299e60' },
  thumbnailImage: { width: '100%', height: '100%' },
  infoContainer: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  categoryText: { fontSize: 12, color: '#299e60', fontWeight: '600', marginBottom: 4 },
  productName: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 8, lineHeight: 24 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reviewsText: { fontSize: 13, color: '#6b7280', marginLeft: 4 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  currentPrice: { fontSize: 24, fontWeight: '800', color: '#299e60' },
  originalPrice: { fontSize: 16, color: '#9ca3af', textDecorationLine: 'line-through' },
  discountPill: {
    backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  discountPillText: { fontSize: 11, color: '#166534', fontWeight: '700' },
  stockRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stockText: { fontSize: 13, fontWeight: '600' },
  variantSection: { marginBottom: 16 },
  variantLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  variantChip: {
    marginRight: 8, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db',
    backgroundColor: '#f9fafb', alignItems: 'center',
  },
  variantChipActive: { backgroundColor: '#1a3c34', borderColor: '#1a3c34' },
  variantChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  variantChipTextActive: { color: '#fff' },
  variantPrice: { fontSize: 11, color: '#299e60', fontWeight: '700', marginTop: 2 },
  quantitySection: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  quantityLabel: { fontSize: 14, fontWeight: '600', color: '#374151', flex: 1 },
  quantityControl: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, overflow: 'hidden',
  },
  qtyBtn: {
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  qtyText: { width: 40, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#1f2937' },
  deliverySection: {
    backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  deliveryLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  deliveryText: { fontSize: 13, color: '#6b7280', marginLeft: 6 },
  trustSection: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  trustItem: { alignItems: 'center', gap: 4 },
  trustLabel: { fontSize: 10, color: '#374151', fontWeight: '600', textAlign: 'center' },
  descSection: { marginTop: 8 },
  descLabel: { fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  descText: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, gap: 12,
  },
  bottomPriceWrap: { flex: 1 },
  bottomPriceLabel: { fontSize: 12, color: '#9ca3af' },
  bottomPrice: { fontSize: 20, fontWeight: '800', color: '#1a3c34' },
  addToCartBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1a3c34', paddingVertical: 14, borderRadius: 14, gap: 6,
  },
  addToCartBtnDisabled: { backgroundColor: '#9ca3af' },
  addToCartBtnSuccess: { backgroundColor: '#10b981' },
  addToCartBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
};
