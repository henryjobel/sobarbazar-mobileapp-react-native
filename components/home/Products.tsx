// components/home/Products.tsx - সম্পূর্ণ নতুন কোড
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2;

interface ProductType {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  image_url?: string;
  images?: any[];
  rating?: number;
  unit?: string;
  category?: {
    id: number;
    name: string;
  };
  brand?: {
    id: number;
    name: string;
  };
  stock?: number;
  subcategories?: {
    id: number;
    name: string;
    category: {
      id: number;
      name: string;
    };
  }[];
}

const Products = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);

  // সরাসরি fetch ফাংশন
  const fetchProductsDirectly = async (pageNum = 1) => {
    try {
      const url = `https://api.hetdcl.com/api/v1.0/customers/products/?pagination=1&page=${pageNum}&page_size=20`;
      console.log("🚀 Direct fetch from:", url);
      
      const response = await fetch(url);
      console.log("📊 Response status:", response.status);
      
      if (!response.ok) {
        console.log("❌ Fetch failed with status:", response.status);
        return [];
      }
      
      const text = await response.text();
      console.log("📦 Full response received, length:", text.length);
      
      const json = JSON.parse(text);
      console.log("✅ JSON parsed successfully");
      console.log("📊 JSON keys:", Object.keys(json));
      console.log("📊 Has success:", json.success);
      console.log("📊 Has data:", !!json.data);
      
      // Structure: {success: true, message: "Status OK", data: {count: 12, next: null, previous: null, results: [...]}}
      if (json.success && json.data && json.data.results && Array.isArray(json.data.results)) {
        console.log(`🎉 Found ${json.data.results.length} products in data.results`);
        
        // Show first product details for debugging
        if (json.data.results.length > 0) {
          const firstProduct = json.data.results[0];
          console.log("🔍 First product details:", {
            id: firstProduct.id,
            name: firstProduct.name,
            price: firstProduct.price,
            hasImages: !!firstProduct.images,
            imagesCount: firstProduct.images?.length || 0,
            subcategories: firstProduct.subcategories?.length || 0
          });
        }
        
        return json.data.results;
      } else {
        console.log("⚠️ Unexpected structure");
        console.log("📊 Full response:", JSON.stringify(json, null, 2));
        return [];
      }
    } catch (error) {
      console.log("❌ Fetch error:", error);
      return [];
    }
  };

  // Load products function
  const loadProducts = async (pageNum = 1, isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        if (pageNum === 1) setLoading(true);
      }

      console.log(`🔄 Loading page ${pageNum}...`);
      
      // সরাসরি fetch করি
      const data = await fetchProductsDirectly(pageNum);
      
      console.log(`📊 Received ${data?.length || 0} products`);
      
      if (data && Array.isArray(data) && data.length > 0) {
        console.log("✅ Valid products array received");
        console.log("🔍 First product sample:", {
          id: data[0].id,
          name: data[0].name,
          price: data[0].price,
          images: data[0].images
        });
        
        // Transform data
        const transformedData = data.map((item: any) => {
          // Get image URL
          let imageUrl = 'https://via.placeholder.com/300x300/cccccc/969696?text=No+Image';
          
          if (item.images && item.images.length > 0) {
            const firstImage = item.images[0];
            if (typeof firstImage === 'string') {
              imageUrl = firstImage;
            } else if (firstImage?.image) {
              imageUrl = firstImage.image;
            } else if (firstImage?.url) {
              imageUrl = firstImage.url;
            }
          }
          
          // Get category
          let category = null;
          if (item.category) {
            category = item.category;
          } else if (item.subcategories?.[0]?.category) {
            category = item.subcategories[0].category;
          }
          
          return {
            id: item.id,
            name: item.name || 'No Name',
            price: item.price || 0,
            original_price: item.original_price || item.price,
            discount_percentage: item.discount_percentage || 0,
            image_url: imageUrl,
            images: item.images || [],
            rating: item.rating || 0,
            unit: item.unit || 'piece',
            category: category,
            brand: item.brand,
            stock: item.stock || 10,
            subcategories: item.subcategories || []
          };
        });

        if (pageNum === 1) {
          setProducts(transformedData);
        } else {
          setProducts(prev => [...prev, ...transformedData]);
        }
        
        // Check if there's more data
        if (data.length < 20) {
          setHasMore(false);
          console.log("📌 No more products to load");
        } else {
          setHasMore(true);
        }
      } else {
        console.log("⚠️ No valid products received");
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProducts(1);
  }, []);

  // Load more products
  const loadMore = () => {
    if (!loading && hasMore && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage);
    }
  };

  // Refresh products
  const onRefresh = () => {
    setPage(1);
    setHasMore(true);
    loadProducts(1, true);
  };

  // Handle product press
  const handleProductPress = (product: ProductType) => {
    console.log("👉 Product pressed:", product.id, product.name);
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  // Handle add to cart
  const handleAddToCart = (productId: number) => {
    console.log('🛒 Add to cart:', productId);
    // Implement add to cart logic here
  };

  // Handle favorite toggle
  const handleToggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    console.log('❤️ Toggle favorite:', productId);
  };

  // Get image URL
  const getImageUrl = (item: ProductType) => {
    if (item.image_url) return item.image_url;
    
    if (item.images && item.images.length > 0) {
      const firstImage = item.images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      } else if (firstImage && firstImage.image) {
        return firstImage.image;
      } else if (firstImage && firstImage.url) {
        return firstImage.url;
      }
    }
    
    return 'https://via.placeholder.com/300x300/cccccc/969696?text=No+Image';
  };

  // Get category name
  const getCategoryName = (item: ProductType) => {
    if (item.category?.name) return item.category.name;
    if (item.subcategories?.[0]?.category?.name) return item.subcategories[0].category.name;
    if (item.brand?.name) return item.brand.name;
    return '';
  };

  // Render product item
  const renderProduct = ({ item }: { item: ProductType }) => {
    const isFavorite = favorites.includes(item.id);
    const isOutOfStock = item.stock !== undefined && item.stock <= 0;
    
    // Format prices
    const formattedPrice = `৳${item.price?.toLocaleString() || '0'}`;
    const formattedOriginalPrice = item.original_price 
      ? `৳${item.original_price.toLocaleString()}` 
      : '';
    
    // Get image URL
    const imageUrl = getImageUrl(item);
    const categoryName = getCategoryName(item);

    return (
      <TouchableOpacity
        style={styles.productContainer}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.7}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {/* Discount Badge */}
          {item.discount_percentage && item.discount_percentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount_percentage}% OFF</Text>
            </View>
          )}
          
          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleToggleFavorite(item.id)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#FF6B6B" : "#666"}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Category/Brand */}
          {categoryName && (
            <Text style={styles.categoryText} numberOfLines={1}>
              {categoryName}
            </Text>
          )}
          
          {/* Product Name */}
          <Text style={styles.nameText} numberOfLines={2}>
            {item.name}
          </Text>
          
          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{formattedPrice}</Text>
            
            {item.original_price && item.original_price > item.price && (
              <Text style={styles.originalPriceText}>
                {formattedOriginalPrice}
              </Text>
            )}
          </View>
          
          {/* Add to Cart Button */}
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item.id)}
          >
            <Ionicons name="cart-outline" size={16} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading indicator
  if (loading && products.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Products</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Products</Text>
        <Text style={styles.productCount}>({products.length} items)</Text>
      </View>

      {/* Products Grid */}
      {products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && products.length > 0 ? (
              <View style={styles.footerContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.footerText}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No products available</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryText}>Refresh Products</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  productCount: {
    fontSize: 12,
    color: '#666',
  },
  productContainer: {
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
    marginBottom: 8,
    height: 40,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  row: {
    justifyContent: 'space-between',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  footerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default Products;