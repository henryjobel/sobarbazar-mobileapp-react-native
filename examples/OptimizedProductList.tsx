/**
 * Example: Optimized Product List Component
 * Demonstrates best practices for FlatList performance
 *
 * KEY OPTIMIZATIONS:
 * 1. React.memo on list items
 * 2. getItemLayout for fixed-height items
 * 3. Proper keyExtractor
 * 4. Memoized callbacks
 * 5. Performance props (removeClippedSubviews, etc.)
 */

import React, { memo, useCallback, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/src/theme';

// Product interface
interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  stock: number;
}

// Props interface
interface OptimizedProductListProps {
  products: Product[];
  onProductPress: (id: number) => void;
  onAddToCart: (product: Product) => void;
}

// OPTIMIZATION 1: Memoized Product Item Component
const ProductItem = memo<{
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}>(
  ({ product, onPress, onAddToCart }) => {
    return (
      <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.8}>
        {/* Product Image */}
        <Image
          source={{ uri: product.image || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk" // OPTIMIZATION: Enable caching
          placeholder={require('@/assets/images/placeholder.png')}
        />

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>৳{product.price.toFixed(2)}</Text>

          {/* Stock Badge */}
          {product.stock > 0 ? (
            <Text style={styles.inStock}>In Stock</Text>
          ) : (
            <Text style={styles.outOfStock}>Out of Stock</Text>
          )}
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: product.stock > 0 ? colors.primary.main : colors.gray[300] },
          ]}
          onPress={onAddToCart}
          disabled={product.stock === 0}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  },
  // OPTIMIZATION 2: Custom comparison function
  // Only re-render if these specific props change
  (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.name === nextProps.product.name &&
      prevProps.product.price === nextProps.product.price &&
      prevProps.product.stock === nextProps.product.stock &&
      prevProps.product.image === nextProps.product.image
    );
  }
);

ProductItem.displayName = 'ProductItem';

// OPTIMIZATION 3: Define item height constant for getItemLayout
const ITEM_HEIGHT = 120;
const ITEM_SEPARATOR_HEIGHT = 12;

export const OptimizedProductList: React.FC<OptimizedProductListProps> = ({
  products,
  onProductPress,
  onAddToCart,
}) => {
  // OPTIMIZATION 4: Memoize callbacks to prevent unnecessary re-renders
  const handleProductPress = useCallback(
    (id: number) => {
      onProductPress(id);
    },
    [onProductPress]
  );

  const handleAddToCart = useCallback(
    (product: Product) => {
      onAddToCart(product);
    },
    [onAddToCart]
  );

  // OPTIMIZATION 5: Memoize render item to prevent recreation on every render
  const renderItem: ListRenderItem<Product> = useCallback(
    ({ item }) => (
      <ProductItem
        product={item}
        onPress={() => handleProductPress(item.id)}
        onAddToCart={() => handleAddToCart(item)}
      />
    ),
    [handleProductPress, handleAddToCart]
  );

  // OPTIMIZATION 6: Memoize keyExtractor
  const keyExtractor = useCallback((item: Product) => item.id.toString(), []);

  // OPTIMIZATION 7: getItemLayout for fixed-height items
  const getItemLayout = useCallback(
    (data: ArrayLike<Product> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: (ITEM_HEIGHT + ITEM_SEPARATOR_HEIGHT) * index,
      index,
    }),
    []
  );

  // OPTIMIZATION 8: Memoize item separator component
  const ItemSeparator = useCallback(() => <View style={{ height: ITEM_SEPARATOR_HEIGHT }} />, []);

  // OPTIMIZATION 9: Memoize empty component
  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No products found</Text>
      </View>
    ),
    []
  );

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={ListEmptyComponent}
      // PERFORMANCE OPTIMIZATIONS
      removeClippedSubviews={true} // Unmount off-screen items
      maxToRenderPerBatch={10} // Number of items to render per batch
      updateCellsBatchingPeriod={50} // Delay between batches (ms)
      initialNumToRender={10} // Number of items to render initially
      windowSize={5} // Number of screen heights to render (5 = 2 above + visible + 2 below)
      // OTHER SETTINGS
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: ITEM_HEIGHT,
  },
  productImage: {
    width: 96,
    height: 96,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.main,
    marginBottom: 8,
  },
  inStock: {
    fontSize: 12,
    color: colors.success.main,
    fontWeight: '500',
  },
  outOfStock: {
    fontSize: 12,
    color: colors.danger.main,
    fontWeight: '500',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    height: 40,
    alignSelf: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[500],
  },
});

export default OptimizedProductList;
