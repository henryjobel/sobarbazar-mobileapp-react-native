import ProductData from '@/data/ProductData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


interface FlashSaleProduct {
  id: number | string;
  title: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: any;
  sold: number;
  total: number;
}

interface FlashSaleSectionProps {
  title?: string;
  subtitle?: string;
  products?: FlashSaleProduct[];
  onViewAll?: () => void;
  onProductPress?: (product: FlashSaleProduct) => void;
}

const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  title = "Flash Sale ⚡",
  subtitle = "Limited time offers! Don't miss out",

  products = ProductData.map((item) => {
    const price = parseInt(item.price.replace(/,/g, ''));

    const originalPrice = parseInt(item.crossOutText.replace(/[^0-9]/g, ''));

    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

    return {
      id: item.id,
      title: item.productName,
      price: price,
      originalPrice: originalPrice,
      discount: discount,
      image: item.image,
      sold: Math.floor(Math.random() * 300) + 50,  // progress bar এর জন্য
      total: Math.floor(Math.random() * 500) + 300,
    };
  }),

  onViewAll,
  onProductPress,
}) => {

  const [timeLeft, setTimeLeft] = useState('06:45:22');
  const [progressAnim] = useState(new Animated.Value(0));

  // countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const [h, m, s] = prev.split(':').map(Number);
        let totalSeconds = h * 3600 + m * 60 + s - 1;
        if (totalSeconds < 0) totalSeconds = 24 * 3600;

        return [
          String(Math.floor(totalSeconds / 3600)).padStart(2, '0'),
          String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0'),
          String(totalSeconds % 60).padStart(2, '0'),
        ].join(':');
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  const handleProductPress = (product: FlashSaleProduct) => {
    onProductPress?.(product);
  };

  const handleViewAll = () => {
    onViewAll?.();
  };

  const calcProgress = (sold: number, total: number) => {
    return (sold / total) * 100;
  };

  return (
    <View style={styles.container}>

      <LinearGradient
        colors={['#FF6B6B', '#FF8E53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Ionicons name="flash" size={24} color="#FFF" />
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Ends in</Text>
            <Text style={styles.timerText}>{timeLeft}</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>{subtitle}</Text>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
      >
        {products.map((product) => {
          const progress = calcProgress(product.sold, product.total);

          const widthAnim = progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", `${progress}%`],
          });

          return (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => handleProductPress(product)}
              activeOpacity={0.85}
            >
              <View style={styles.imageContainer}>
                <Image source={product.image} style={styles.productImage} />

                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{product.discount}% OFF</Text>
                </View>
              </View>

              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>

                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>₹{product.price}</Text>
                  <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <Animated.View style={[styles.progressFill, { width: widthAnim }]} />
                  </View>

                  <View style={styles.progressStats}>
                    <Text style={styles.soldText}>{product.sold} sold</Text>
                    <Text style={styles.remainingText}>{product.total - product.sold} left</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.buyNowButton}>
                  <Ionicons name="flash" size={16} color="#FFF" />
                  <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>

              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.viewAllGradient}
        >
          <Text style={styles.viewAllText}>View All Flash Deals</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    marginVertical: 20,
    marginHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 12,
  },

  header: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginLeft: 10,
  },

  timerContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  timerLabel: {
    color: '#FFF',
    fontSize: 10,
    textAlign: 'center',
  },

  timerText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },

  subtitle: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 5,
  },

  productsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  productCard: {
    width: 180,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },

  imageContainer: {
    height: 140,
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF4757',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  discountText: {
    color: '#FFF',
    fontWeight: '800',
  },

  productInfo: {
    padding: 16,
  },

  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    height: 40,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },

  currentPrice: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '700',
    marginRight: 8,
  },

  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },

  progressContainer: {
    marginBottom: 10,
  },

  progressBackground: {
    height: 6,
    backgroundColor: '#EEE',
    borderRadius: 3,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#4CD964',
  },

  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  soldText: {
    fontSize: 11,
    color: '#666',
  },

  remainingText: {
    fontSize: 11,
    color: '#FF6B6B',
    fontWeight: '600',
  },

  buyNowButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  buyNowText: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 6,
  },

  viewAllButton: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },

  viewAllGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  viewAllText: {
    color: '#FFF',
    fontSize: 15,
    marginRight: 8,
  },
});

export default FlashSaleSection;
