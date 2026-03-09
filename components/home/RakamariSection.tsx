import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getExclusiveProducts } from '@/utils/api';

const BASE_URL = 'https://api.hetdcl.com';

interface ExclusiveProduct {
  id: number;
  name: string;
  image?: string;
  unit_price?: number;
  discount_amount?: number;
  stock_quantity?: number;
  qty?: number;
  product_type?: string;
  product_images?: { id: number; color?: string; size?: string; price?: number; imageUrl?: string }[];
}

const ensureAbsoluteUrl = (url?: string | null): string => {
  if (!url) return 'https://via.placeholder.com/200';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function RakamariSection() {
  const router = useRouter();
  const [products, setProducts] = useState<ExclusiveProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getExclusiveProducts(1, 8);
        setProducts(data.results || []);
      } catch (e) {
        console.error('RakamariSection fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (!loading && products.length === 0) return null;

  const getImage = (product: ExclusiveProduct): string => {
    if (product.product_images && product.product_images.length > 0) {
      return ensureAbsoluteUrl(product.product_images[0].imageUrl);
    }
    return ensureAbsoluteUrl(product.image);
  };

  const getDiscountPercent = (product: ExclusiveProduct): number => {
    if (!product.discount_amount || !product.unit_price) return 0;
    const original = product.unit_price + product.discount_amount;
    return Math.round((product.discount_amount / original) * 100);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a3c34', '#299e60']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Ionicons name="star" size={22} color="#f59e0b" />
            <Text style={styles.title}> RAKAMARI</Text>
            <View style={styles.exclusiveBadge}>
              <Text style={styles.exclusiveText}>EXCLUSIVE</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Premium Dropshipping Products</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => router.push('/screens/rakamari')}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={14} color="#f59e0b" />
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#299e60" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {products.map(product => {
            const discountPct = getDiscountPercent(product);
            return (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => router.push(`/screens/exclusive/${product.id}`)}
                activeOpacity={0.85}
              >
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: getImage(product) }}
                    style={styles.productImage}
                    contentFit="cover"
                  />
                  {discountPct > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{discountPct}%</Text>
                    </View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>৳{(product.unit_price || 0).toLocaleString()}</Text>
                    {product.discount_amount ? (
                      <Text style={styles.originalPrice}>
                        ৳{((product.unit_price || 0) + product.discount_amount).toLocaleString()}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() => router.push(`/screens/exclusive/${product.id}`)}
                  >
                    <Text style={styles.viewBtnText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* View All Card */}
          <TouchableOpacity
            style={styles.viewAllCard}
            onPress={() => router.push('/screens/rakamari')}
          >
            <LinearGradient colors={['#299e60', '#1a5c3a']} style={styles.viewAllCardGradient}>
              <Ionicons name="arrow-forward-circle" size={36} color="#fff" />
              <Text style={styles.viewAllCardText}>View All{'\n'}RAKAMARI</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerContent: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  exclusiveBadge: {
    marginLeft: 8,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  exclusiveText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  viewAllText: { color: '#f59e0b', fontWeight: '700', fontSize: 13 },
  loaderContainer: { padding: 24, alignItems: 'center' },
  scrollContent: { paddingHorizontal: 12, paddingVertical: 14, gap: 12 },
  productCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 12,
  },
  imageWrapper: { position: 'relative' },
  productImage: { width: '100%', height: 120 },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  productInfo: { padding: 8 },
  productName: { fontSize: 12, fontWeight: '600', color: '#1f2937', marginBottom: 4, height: 34 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  price: { fontSize: 13, fontWeight: '700', color: '#299e60' },
  originalPrice: { fontSize: 11, color: '#9ca3af', textDecorationLine: 'line-through' },
  viewBtn: {
    backgroundColor: '#1a3c34',
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  viewAllCard: {
    width: 130,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  viewAllCardGradient: {
    flex: 1,
    minHeight: 196,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 12,
  },
  viewAllCardText: { color: '#fff', fontWeight: '700', fontSize: 14, textAlign: 'center' },
});
