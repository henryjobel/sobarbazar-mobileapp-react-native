import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function PersistentTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const tabs = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', path: '/(tabs)' },
    { name: 'Shop', icon: 'grid-outline', activeIcon: 'grid', path: '/(tabs)/categories' },
    { name: 'Cart', icon: 'cart-outline', activeIcon: 'cart', path: '/(tabs)/cart', isCenter: true, badge: cartCount },
    { name: 'Wishlist', icon: 'heart-outline', activeIcon: 'heart', path: '/(tabs)/wishlist', badge: wishlistCount },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', path: '/(tabs)/profile' },
  ];

  const handlePress = (path: string) => {
    router.push(path as any);
  };

  const isActive = (path: string) => {
    if (path === '/(tabs)') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    return pathname.startsWith(path);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {tabs.map((tab) => {
        const active = isActive(tab.path);
        const color = active ? '#299e60' : '#6B7280';

        if (tab.isCenter) {
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => handlePress(tab.path)}
              style={styles.centerButton}
              activeOpacity={0.7}
            >
              <View style={[styles.cartIconWrapper]}>
                <View style={[styles.cartIconBackground, active && styles.cartIconBackgroundActive]}>
                  <Ionicons
                    name={active ? tab.activeIcon : tab.icon}
                    size={26}
                    color={active ? '#fff' : '#299e60'}
                  />
                  {tab.badge && tab.badge > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>
                        {tab.badge > 99 ? '99+' : tab.badge}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={[styles.label, { color, marginTop: -12 }]}>{tab.name}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => handlePress(tab.path)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={active ? tab.activeIcon : tab.icon}
                size={active ? 26 : 24}
                color={color}
              />
              {tab.badge && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color, fontWeight: active ? '700' : '500' }]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 88 : 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    paddingTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  centerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
  cartIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  cartIconBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#299e60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartIconBackgroundActive: {
    backgroundColor: '#299e60',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
