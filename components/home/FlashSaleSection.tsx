import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');

interface Product {
  id: number;
  name?: string;
  default_variant?: {
    id: number;
    name?: string;
    price: number;
    final_price: number;
    discount?: {
      name: string;
      type: string;
      value: number;
      is_percentage: boolean;
    };
    stock?: number;
    available_stock?: number;
    image?: string;
  };
  images?: { image: string }[];
}

interface FlashSaleSectionProps {
  products?: Product[];
  allProducts?: Product[];
  bannerSection?: {
    title?: string;
    banner_items?: {
      id: number;
      title: string;
      start_date?: string;
      end_date?: string;
    }[];
  };
}

const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  products = [],
  allProducts = [],
  bannerSection,
}) => {
  const router = useRouter();
  const { addItem } = useCart();
  const [timeLeft, setTimeLeft] = useState({ hours: 6, minutes: 45, seconds: 22 });
  const [progressAnim] = useState(new Animated.Value(0));

  // Use products with discounts, or show first 10 products if no discounts
  const displayProducts = products.length > 0 ? products : (allProducts || []).slice(0, 10);

  // If no products to show, don't render the section
  if (displayProducts.length === 0) {
    return null;
  }

  // Get countdown end time from banner or use default 24 hours
  useEffect(() => {
    let endTime: Date;

    if (bannerSection?.banner_items?.[0]?.end_date) {
      endTime = new Date(bannerSection.banner_items[0].end_date);
    } else {
      // Default: 24 hours from now
      endTime = new Date();
      endTime.setHours(endTime.getHours() + 24);
    }

    const timer = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, endTime.getTime() - now.getTime());

      if (diff <= 0) {
        // Reset timer for another 24 hours
        endTime = new Date();
        endTime.setHours(endTime.getHours() + 24);
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [bannerSection]);

  // Bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  const handleProductPress = (product: Product) => {
    router.push(`/screens/product/${product.id}`);
  };

  const handleAddToCart = (product: Product) => {
    const variant = product.default_variant;
    if (variant) {
      addItem({
        id: product.id,
        name: product.name || 'Product',
        price: variant.final_price || variant.price,
        image: getProductImage(product),
        quantity: 1,
        variantId: variant.id,
      });
    }
  };

  const handleViewAll = () => {
    router.push('/screens/shop');
  };

  const getProductImage = (product: Product) => {
    if (product.default_variant?.image) {
      return product.default_variant.image;
    }
    if (product.images && product.images.length > 0) {
      return product.images[0].image;
    }
    return 'https://via.placeholder.com/200';
  };

  const getDiscountPercent = (product: Product) => {
    const variant = product.default_variant;
    if (!variant) return 0;

    if (variant.discount?.is_percentage) {
      return Math.round(variant.discount.value);
    }

    if (variant.price && variant.final_price && variant.price > variant.final_price) {
      return Math.round(((variant.price - variant.final_price) / variant.price) * 100);
    }

    return 0;
  };

  const getSoldProgress = () => {
    // Calculate a random sold percentage for visual effect
    return Math.floor(Math.random() * 60) + 30;
  };

  const formatTime = (value: number) => String(value).padStart(2, '0');

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
            <Text style={styles.title}>Flash Sale</Text>
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Ends in</Text>
            <Text style={styles.timerText}>
              {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>Limited time offers! Don't miss out</Text>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
      >
        {displayProducts.map((product) => {
          const variant = product.default_variant;
          const discountPercent = getDiscountPercent(product);
          const soldPercent = getSoldProgress();

          const widthAnim = progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', `${soldPercent}%`],
          });

          return (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => handleProductPress(product)}
              activeOpacity={0.85}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: getProductImage(product) }}
                  style={styles.productImage}
                  contentFit="cover"
                />

                {discountPercent > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{discountPercent}% OFF</Text>
                  </View>
                )}
              </View>

              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {product.name || 'Product'}
                </Text>

                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>
                    ৳{(variant?.final_price || variant?.price || 0).toLocaleString()}
                  </Text>
                  {variant?.price && variant?.final_price && variant.price > variant.final_price && (
                    <Text style={styles.originalPrice}>
                      ৳{variant.price.toLocaleString()}
                    </Text>
                  )}
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <Animated.View style={[styles.progressFill, { width: widthAnim }]} />
                  </View>

                  <View style={styles.progressStats}>
                    <Text style={styles.soldText}>{soldPercent}% sold</Text>
                    <Text style={styles.remainingText}>
                      {variant?.available_stock || variant?.stock || 'Limited'} left
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.buyNowButton}
                  onPress={() => handleAddToCart(product)}
                >
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  imageContainer: {
    height: 140,
    position: 'relative',
  },

  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
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
    fontSize: 11,
  },

  productInfo: {
    padding: 12,
  },

  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    height: 36,
    lineHeight: 18,
    color: '#333',
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },

  currentPrice: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '700',
    marginRight: 8,
  },

  originalPrice: {
    fontSize: 12,
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
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#4CD964',
    borderRadius: 3,
  },

  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  soldText: {
    fontSize: 10,
    color: '#666',
  },

  remainingText: {
    fontSize: 10,
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
    fontSize: 13,
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
    fontWeight: '600',
    marginRight: 8,
  },
});

export default FlashSaleSection;
