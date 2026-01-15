import BigSaleBannerr from '@/components/home/banner';
import Category from '@/components/home/Category';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import Header from '@/components/home/header';
import Product from '@/components/home/Products';
import SubHeader from '@/components/home/SubHeader';
import Vendors from '@/components/home/vendors';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  const bannerMap = getBannerMap();
  const flashDeals = getFlashDeals();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header />
      <SubHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        <BigSaleBannerr banners={bannerMap?.HeroBanner?.banner_items} />
        <Category categories={homeData?.subcategories || homeData?.categories} />
        <FlashSaleSection
          products={flashDeals}
          allProducts={homeData?.recommended_products}
          bannerSection={bannerMap?.FlashSales}
        />
        <Product recommendedProducts={homeData?.recommended_products} />
        <Vendors stores={homeData?.stores} />
      </ScrollView>
    </SafeAreaView>
  );
}
