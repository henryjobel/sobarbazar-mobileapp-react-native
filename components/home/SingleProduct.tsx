// components/home/SingleProduct.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2; // 2 columns with padding (16*3 = 48)

interface SingleProductProps {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image?: string;
  rating?: number;
  unit?: string;
  category?: string;
  brand?: string;
  stock?: number;
  isFavorite?: boolean;
  onPress: () => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
}

const SingleProduct: React.FC<SingleProductProps> = ({
  id,
  name,
  price,
  originalPrice,
  discount,
  image,
  rating = 0,
  unit = 'piece',
  category,
  brand,
  stock = 0,
  isFavorite = false,
  onPress,
  onAddToCart,
  onToggleFavorite,
}) => {
  // Format price
  const formattedPrice = `৳${price?.toLocaleString() || '0'}`;
  const formattedOriginalPrice = originalPrice ? `৳${originalPrice.toLocaleString()}` : '';

  // Check if out of stock
  const isOutOfStock = stock <= 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: image || 'https://via.placeholder.com/300x300/cccccc/969696?text=No+Image'
          }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Discount Badge */}
        {discount && discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
        
        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onToggleFavorite}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? "#FF6B6B" : "#666"}
          />
        </TouchableOpacity>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        {/* Category/Brand */}
        {(category || brand) && (
          <Text style={styles.categoryText}>
            {brand || category}
          </Text>
        )}
        
        {/* Product Name */}
        <Text style={styles.nameText} numberOfLines={2}>
          {name}
        </Text>
        
        {/* Rating */}
        {rating > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        )}
        
        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{formattedPrice}</Text>
          
          {/* Original Price with strikethrough */}
          {originalPrice && originalPrice > price && (
            <Text style={styles.originalPriceText}>
              {formattedOriginalPrice}
            </Text>
          )}
        </View>
        
        {/* Unit */}
        <Text style={styles.unitText}>/{unit}</Text>
        
        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            isOutOfStock && styles.disabledButton
          ]}
          onPress={!isOutOfStock ? onAddToCart : undefined}
          disabled={isOutOfStock}
        >
          <Ionicons 
            name={isOutOfStock ? "close-circle-outline" : "cart-outline"} 
            size={16} 
            color="#fff" 
          />
          <Text style={styles.addToCartText}>
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: itemWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: itemWidth,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  infoContainer: {
    padding: 12,
  },
  categoryText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    height: 40,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  originalPriceText: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  unitText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default SingleProduct;