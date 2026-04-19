import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatHtmlText } from '../../utils/htmlText';

const API_BASE_URL = 'https://api.hetdcl.com';

interface Store {
  id: number | string;
  name: string;
  logo?: string;
  banner?: string;
  description?: string;
  address?: string;
  city?: string;
  phone_number?: string;
  is_active?: boolean;
  is_verified?: boolean;
  isExclusive?: boolean;
  rating?: number;
  total_products?: number;
}

interface VendorsProps {
  stores?: Store[];
}

const fallbackStores: Store[] = [
  {
    id: 1,
    name: 'Sobarbazar Mart',
    logo: 'https://via.placeholder.com/160/eaf8ef/299e60?text=SM',
    description: 'Curated everyday products',
    is_verified: true,
    total_products: 120,
  },
  {
    id: 2,
    name: 'Daily Kitchen',
    logo: 'https://via.placeholder.com/160/fff6e7/f59e0b?text=DK',
    description: 'Kitchen and home essentials',
    total_products: 84,
  },
  {
    id: 3,
    name: 'Fashion Corner',
    logo: 'https://via.placeholder.com/160/eef4ff/2563eb?text=FC',
    description: 'Trendy fashion picks',
    total_products: 96,
  },
];

const ensureAbsoluteUrl = (
  url?: string | null,
  fallback = 'https://via.placeholder.com/160/eaf8ef/299e60?text=Shop'
): string => {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function Vendors({ stores }: VendorsProps) {
  const router = useRouter();
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const rakamariStore: Store = {
    id: 'rokomari',
    name: 'RAKAMARI',
    logo: 'https://api.hetdcl.com/static/images/rakamari-logo.png',
    description: 'Exclusive online seller collection',
    isExclusive: true,
    is_verified: true,
    total_products: 250,
  };

  const apiStores = stores && stores.length > 0 ? stores : fallbackStores;
  const hasRakamari = apiStores.some((store) => store.name?.toLowerCase().includes('rakamari'));
  const displayStores = hasRakamari
    ? apiStores
    : [
        ...apiStores.slice(0, Math.floor(apiStores.length / 2)),
        rakamariStore,
        ...apiStores.slice(Math.floor(apiStores.length / 2)),
      ];

  const toggleFollow = (id: number | string) => {
    const key = String(id);
    setFollowed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const visitShop = (store: Store) => {
    if (store.isExclusive) {
      router.push('/screens/rakamari');
      return;
    }

    router.push(`/screens/store/${store.id}`);
  };

  const handleViewAll = () => {
    router.push('/screens/stores');
  };

  if (displayStores.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <View style={styles.eyebrowRow}>
            <Ionicons name="storefront-outline" size={14} color="#299e60" />
            <Text style={styles.eyebrow}>Seller spotlight</Text>
          </View>
          <Text style={styles.title}>Featured Sellers</Text>
          <Text style={styles.subtitle}>Trusted shops with fresh collections.</Text>
        </View>

        <TouchableOpacity style={styles.viewAllPill} onPress={handleViewAll} activeOpacity={0.85}>
          <Text style={styles.viewAllText}>All Stores</Text>
          <Ionicons name="arrow-forward" size={14} color="#299e60" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayStores.map((store) => {
          const key = String(store.id);
          const isFollowed = followed[key];
          const cleanDescription =
            formatHtmlText(store.description) ||
            store.address ||
            store.city ||
            'Quality products from this seller';

          return (
            <TouchableOpacity
              key={key}
              style={[styles.card, store.isExclusive ? styles.exclusiveCard : null]}
              onPress={() => visitShop(store)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={store.isExclusive ? ['#fff0c2', '#f59e0b'] : ['#dff8e9', '#f8fff9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardHero}
              >
                <View style={styles.heroOrbLarge} />
                <View style={styles.heroOrbSmall} />

                {store.isExclusive ? (
                  <View style={styles.exclusiveBadge}>
                    <Ionicons name="sparkles" size={12} color="#92400e" />
                    <Text style={styles.exclusiveBadgeText}>Exclusive</Text>
                  </View>
                ) : store.is_verified ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#fff" />
                    <Text style={styles.verifiedBadgeText}>Verified</Text>
                  </View>
                ) : null}

                <View style={styles.logoShell}>
                  <Image
                    source={{ uri: ensureAbsoluteUrl(store.logo) }}
                    style={styles.logo}
                    contentFit="cover"
                  />
                </View>
              </LinearGradient>

              <View style={styles.cardBody}>
                <Text style={styles.shopName} numberOfLines={1}>
                  {store.name}
                </Text>
                <Text style={styles.tagline} numberOfLines={2}>
                  {cleanDescription}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Ionicons name="cube-outline" size={13} color="#299e60" />
                    <Text style={styles.metaText}>{store.total_products || 0} products</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="star" size={13} color="#F59E0B" />
                    <Text style={styles.metaText}>
                      {(store.rating ?? 0) > 0 ? store.rating?.toFixed(1) : 'New'}
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  {store.isExclusive ? (
                    <View style={styles.pickPill}>
                      <Ionicons name="flash" size={13} color="#92400e" />
                      <Text style={styles.pickPillText}>Top pick</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.followButton, isFollowed ? styles.followingButton : styles.followButtonActive]}
                      onPress={() => toggleFollow(store.id)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.followText, isFollowed ? styles.followingText : null]}>
                        {isFollowed ? 'Following' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.visitButton}
                    onPress={() => visitShop(store)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.visitText}>{store.isExclusive ? 'Explore' : 'Visit'}</Text>
                    <Ionicons name="arrow-forward" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  eyebrow: {
    color: '#299e60',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#12382b',
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: '#6A7A70',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },
  viewAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF8EF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  viewAllText: {
    color: '#299e60',
    fontSize: 12,
    fontWeight: '900',
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
  },
  card: {
    width: 232,
    backgroundColor: '#fff',
    borderRadius: 28,
    marginRight: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6EFE8',
    shadowColor: '#12382b',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
  },
  exclusiveCard: {
    borderColor: '#F8D77B',
  },
  cardHero: {
    height: 114,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroOrbLarge: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    right: -34,
    top: -28,
    backgroundColor: 'rgba(255,255,255,0.36)',
  },
  heroOrbSmall: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    left: 18,
    bottom: 16,
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  exclusiveBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.76)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  exclusiveBadgeText: {
    color: '#92400e',
    fontSize: 10,
    fontWeight: '900',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
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
    fontSize: 10,
    fontWeight: '900',
  },
  logoShell: {
    width: 78,
    height: 78,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 6,
    shadowColor: '#12382b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 6,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
    backgroundColor: '#fff',
  },
  cardBody: {
    padding: 14,
    paddingTop: 13,
  },
  shopName: {
    color: '#12382b',
    fontSize: 17,
    fontWeight: '900',
  },
  tagline: {
    color: '#6A7A70',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginTop: 5,
    minHeight: 36,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F8F1',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  metaText: {
    color: '#53665b',
    fontSize: 11,
    fontWeight: '800',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  followButton: {
    flex: 1,
    height: 40,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  followButtonActive: {
    backgroundColor: '#EAF8EF',
    borderColor: '#D3EDDD',
  },
  followingButton: {
    backgroundColor: '#fff',
    borderColor: '#299e60',
  },
  followText: {
    color: '#299e60',
    fontSize: 12,
    fontWeight: '900',
  },
  followingText: {
    color: '#12382b',
  },
  pickPill: {
    flex: 1,
    height: 40,
    borderRadius: 15,
    backgroundColor: '#FFF6DB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#F8D77B',
  },
  pickPillText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '900',
  },
  visitButton: {
    height: 40,
    minWidth: 78,
    borderRadius: 15,
    backgroundColor: '#299e60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 12,
  },
  visitText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
});
