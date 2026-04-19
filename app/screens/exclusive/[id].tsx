import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '@/context/CartContext';
import { getExclusiveProductById } from '@/utils/api';
import { formatHtmlText } from '@/utils/htmlText';

const BASE_URL = 'https://api.hetdcl.com';
const { width } = Dimensions.get('window');

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

const formatPrice = (price: number) => `\u09F3${(price || 0).toLocaleString()}`;

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
      <LinearGradient colors={['#fff7ed', '#eefbf3']} style={styles.center}>
        <ActivityIndicator size="large" color="#299e60" />
        <Text style={styles.loadingText}>Loading exclusive product...</Text>
      </LinearGradient>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="alert-circle-outline" size={52} color="#9ca3af" />
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
  const productDescription = formatHtmlText(product.description);
  const totalPrice = getPrice() * quantity;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff7ed" />
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
            <Ionicons name="chevron-back" size={24} color="#1a3c34" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={styles.headerBadge}>
              <Ionicons name="star" size={12} color="#92400e" />
              <Text style={styles.headerBadgeText}>RAKAMARI EXCLUSIVE</Text>
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/cart')} style={styles.headerIconBtn}>
            <Ionicons name="cart-outline" size={23} color="#1a3c34" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={['#fff3d7', '#e9fbf0']} style={styles.heroSection}>
          <View style={styles.heroBlobOne} />
          <View style={styles.heroBlobTwo} />
          <View style={styles.imageCard}>
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
              <Ionicons name="sparkles" size={13} color="#fff" />
              <Text style={styles.exclusiveBadgeText}>Exclusive</Text>
            </View>
          </View>
        </LinearGradient>

        {variants.length > 1 && (
          <View style={styles.thumbnailPanel}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailsContent}>
              {variants.map(v => (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => setSelectedVariant(v)}
                  style={[styles.thumbnail, selectedVariant?.id === v.id && styles.thumbnailActive]}
                >
                  <Image source={{ uri: ensureAbsoluteUrl(v.imageUrl) }} style={styles.thumbnailImage} contentFit="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.contentWrap}>
          <View style={styles.productCard}>
            {product.category ? <Text style={styles.categoryText}>{product.category}</Text> : null}
            <Text style={styles.productName}>{product.name}</Text>

            {(product.rating || product.num_reviews) ? (
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Ionicons key={i} name={i <= Math.floor(product.rating || 0) ? 'star' : 'star-outline'} size={16} color="#f59e0b" />
                ))}
                <Text style={styles.reviewsText}>({product.num_reviews || 0} reviews)</Text>
              </View>
            ) : null}

            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>{formatPrice(getPrice())}</Text>
              {(product.discount_amount || 0) > 0 ? <Text style={styles.originalPrice}>{formatPrice(getOriginalPrice())}</Text> : null}
              {discountPct > 0 ? (
                <View style={styles.discountPill}>
                  <Text style={styles.discountPillText}>Save {discountPct}%</Text>
                </View>
              ) : null}
            </View>

            <View style={[styles.stockPill, stock > 0 ? styles.stockPillIn : styles.stockPillOut]}>
              <Ionicons name={stock > 0 ? 'checkmark-circle' : 'close-circle'} size={17} color={stock > 0 ? '#15803d' : '#dc2626'} />
              <Text style={[styles.stockText, { color: stock > 0 ? '#15803d' : '#dc2626' }]}>
                {stock > 0 ? `${stock} available now` : 'Out of stock'}
              </Text>
            </View>
          </View>

          {isVariable && variants.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Select Variant</Text>
                <Text style={styles.sectionHint}>{variants.length} options</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantContent}>
                {variants.map(v => {
                  const active = selectedVariant?.id === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[styles.variantChip, active && styles.variantChipActive]}
                      onPress={() => setSelectedVariant(v)}
                    >
                      <Text style={[styles.variantChipText, active && styles.variantChipTextActive]} numberOfLines={1}>
                        {[v.color, v.size].filter(Boolean).join(' / ') || `Option ${v.id}`}
                      </Text>
                      {v.price ? <Text style={[styles.variantPrice, active && styles.variantPriceActive]}>{formatPrice(v.price)}</Text> : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.sectionCard}>
            <View style={styles.quantityRow}>
              <View>
                <Text style={styles.sectionTitle}>Quantity</Text>
                <Text style={styles.sectionHint}>Total {formatPrice(totalPrice)}</Text>
              </View>
              <View style={styles.quantityControl}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Ionicons name="remove" size={18} color="#1a3c34" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity style={styles.qtyBtnActive} onPress={() => setQuantity(q => Math.min(stock > 0 ? stock : 99, q + 1))}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.deliverySection}>
            <Text style={styles.sectionTitle}>Delivery</Text>
            <View style={styles.deliveryGrid}>
              <View style={styles.deliveryCard}>
                <Ionicons name="business-outline" size={20} color="#299e60" />
                <Text style={styles.deliveryTitle}>Inside Dhaka</Text>
                <Text style={styles.deliveryPrice}>{formatPrice(product.delivery_charge_inside_dhaka || 60)}</Text>
              </View>
              <View style={styles.deliveryCard}>
                <Ionicons name="map-outline" size={20} color="#299e60" />
                <Text style={styles.deliveryTitle}>Outside Dhaka</Text>
                <Text style={styles.deliveryPrice}>{formatPrice(product.delivery_charge_outside_dhaka || 120)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.trustSection}>
            {[
              { icon: 'rocket-outline', label: 'Fast delivery' },
              { icon: 'refresh-outline', label: 'Easy return' },
              { icon: 'shield-checkmark-outline', label: 'Secure pay' },
            ].map(badge => (
              <View key={badge.icon} style={styles.trustItem}>
                <Ionicons name={badge.icon as any} size={20} color="#299e60" />
                <Text style={styles.trustLabel}>{badge.label}</Text>
              </View>
            ))}
          </View>

          {productDescription.length > 0 && (
            <View style={styles.descSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Ionicons name="document-text-outline" size={20} color="#299e60" />
              </View>
              <Text style={styles.descText}>{productDescription}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceWrap}>
          <Text style={styles.bottomPriceLabel}>Payable</Text>
          <Text style={styles.bottomPrice}>{formatPrice(totalPrice || getPrice())}</Text>
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
              <Text style={styles.addToCartBtnText}>Added</Text>
            </>
          ) : (
            <>
              <Ionicons name="cart" size={20} color="#fff" />
              <Text style={styles.addToCartBtnText}>{stock === 0 ? 'Out of Stock' : needsVariantSelection ? 'Select Variant' : 'Add to Cart'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8F2' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14, fontWeight: '700' },
  errorText: { fontSize: 16, color: '#6b7280', marginTop: 12 },
  backButton: { marginTop: 16, backgroundColor: '#299e60', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 },
  backButtonText: { color: '#fff', fontWeight: '800' },
  headerSafeArea: { backgroundColor: '#fff7ed' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12 },
  headerIconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  headerTitleWrap: { flex: 1, marginHorizontal: 12 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBadgeText: { color: '#92400e', fontSize: 11, fontWeight: '900', letterSpacing: 0.6 },
  headerTitle: { marginTop: 2, color: '#1a3c34', fontSize: 15, fontWeight: '900' },
  scrollContent: { paddingBottom: 128 },
  heroSection: { minHeight: 328, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 30, overflow: 'hidden' },
  heroBlobOne: { position: 'absolute', top: 20, right: -38, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(245,158,11,0.14)' },
  heroBlobTwo: { position: 'absolute', bottom: 18, left: -36, width: 132, height: 132, borderRadius: 66, backgroundColor: 'rgba(41,158,96,0.12)' },
  imageCard: { width: width - 32, height: 296, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 32, overflow: 'hidden', shadowColor: '#92400e', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.13, shadowRadius: 24, elevation: 8 },
  mainImage: { width: '100%', height: '100%' },
  discountBadge: { position: 'absolute', top: 16, left: 16, backgroundColor: '#ef4444', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999 },
  discountText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  exclusiveBadge: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#1a3c34', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  exclusiveBadgeText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  thumbnailPanel: { marginTop: -20, paddingHorizontal: 16 },
  thumbnailsContent: { gap: 10, paddingVertical: 12 },
  thumbnail: { width: 62, height: 62, borderRadius: 18, overflow: 'hidden', borderWidth: 2, borderColor: '#fff', backgroundColor: '#fff' },
  thumbnailActive: { borderColor: '#299e60' },
  thumbnailImage: { width: '100%', height: '100%' },
  contentWrap: { paddingHorizontal: 16 },
  productCard: { backgroundColor: '#fff', borderRadius: 28, padding: 18, shadowColor: '#1a3c34', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 5 },
  categoryText: { alignSelf: 'flex-start', color: '#92400e', backgroundColor: '#fff3d7', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, fontSize: 12, fontWeight: '900', marginBottom: 12 },
  productName: { fontSize: 23, fontWeight: '900', color: '#12231c', lineHeight: 31, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 2 },
  reviewsText: { fontSize: 13, color: '#6b7280', marginLeft: 6, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  currentPrice: { fontSize: 30, fontWeight: '900', color: '#299e60' },
  originalPrice: { fontSize: 17, color: '#9ca3af', textDecorationLine: 'line-through', fontWeight: '800' },
  discountPill: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  discountPillText: { fontSize: 11, color: '#166534', fontWeight: '900' },
  stockPill: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999 },
  stockPillIn: { backgroundColor: '#ecfdf3' },
  stockPillOut: { backgroundColor: '#fef2f2' },
  stockText: { fontSize: 13, fontWeight: '900' },
  sectionCard: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginTop: 14, borderWidth: 1, borderColor: '#e7efe9' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: '#1a3c34' },
  sectionHint: { fontSize: 12, color: '#7b8b82', fontWeight: '700', marginTop: 4 },
  variantContent: { paddingRight: 8 },
  variantChip: { minWidth: 118, minHeight: 76, marginRight: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 18, borderWidth: 1.5, borderColor: '#d9e3dd', backgroundColor: '#fbfcfb', justifyContent: 'center' },
  variantChipActive: { backgroundColor: '#1a3c34', borderColor: '#1a3c34' },
  variantChipText: { fontSize: 13, fontWeight: '900', color: '#374151' },
  variantChipTextActive: { color: '#fff' },
  variantPrice: { fontSize: 12, color: '#299e60', fontWeight: '900', marginTop: 6 },
  variantPriceActive: { color: '#fbbf24' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f8f4', borderRadius: 18, padding: 4 },
  qtyBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 14 },
  qtyBtnActive: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: '#299e60', borderRadius: 14 },
  qtyText: { width: 42, textAlign: 'center', fontSize: 17, fontWeight: '900', color: '#1a3c34' },
  deliverySection: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginTop: 14, borderWidth: 1, borderColor: '#e7efe9' },
  deliveryGrid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  deliveryCard: { flex: 1, backgroundColor: '#f6faf7', borderRadius: 18, padding: 13 },
  deliveryTitle: { marginTop: 8, color: '#52635a', fontSize: 12, fontWeight: '800' },
  deliveryPrice: { marginTop: 3, color: '#1a3c34', fontSize: 16, fontWeight: '900' },
  trustSection: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#eaf8ef', borderRadius: 22, padding: 14, marginTop: 14 },
  trustItem: { flex: 1, alignItems: 'center', gap: 6 },
  trustLabel: { fontSize: 11, color: '#1f3b30', fontWeight: '900', textAlign: 'center' },
  descSection: { backgroundColor: '#fff', borderRadius: 24, padding: 18, marginTop: 14, borderWidth: 1, borderColor: '#e7efe9' },
  descText: { fontSize: 15, color: '#4b5b52', lineHeight: 25, fontWeight: '500' },
  bottomBar: { position: 'absolute', bottom: 0, left: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.98)', borderRadius: 28, padding: 12, paddingBottom: 18, shadowColor: '#1a3c34', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.16, shadowRadius: 22, elevation: 12, gap: 12 },
  bottomPriceWrap: { flex: 1 },
  bottomPriceLabel: { fontSize: 11, color: '#7b8b82', fontWeight: '800' },
  bottomPrice: { fontSize: 21, fontWeight: '900', color: '#1a3c34', marginTop: 2 },
  addToCartBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a3c34', paddingVertical: 16, borderRadius: 20, gap: 7 },
  addToCartBtnDisabled: { backgroundColor: '#9ca3af' },
  addToCartBtnSuccess: { backgroundColor: '#10b981' },
  addToCartBtnText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
