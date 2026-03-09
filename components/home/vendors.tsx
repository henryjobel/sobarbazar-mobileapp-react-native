import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

interface Store {
  id: number | string;
  name: string;
  logo?: string;
  description?: string;
  address?: string;
  phone_number?: string;
  is_active?: boolean;
  isExclusive?: boolean;
}

interface VendorsProps {
  stores?: Store[];
}

// Fallback stores if no API data
const fallbackStores: Store[] = [
  {
    id: 1,
    name: 'Nike Store',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png',
    description: 'Sportswear & Shoes',
  },
  {
    id: 2,
    name: 'Apple Store',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png',
    description: 'Premium Electronics',
  },
  {
    id: 3,
    name: 'Samsung Store',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/200px-Samsung_Logo.svg.png',
    description: 'Smartphones & Appliances',
  },
];

export default function Vendors({ stores }: VendorsProps) {
  const router = useRouter();
  const [followed, setFollowed] = useState<Record<number, boolean>>({});

  // RAKAMARI exclusive fake store (frontend pattern: insert in middle)
  const rakamariStore: Store = {
    id: 'rokomari',
    name: 'RAKAMARI',
    logo: 'https://api.hetdcl.com/static/images/rakamari-logo.png',
    description: 'Exclusive Online Store',
    isExclusive: true,
  };

  // Use API stores if available, otherwise use fallback
  const apiStores = stores && stores.length > 0 ? stores : fallbackStores;

  // Insert RAKAMARI in the middle (same as frontend TopVendorsOne pattern)
  const hasRakamari = apiStores.some(s => s.name?.toLowerCase().includes('rakamari'));
  let displayStores: Store[];
  if (!hasRakamari) {
    const mid = Math.floor(apiStores.length / 2);
    displayStores = [...apiStores.slice(0, mid), rakamariStore, ...apiStores.slice(mid)];
  } else {
    displayStores = apiStores;
  }

  const toggleFollow = (id: number) => {
    setFollowed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const visitShop = (store: Store) => {
    if (store.isExclusive) {
      router.push('/screens/rakamari');
    } else {
      router.push(`/screens/store/${store.id}`);
    }
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
        <View>
          <Text style={styles.title}>Top Shops</Text>
          <Text style={styles.subtitle}>Browse your favorite vendor shops</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {displayStores.map((store) => (
          <View key={store.id.toString()} style={[styles.card, store.isExclusive && styles.exclusiveCard]}>
            {/* RAKAMARI badge */}
            {store.isExclusive && (
              <View style={styles.exclusiveLabelRow}>
                <Text style={styles.exclusiveLabel}>⭐ EXCLUSIVE</Text>
              </View>
            )}
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: store.logo || 'https://via.placeholder.com/80' }}
                style={styles.logo}
                contentFit="contain"
              />
            </View>

            {/* Shop Name */}
            <Text style={[styles.shopName, store.isExclusive && styles.exclusiveShopName]} numberOfLines={1}>
              {store.name}
            </Text>

            {/* Description/Tagline */}
            <Text style={styles.tagline} numberOfLines={2}>
              {store.description || store.address || 'Quality Products'}
            </Text>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              {!store.isExclusive && (
                <TouchableOpacity
                  style={[styles.followButton, followed[store.id] ? styles.following : styles.follow]}
                  onPress={() => toggleFollow(store.id as number)}
                >
                  <Text style={[styles.followText, followed[store.id] && { color: '#299e60' }]}>
                    {followed[store.id] ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.visitButton, store.isExclusive && styles.exclusiveVisitButton]}
                onPress={() => visitShop(store)}
              >
                <Text style={[styles.visitText, store.isExclusive && styles.exclusiveVisitText]}>
                  {store.isExclusive ? 'Explore' : 'Visit Shop'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingLeft: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingRight: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  scroll: {
    paddingVertical: 10,
  },
  card: {
    width: 200,
    borderRadius: 20,
    backgroundColor: '#e6f9ef',
    marginRight: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
    marginBottom: 12,
    height: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  followButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 1,
  },
  follow: {
    backgroundColor: '#299e60',
    borderColor: '#299e60',
  },
  following: {
    backgroundColor: '#fff',
    borderColor: '#299e60',
  },
  followText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  visitButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#299e60',
    backgroundColor: '#fff',
  },
  visitText: {
    color: '#299e60',
    fontWeight: '600',
    fontSize: 12,
  },
  exclusiveCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  exclusiveLabelRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  exclusiveLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  exclusiveShopName: {
    color: '#92400e',
  },
  exclusiveVisitButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  exclusiveVisitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
