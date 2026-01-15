import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

interface Store {
  id: number;
  name: string;
  logo?: string;
  description?: string;
  address?: string;
  phone_number?: string;
  is_active?: boolean;
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

  // Use API stores if available, otherwise use fallback
  const displayStores = stores && stores.length > 0 ? stores : fallbackStores;

  const toggleFollow = (id: number) => {
    setFollowed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const visitShop = (store: Store) => {
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
          <View key={store.id} style={styles.card}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: store.logo || 'https://via.placeholder.com/80' }}
                style={styles.logo}
                contentFit="contain"
              />
            </View>

            {/* Shop Name */}
            <Text style={styles.shopName} numberOfLines={1}>
              {store.name}
            </Text>

            {/* Description/Tagline */}
            <Text style={styles.tagline} numberOfLines={2}>
              {store.description || store.address || 'Quality Products'}
            </Text>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.followButton, followed[store.id] ? styles.following : styles.follow]}
                onPress={() => toggleFollow(store.id)}
              >
                <Text style={[styles.followText, followed[store.id] && { color: '#299e60' }]}>
                  {followed[store.id] ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.visitButton} onPress={() => visitShop(store)}>
                <Text style={styles.visitText}>Visit Shop</Text>
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
});
