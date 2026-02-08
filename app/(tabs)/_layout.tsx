import { HapticTab } from '@/components/haptic-tab';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

// Custom Tab Bar Icon with Badge
interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focusedName: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  badge?: number;
  badgeColor?: string;
}

function TabIcon({ name, focusedName, color, focused, badge, badgeColor = '#EF4444' }: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <Ionicons
        name={focused ? focusedName : name}
        size={focused ? 26 : 24}
        color={color}
      />
      {badge !== undefined && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </View>
  );
}

// Custom Tab Label
function TabLabel({ label, focused, color }: { label: string; focused: boolean; color: string }) {
  return (
    <Text style={[styles.tabLabel, { color, fontWeight: focused ? '700' : '500' }]}>
      {label}
    </Text>
  );
}

export default function TabLayout() {
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#299e60',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="home-outline"
              focusedName="home"
              color={color}
              focused={focused}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="Home" focused={focused} color={color} />
          ),
        }}
      />

      {/* Shop Tab - Main product listing */}
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="storefront-outline"
              focusedName="storefront"
              color={color}
              focused={focused}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="Shop" focused={focused} color={color} />
          ),
        }}
      />

      {/* Cart Tab - Center with special styling */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.cartIconWrapper}>
              <View style={[styles.cartIconBackground, focused && styles.cartIconBackgroundActive]}>
                <Ionicons
                  name={focused ? 'cart' : 'cart-outline'}
                  size={26}
                  color={focused ? '#fff' : '#299e60'}
                />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="Cart" focused={focused} color={color} />
          ),
        }}
      />

      {/* Wishlist Tab */}
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="heart-outline"
              focusedName="heart"
              color={color}
              focused={focused}
              badge={wishlistCount}
              badgeColor="#EF4444"
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="Wishlist" focused={focused} color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="person-outline"
              focusedName="person"
              color={color}
              focused={focused}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="Profile" focused={focused} color={color} />
          ),
        }}
      />

      {/* Hidden tabs - accessible but not in tab bar */}
      <Tabs.Screen
        name="categories"
        options={{
          href: null, // Hide from tab bar - accessible via Shop filters
        }}
      />

      <Tabs.Screen
        name="deals"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 88 : 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabBarItem: {
    paddingTop: 4,
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
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  // Cart special styling
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
