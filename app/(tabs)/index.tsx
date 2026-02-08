import BigSaleBannerr from '@/components/home/banner';
import Category from '@/components/home/Category';
import DealsSection from '@/components/home/DealsSection';
import FeaturedSection from '@/components/home/FeaturedSection';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import Header from '@/components/home/header';
import NewArrivalsSection from '@/components/home/NewArrivalsSection';
import Product from '@/components/home/Products';
import SubHeader from '@/components/home/SubHeader';
import Vendors from '@/components/home/vendors';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getHomePageData } from '../../utils/api';

interface HomeData {
  banner_sections?: any[];
  subcategories?: any[];
  recommended_products?: any[];
  categories?: any[];
  newly_arrived_products?: any[];
  brands?: any[];
  stores?: any[];
}

export default function HomeScreen() {
  const router = useRouter();
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHomeData = useCallback(async () => {
    try {
      const response = await getHomePageData();
      if (response?.success && response?.data) {
        setHomeData(response.data);
      } else if (response?.data) {
        setHomeData(response.data);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchHomeData();
  }, [fetchHomeData]);

  // Get flash deals - products with discounts
  const getFlashDeals = () => {
    const products = homeData?.recommended_products || [];
    return products.filter((product: any) => {
      const variant = product.default_variant;
      if (variant && variant.discount) {
        return true;
      }
      if (variant && variant.final_price && variant.price && variant.final_price < variant.price) {
        return true;
      }
      return false;
    });
  };

  // Get new arrivals - newest products
  const getNewArrivals = () => {
    if (homeData?.newly_arrived_products && homeData.newly_arrived_products.length > 0) {
      return homeData.newly_arrived_products;
    }
    // Fallback to recommended products sorted by id (newest)
    const products = homeData?.recommended_products || [];
    return [...products].sort((a, b) => b.id - a.id).slice(0, 10);
  };

  // Get banner map by type
  const getBannerMap = () => {
    const bannerMap: Record<string, any> = {};
    if (homeData?.banner_sections) {
      homeData.banner_sections.forEach((section: any) => {
        if (section.type) {
          bannerMap[section.type] = section;
        }
      });
    }
    return bannerMap;
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#299e60" />
        <Text className="text-gray-500 mt-4">Loading amazing products...</Text>
      </SafeAreaView>
    );
  }

  const bannerMap = getBannerMap();
  const flashDeals = getFlashDeals();
  const newArrivals = getNewArrivals();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header />
      <SubHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#299e60']}
            tintColor="#299e60"
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Banner */}
        <BigSaleBannerr banners={bannerMap?.HeroBanner?.banner_items} />

        {/* Categories */}
        <Category categories={homeData?.subcategories || homeData?.categories} />

        {/* Flash Sale Section */}
        <FlashSaleSection
          products={flashDeals}
          allProducts={homeData?.recommended_products}
          bannerSection={bannerMap?.FlashSales}
        />

        {/* Special Deals Section */}
        <DealsSection />

        {/* New Arrivals Section */}
        <NewArrivalsSection
          products={newArrivals}
          title="New Arrivals"
          onViewAll={() => router.push('/(tabs)/shop')}
        />

        {/* Featured Section with Quick Actions */}
        <FeaturedSection
          brands={homeData?.brands}
          categories={homeData?.categories}
        />

        {/* Promo Banner */}
        <TouchableOpacity
          className="mx-4 mt-6 bg-main-600 rounded-2xl overflow-hidden"
          onPress={() => router.push('/(tabs)/shop')}
          activeOpacity={0.9}
        >
          <View className="bg-main-600 p-5">
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text className="text-white/80 text-sm">Special Offer</Text>
                <Text className="text-white text-2xl font-bold mt-1">Free Delivery</Text>
                <Text className="text-white/90 text-sm mt-1">On your first order above ৳500</Text>
                <View className="bg-white mt-3 px-4 py-2 rounded-lg self-start">
                  <Text className="text-main-600 font-bold">Shop Now</Text>
                </View>
              </View>
              <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center">
                <Ionicons name="gift-outline" size={40} color="#fff" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* All Products Section */}
        <View className="mt-6">
          <View className="px-4 flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-main-100 rounded-xl items-center justify-center mr-3">
                <Ionicons name="cube" size={20} color="#299e60" />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">All Products</Text>
                <Text className="text-xs text-gray-500">Browse our collection</Text>
              </View>
            </View>
            <TouchableOpacity
              className="flex-row items-center bg-main-50 px-3 py-2 rounded-lg"
              onPress={() => router.push('/(tabs)/shop')}
            >
              <Text className="text-main-600 font-semibold text-sm mr-1">View All</Text>
              <Ionicons name="arrow-forward" size={16} color="#299e60" />
            </TouchableOpacity>
          </View>
        </View>
        <Product recommendedProducts={homeData?.recommended_products} />

        {/* Vendors/Stores Section */}
        <Vendors stores={homeData?.stores} />

        {/* Newsletter Section */}
        <View className="mx-4 mt-6 mb-8 bg-gray-800 rounded-2xl p-6">
          <View className="items-center">
            <View className="w-14 h-14 bg-main-600 rounded-full items-center justify-center mb-4">
              <Ionicons name="mail-outline" size={28} color="#fff" />
            </View>
            <Text className="text-white text-xl font-bold text-center">Stay Updated</Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              Get exclusive offers, new arrivals, and more delivered to your inbox
            </Text>
            <TouchableOpacity
              className="bg-main-600 px-6 py-3 rounded-xl mt-4"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">Subscribe Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
