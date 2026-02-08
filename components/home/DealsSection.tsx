import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

interface Deal {
  id: number;
  title: string;
  subtitle: string;
  discount: string;
  gradient: string[];
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
}

const DEALS: Deal[] = [
  {
    id: 1,
    title: 'Flash Sale',
    subtitle: 'Up to 50% Off',
    discount: '50%',
    gradient: ['#FF6B6B', '#FF8E53'],
    icon: 'flash',
  },
  {
    id: 2,
    title: 'New Arrivals',
    subtitle: 'Fresh Products',
    discount: 'NEW',
    gradient: ['#4A90E2', '#357ABD'],
    icon: 'sparkles',
  },
  {
    id: 3,
    title: 'Free Delivery',
    subtitle: 'On orders ৳500+',
    discount: 'FREE',
    gradient: ['#299e60', '#16A34A'],
    icon: 'bicycle',
  },
  {
    id: 4,
    title: 'Best Sellers',
    subtitle: 'Top Rated Items',
    discount: 'HOT',
    gradient: ['#F59E0B', '#D97706'],
    icon: 'trophy',
  },
];

interface DealsSectionProps {
  onDealPress?: (deal: Deal) => void;
}

export default function DealsSection({ onDealPress }: DealsSectionProps) {
  const router = useRouter();

  const handleDealPress = (deal: Deal) => {
    if (onDealPress) {
      onDealPress(deal);
    } else {
      router.push('/(tabs)/shop');
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="gift" size={20} color="#EF4444" />
          </View>
          <View>
            <Text style={styles.title}>Special Deals</Text>
            <Text style={styles.subtitle}>Don't miss out on these offers</Text>
          </View>
        </View>
      </View>

      {/* Deals Grid */}
      <View style={styles.dealsGrid}>
        {DEALS.map((deal, index) => (
          <TouchableOpacity
            key={deal.id}
            style={styles.dealCard}
            onPress={() => handleDealPress(deal)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={deal.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dealGradient}
            >
              <View style={styles.dealContent}>
                <View style={styles.dealIconBg}>
                  <Ionicons name={deal.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.dealTitle}>{deal.title}</Text>
                <Text style={styles.dealSubtitle}>{deal.subtitle}</Text>
                <View style={styles.dealBadge}>
                  <Text style={styles.dealBadgeText}>{deal.discount}</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Promotional Banner */}
      <TouchableOpacity
        style={styles.promoBanner}
        onPress={() => router.push('/(tabs)/shop')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#7C3AED', '#5B21B6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.promoGradient}
        >
          <View style={styles.promoContent}>
            <View style={styles.promoLeft}>
              <Text style={styles.promoLabel}>MEGA SALE</Text>
              <Text style={styles.promoTitle}>Save Big Today!</Text>
              <Text style={styles.promoSubtitle}>Get up to 70% off on selected items</Text>
              <View style={styles.shopNowBtn}>
                <Text style={styles.shopNowText}>Shop Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#7C3AED" />
              </View>
            </View>
            <View style={styles.promoRight}>
              <View style={styles.discountCircle}>
                <Text style={styles.discountText}>70%</Text>
                <Text style={styles.offText}>OFF</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Feature Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featureScroll}
      >
        <View style={[styles.featureCard, { backgroundColor: '#FEF3C7' }]}>
          <View style={[styles.featureIcon, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="shield-checkmark" size={20} color="#fff" />
          </View>
          <Text style={styles.featureTitle}>100% Genuine</Text>
          <Text style={styles.featureSubtitle}>Authentic Products</Text>
        </View>

        <View style={[styles.featureCard, { backgroundColor: '#DCFCE7' }]}>
          <View style={[styles.featureIcon, { backgroundColor: '#299e60' }]}>
            <Ionicons name="time" size={20} color="#fff" />
          </View>
          <Text style={styles.featureTitle}>Fast Delivery</Text>
          <Text style={styles.featureSubtitle}>2-3 Business Days</Text>
        </View>

        <View style={[styles.featureCard, { backgroundColor: '#DBEAFE' }]}>
          <View style={[styles.featureIcon, { backgroundColor: '#3B82F6' }]}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </View>
          <Text style={styles.featureTitle}>Easy Returns</Text>
          <Text style={styles.featureSubtitle}>7 Days Return</Text>
        </View>

        <View style={[styles.featureCard, { backgroundColor: '#FEE2E2' }]}>
          <View style={[styles.featureIcon, { backgroundColor: '#EF4444' }]}>
            <Ionicons name="headset" size={20} color="#fff" />
          </View>
          <Text style={styles.featureTitle}>24/7 Support</Text>
          <Text style={styles.featureSubtitle}>Always Here to Help</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  dealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  dealCard: {
    width: CARD_WIDTH,
    marginHorizontal: 4,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dealGradient: {
    padding: 16,
    height: 130,
  },
  dealContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  dealIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  dealSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  dealBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dealBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  promoBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  promoGradient: {
    padding: 20,
  },
  promoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoLeft: {
    flex: 1,
  },
  promoLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  promoSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 4,
  },
  shopNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  shopNowText: {
    color: '#7C3AED',
    fontWeight: 'bold',
    marginRight: 6,
  },
  promoRight: {
    marginLeft: 16,
  },
  discountCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  discountText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  offText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  featureScroll: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  featureCard: {
    width: 140,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 16,
    alignItems: 'center',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
});
