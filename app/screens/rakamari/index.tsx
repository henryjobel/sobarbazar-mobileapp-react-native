import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '@/context/CartContext';
import { getExclusiveProducts, getExclusiveCategories } from '@/utils/api';

const { width } = Dimensions.get('window');
const BASE_URL = 'https://api.hetdcl.com';
const CARD_WIDTH = (width - 48) / 2;

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

interface Category {
  id: number;
  droploo_id?: number;
  name: string;
  image_url?: string;
}

const ensureAbsoluteUrl = (url?: string | null): string => {
  if (!url) return 'https://via.placeholder.com/200';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getProductImage = (product: ExclusiveProduct): string => {
  if (product.product_images && product.product_images.length > 0) {
    return ensureAbsoluteUrl(product.product_images[0].imageUrl);
  }
  return ensureAbsoluteUrl(product.image);
};

const getDiscountPct = (product: ExclusiveProduct): number => {
  if (!product.discount_amount || !product.unit_price) return 0;
  const original = product.unit_price + product.discount_amount;
  return Math.round((product.discount_amount / original) * 100);
};

const getStock = (product: ExclusiveProduct): number =>
  product.stock_quantity ?? product.qty ?? 0;

export default function RakamariScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addDropshippingItem } = useCart();

  const [products, setProducts] = useState<ExclusiveProduct[]>([]);
  const [hotDeals, setHotDeals] = useState<ExclusiveProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    params.category ? String(params.category) : null
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  // Refs so fetchProducts always reads latest values without stale closure
  const categoryRef = useRef<string | null>(params.category ? String(params.category) : null);
  const searchRef = useRef('');

  const fetchCategories = async () => {
    const cats = await getExclusiveCategories();
    setCategories(cats);
  };

  const fetchProducts = async (pageNum = 1, reset = false, catOverride?: string | null, searchOverride?: string | null) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    const catToUse = catOverride !== undefined ? catOverride : categoryRef.current;
    const searchToUse = searchOverride !== undefined ? searchOverride : searchRef.current;

    try {
      const data = await getExclusiveProducts(
        pageNum, 20,
        (catToUse ?? null) as any,
        (searchToUse || null) as any
      );
      const results: ExclusiveProduct[] = data.results || [];

      if (reset || pageNum === 1) {
        setProducts(results);
        setHotDeals(results.filter(p => (p.discount_amount || 0) > 0).slice(0, 8));
      } else {
        setProducts(prev => [...prev, ...results]);
      }
      setHasMore(results.length === 20);
      setPage(pageNum);
    } catch (e) {
      console.error('RAKAMARI fetch error:', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Only runs once on mount
  useEffect(() => {
    fetchCategories();
    fetchProducts(1, true);
  }, []);

  const handleAddToCart = async (product: ExclusiveProduct) => {
    if (product.product_type === 'variable') {
      router.push(`/screens/exclusive/${product.id}`);
      return;
    }
    const stock = getStock(product);
    if (stock === 0) return;

    const imageId = product.product_images?.[0]?.id || 0;
    setAddingId(product.id);
    const success = await addDropshippingItem({
      productId: product.id,
      droplooImageId: imageId,
      unitPrice: product.unit_price || 0,
      quantity: 1,
      name: product.name,
      image: getProductImage(product),
    });
    setAddingId(null);
    if (success) console.log('✅ Added to cart:', product.name);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) fetchProducts(page + 1);
  };

  const renderProduct = ({ item }: { item: ExclusiveProduct }) => {
    const stock = getStock(item);
    const discountPct = getDiscountPct(item);
    const isVariable = item.product_type === 'variable';
    const outOfStock = stock === 0;

    return (
      <TouchableOpacity
        style={[styles.productCard, { width: CARD_WIDTH }]}
        onPress={() => router.push(`/screens/exclusive/${item.id}`)}
        activeOpacity={0.85}
      >
        <View style={styles.productImageWrap}>
          <Image
            source={{ uri: getProductImage(item) }}
            style={styles.productImage}
            contentFit="cover"
          />
          {discountPct > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPct}% OFF</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>৳{(item.unit_price || 0).toLocaleString()}</Text>
            {item.discount_amount ? (
              <Text style={styles.originalPrice}>
                ৳{((item.unit_price || 0) + item.discount_amount).toLocaleString()}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={[
              styles.addBtn,
              outOfStock && styles.outOfStockBtn,
              isVariable && styles.selectBtn,
            ]}
            onPress={() => handleAddToCart(item)}
            disabled={outOfStock || addingId === item.id}
          >
            {addingId === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addBtnText}>
                {outOfStock ? 'Out of Stock' : isVariable ? 'Select' : '+ Add'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a3c34" />

      {/* Header */}
      <LinearGradient colors={['#1a3c34', '#299e60']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="star" size={18} color="#f59e0b" />
          <Text style={styles.headerTitle}> RAKAMARI</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>EXCLUSIVE</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Store Info Banner */}
            <LinearGradient colors={['#1a3c34', '#2d6a4f']} style={styles.storeBanner}>
              <View style={styles.storeInfo}>
                <View style={styles.storeIconWrap}>
                  <Ionicons name="storefront" size={28} color="#f59e0b" />
                </View>
                <View style={styles.storeDetails}>
                  <Text style={styles.storeName}>RAKAMARI Official Store</Text>
                  <Text style={styles.storeDesc}>Premium Exclusive Products</Text>
                  <View style={styles.storeRatingRow}>
                    {[1,2,3,4,5].map(i => (
                      <Ionicons key={i} name="star" size={12} color="#f59e0b" />
                    ))}
                    <Text style={styles.storeRatingText}> 4.8 (2.5k reviews)</Text>
                  </View>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{products.length}+</Text>
                  <Text style={styles.statLabel}>Products</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{hotDeals.length}</Text>
                  <Text style={styles.statLabel}>Hot Deals</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>Free</Text>
                  <Text style={styles.statLabel}>Returns</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Hot Deals Section */}
            {hotDeals.length > 0 && (
              <View style={styles.hotDealsSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="flame" size={20} color="#ef4444" />
                  <Text style={styles.sectionTitle}> Hot Deals</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hotDealsScroll}>
                  {hotDeals.map(p => {
                    const disc = getDiscountPct(p);
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={styles.hotDealCard}
                        onPress={() => router.push(`/screens/exclusive/${p.id}`)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.hotDealImageWrap}>
                          <Image
                            source={{ uri: getProductImage(p) }}
                            style={styles.hotDealImage}
                            contentFit="cover"
                          />
                          {disc > 0 && (
                            <View style={styles.hotDiscBadge}>
                              <Text style={styles.hotDiscText}>{disc}%</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.hotDealName} numberOfLines={1}>{p.name}</Text>
                        <Text style={styles.hotDealPrice}>৳{(p.unit_price || 0).toLocaleString()}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Search + Categories */}
            <View style={styles.filterSection}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="#9ca3af" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search RAKAMARI products..."
                  value={search}
                  onChangeText={v => { setSearch(v); searchRef.current = v; }}
                  onSubmitEditing={(e) => fetchProducts(1, true, undefined, e.nativeEvent.text)}
                  returnKeyType="search"
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => { setSearch(''); searchRef.current = ''; fetchProducts(1, true, undefined, ''); }}>
                    <Ionicons name="close-circle" size={18} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>

              {categories.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  <TouchableOpacity
                    style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                    onPress={() => { categoryRef.current = null; setSelectedCategory(null); fetchProducts(1, true, null); }}
                  >
                    <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>All</Text>
                  </TouchableOpacity>
                  {categories.map(cat => {
                    const catId = String(cat.droploo_id);
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryChip, selectedCategory === catId && styles.categoryChipActive]}
                        onPress={() => {
                          categoryRef.current = catId;
                          setSelectedCategory(catId);
                          fetchProducts(1, true, catId);
                        }}
                      >
                        <Text style={[styles.categoryChipText, selectedCategory === catId && styles.categoryChipTextActive]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              <View style={styles.allProductsHeader}>
                <Text style={styles.allProductsTitle}>All Products</Text>
              </View>
            </View>

            {loading && (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color="#299e60" />
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#299e60" />
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}

const styles: any = {
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  headerBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  storeBanner: { padding: 16, marginBottom: 4 },
  storeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  storeIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  storeDetails: { flex: 1 },
  storeName: { color: '#fff', fontSize: 18, fontWeight: '800' },
  storeDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  storeRatingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  storeRatingText: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 10,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { color: '#f59e0b', fontSize: 18, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },
  hotDealsSection: { backgroundColor: '#fff', marginBottom: 4, paddingVertical: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  hotDealsScroll: { paddingLeft: 16 },
  hotDealCard: { width: 110, marginRight: 10, alignItems: 'center' },
  hotDealImageWrap: { position: 'relative', width: 110, height: 90, borderRadius: 8, overflow: 'hidden', marginBottom: 4 },
  hotDealImage: { width: '100%', height: '100%' },
  hotDiscBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: '#ef4444', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5,
  },
  hotDiscText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  hotDealName: { fontSize: 11, fontWeight: '600', color: '#1f2937', textAlign: 'center' },
  hotDealPrice: { fontSize: 12, fontWeight: '700', color: '#299e60' },
  filterSection: { backgroundColor: '#fff', marginBottom: 4, paddingVertical: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f3f4f6', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    marginHorizontal: 16, marginBottom: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1f2937' },
  categoryScroll: { paddingLeft: 16, marginBottom: 6 },
  categoryChip: {
    backgroundColor: '#f3f4f6', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb',
  },
  categoryChipActive: { backgroundColor: '#299e60', borderColor: '#299e60' },
  categoryChipText: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  categoryChipTextActive: { color: '#fff' },
  allProductsHeader: { paddingHorizontal: 16, paddingTop: 8 },
  allProductsTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  loaderWrap: { padding: 40, alignItems: 'center' },
  listContent: { paddingBottom: 80 },
  columnWrapper: { paddingHorizontal: 12, gap: 12, marginBottom: 12 },
  productCard: {
    backgroundColor: '#fff', borderRadius: 12,
    overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  productImageWrap: { position: 'relative' },
  productImage: { width: '100%', height: 130 },
  discountBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  discountText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  productInfo: { padding: 8 },
  productName: { fontSize: 12, fontWeight: '600', color: '#1f2937', marginBottom: 4, height: 34 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  price: { fontSize: 13, fontWeight: '700', color: '#299e60' },
  originalPrice: { fontSize: 10, color: '#9ca3af', textDecorationLine: 'line-through' },
  addBtn: {
    backgroundColor: '#1a3c34', paddingVertical: 6,
    borderRadius: 8, alignItems: 'center',
  },
  selectBtn: { backgroundColor: '#2563eb' },
  outOfStockBtn: { backgroundColor: '#d1d5db' },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  footerLoader: { padding: 20, alignItems: 'center' },
};
