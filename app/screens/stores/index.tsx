import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStores } from '../../../utils/api';

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
  city?: string;
}

const ensureAbsoluteUrl = (url?: string | null, fallback = 'https://via.placeholder.com/200x200/eaf8ef/299e60?text=Shop'): string => {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function StoresScreen() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStores = useCallback(async () => {
    try {
      const data = await getStores();
      setStores(data || []);
      setFilteredStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const filtered = stores.filter(store =>
        [store.name, store.description, store.address, store.city]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(query))
      );
      setFilteredStores(filtered);
    } else {
      setFilteredStores(stores);
    }
  }, [searchQuery, stores]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchStores();
  }, [fetchStores]);

  const renderHeader = () => (
    <LinearGradient colors={['#e9fbf0', '#fff6e7']} style={styles.hero}>
      <View style={styles.heroTopRow}>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#12382b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Stores</Text>
        <View style={styles.headerIconButtonPlaceholder} />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="storefront-outline" size={30} color="#299e60" />
        </View>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroEyebrow}>SOBARBAZAR SELLERS</Text>
          <Text style={styles.heroTitle}>Find trusted shops</Text>
          <Text style={styles.heroSubtitle}>Browse verified sellers and their product collections.</Text>
        </View>
      </View>

      <View style={styles.searchCard}>
        <Ionicons name="search" size={20} color="#7A887F" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search sellers, area, products..."
          placeholderTextColor="#98A69E"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#98A69E" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>{filteredStores.length} seller{filteredStores.length === 1 ? '' : 's'} found</Text>
        <View style={styles.verifiedHint}>
          <Ionicons name="checkmark-circle" size={14} color="#299e60" />
          <Text style={styles.verifiedHintText}>Verified sellers highlighted</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderStoreCard = ({ item }: { item: Store }) => {
    const rating = item.rating || 0;
    const description = item.description || item.address || item.city || 'Quality products from this seller';

    return (
      <TouchableOpacity
        style={styles.storeCard}
        onPress={() => router.push(`/screens/store/${item.id}`)}
        activeOpacity={0.88}
      >
        <View style={styles.cardBannerWrap}>
          {item.banner ? (
            <Image source={{ uri: ensureAbsoluteUrl(item.banner) }} style={styles.cardBanner} contentFit="cover" />
          ) : (
            <LinearGradient colors={['#12382b', '#299e60']} style={styles.cardBanner}>
              <Ionicons name="storefront" size={26} color="rgba(255,255,255,0.58)" />
            </LinearGradient>
          )}
          {item.is_verified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
              <Text style={styles.verifiedBadgeText}>Verified</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.storeBody}>
          <Image source={{ uri: ensureAbsoluteUrl(item.logo) }} style={styles.storeLogo} contentFit="cover" />
          <View style={styles.storeInfo}>
            <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.storeDescription} numberOfLines={2}>{description}</Text>
          </View>
        </View>

        <View style={styles.storeStats}>
          <View style={styles.statChip}>
            <Ionicons name="cube-outline" size={14} color="#299e60" />
            <Text style={styles.statText}>{item.total_products || 0} Products</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.statText}>{rating > 0 ? rating.toFixed(1) : 'New'}</Text>
          </View>
          {(item.total_reviews ?? 0) > 0 ? (
            <View style={styles.statChip}>
              <Ionicons name="chatbubble-outline" size={14} color="#2563EB" />
              <Text style={styles.statText}>{item.total_reviews}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.visitButton}>
          <Text style={styles.visitButtonText}>Visit Store</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="storefront-outline" size={58} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No stores found</Text>
      <Text style={styles.emptySubtitle}>{searchQuery ? 'Try a different search term.' : 'Stores will appear here.'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {isLoading ? (
        <LinearGradient colors={['#e9fbf0', '#fff6e7']} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#299e60" />
          <Text style={styles.loadingText}>Loading seller stores...</Text>
        </LinearGradient>
      ) : (
        <FlatList
          data={filteredStores}
          renderItem={renderStoreCard}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[styles.listContainer, filteredStores.length === 0 && styles.emptyListContainer]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#299e60']} tintColor="#299e60" />}
          ListEmptyComponent={renderEmptyState}
        />
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
    color: '#53665b',
    fontSize: 15,
    fontWeight: '700',
  },
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 18,
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
  headerTitle: {
    color: '#12382b',
    fontSize: 17,
    fontWeight: '900',
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 28,
    padding: 16,
    shadowColor: '#12382b',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
  },
  heroIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: '#EAF8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
    marginLeft: 13,
  },
  heroEyebrow: {
    color: '#299e60',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#12382b',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 3,
  },
  heroSubtitle: {
    color: '#6A7A70',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    fontWeight: '600',
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 52,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E6EFE8',
  },
  searchInput: {
    flex: 1,
    color: '#12382b',
    fontSize: 15,
    fontWeight: '600',
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  resultsCount: {
    color: '#12382b',
    fontSize: 14,
    fontWeight: '900',
  },
  verifiedHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedHintText: {
    color: '#6A7A70',
    fontSize: 11,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 28,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 26,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#12382b',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  cardBannerWrap: {
    height: 88,
    position: 'relative',
  },
  cardBanner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#299e60',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  verifiedBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  storeBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: -28,
  },
  storeLogo: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#EAF8EF',
    borderWidth: 4,
    borderColor: '#fff',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
    paddingTop: 24,
  },
  storeName: {
    color: '#12382b',
    fontSize: 18,
    fontWeight: '900',
  },
  storeDescription: {
    color: '#6A7A70',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    fontWeight: '600',
  },
  storeStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3F8F1',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statText: {
    color: '#53665b',
    fontSize: 12,
    fontWeight: '800',
  },
  visitButton: {
    margin: 16,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#299e60',
    paddingVertical: 13,
    borderRadius: 18,
  },
  visitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
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
  },
});
