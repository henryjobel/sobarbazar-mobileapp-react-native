import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;
const BASE_URL = 'https://api.hetdcl.com';
const PAGE_SIZE = 20;

// Types
interface ProductVariant {
  id: number;
  name: string;
  price: number;
  final_price: number;
  stock: number;
  available_stock: number;
  sold?: number;
  sku?: string;
  image?: string;
  discount?: {
    name: string;
    type: string;
    value: number;
    is_percentage: boolean;
  };
}

interface Product {
  id: number;
  name: string;
  default_variant?: ProductVariant;
  variants?: ProductVariant[];
  images?: { id: number; image: string; alt_text?: string }[];
  rating?: number;
  review_count?: number;
  store?: {
    id: number;
    name: string;
    logo?: string;
    is_verified?: boolean;
  };
  is_new?: boolean;
  sold?: number;
}

interface Category {
  id: number;
  name: string;
  slug?: string;
  subcategories?: { id: number; name: string; slug?: string }[];
}

interface Brand {
  id: number;
  name: string;
  image?: string;
  logo?: string;
}

interface Store {
  id: number;
  name: string;
  logo?: string;
  is_verified?: boolean;
  city?: string;
  description?: string;
  phone_number?: string;
  contact_email?: string;
  address?: string;
}

interface FilterOptions {
  categories: Category[];
  brands: Brand[];
  price_range: { min: number; max: number };
}

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'latest' | 'price-low' | 'price-high';

export default function ShopScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // URL params
  const categoryId = params.category as string | undefined;
  const brandId = params.brand as string | undefined;
  const storeId = params.store as string | undefined;
  const searchQuery = params.search as string | undefined;

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [storeData, setStoreData] = useState<Store | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId || null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(brandId || null);
  const [selectedStore, setSelectedStore] = useState<string | null>(storeId || null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);

  const [searchText, setSearchText] = useState(searchQuery || '');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [filterTab, setFilterTab] = useState<'category' | 'brand' | 'rating'>('category');
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

  // Fetch products from API
  const fetchProducts = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      // Build query params exactly like frontend
      const params: string[] = [];
      if (selectedCategory) params.push(`supplier_product__subcategories__category=${selectedCategory}`);
      if (selectedBrand) params.push(`supplier_product__brand_or_company=${selectedBrand}`);
      if (selectedStore) params.push(`supplier_product__store=${selectedStore}`);
      if (searchText) params.push(`search=${encodeURIComponent(searchText)}`);
      if (selectedRating) params.push(`min_rating=${selectedRating}`);
      if (priceRange[0] > 0) params.push(`min_price=${priceRange[0]}`);
      if (priceRange[1] < 500000) params.push(`max_price=${priceRange[1]}`);

      // Sorting
      if (sortBy === 'latest') params.push('ordering=-created_at');
      else if (sortBy === 'price-low') params.push('ordering=variants__price');
      else if (sortBy === 'price-high') params.push('ordering=-variants__price');

      params.push('pagination=1');
      params.push(`page_size=${PAGE_SIZE}`);
      params.push(`page=${page}`);

      const url = `${BASE_URL}/api/v1.0/customers/products/?${params.join('&')}`;
      console.log('🛍️ Shop API URL:', url);

      const res = await fetch(url);
      console.log('📊 Shop API Status:', res.status);

      if (!res.ok) {
        console.log('❌ Shop API failed');
        setProducts([]);
        return;
      }

      const json = await res.json();
      console.log('🛍️ Shop API Response Keys:', Object.keys(json));

      // Extract products from response (matches frontend logic)
      let productsData: Product[] = [];
      let count = 0;

      if (json?.data?.results) {
        productsData = json.data.results;
        count = json.data.count || productsData.length;
      } else if (json?.results) {
        productsData = json.results;
        count = json.count || productsData.length;
      } else if (json?.data && Array.isArray(json.data)) {
        productsData = json.data;
        count = productsData.length;
      } else if (Array.isArray(json)) {
        productsData = json;
        count = productsData.length;
      }

      console.log(`✅ Got ${productsData.length} products, total: ${count}`);

      if (reset || page === 1) {
        setProducts(productsData);
      } else {
        setProducts(prev => [...prev, ...productsData]);
      }

      setTotalCount(count);
      setTotalPages(Math.ceil(count / PAGE_SIZE));
      setCurrentPage(page);

    } catch (error) {
      console.error('❌ Shop fetchProducts error:', error);
      if (page === 1) setProducts([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategory, selectedBrand, selectedStore, searchText, selectedRating, priceRange, sortBy]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1.0/stores/categories/?pagination=0`);
      if (res.ok) {
        const json = await res.json();
        setCategories(json?.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1.0/stores/brands/?pagination=0`);
      if (res.ok) {
        const json = await res.json();
        setBrands(json?.data || []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  }, []);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1.0/customers/products/filter_options/`);
      if (res.ok) {
        const data = await res.json();
        setFilterOptions(data);
        if (data.price_range) {
          setPriceRange([data.price_range.min, data.price_range.max]);
        }
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);

  // Fetch store data when store filter is active
  const fetchStoreData = useCallback(async (storeId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1.0/stores/${storeId}/detail/`);
      if (res.ok) {
        const json = await res.json();
        setStoreData(json?.data || json);
      }
    } catch (error) {
      console.error('Error fetching store:', error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchProducts(1, true);
    fetchCategories();
    fetchBrands();
    fetchFilterOptions();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchProducts(1, true);
  }, [selectedCategory, selectedBrand, selectedStore, selectedRating, sortBy]);

  // Fetch store data when store filter changes
  useEffect(() => {
    if (selectedStore) {
      fetchStoreData(selectedStore);
    } else {
      setStoreData(null);
    }
  }, [selectedStore]);

  // Add to cart handler
  const handleAddToCart = async (product: Product) => {
    if (!product.default_variant?.id) {
      console.log('No variant available');
      return;
    }

    setAddingToCartId(product.id);
    try {
      const success = await addItem(product, 1, product.default_variant);
      if (success) {
        console.log('✅ Added to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setAddingToCartId(null);
    }
  };

  // Toggle wishlist
  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    fetchProducts(1, true);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedStore(null);
    setSelectedRating(null);
    setSearchText('');
    setSortBy('popular');
    if (filterOptions?.price_range) {
      setPriceRange([filterOptions.price_range.min, filterOptions.price_range.max]);
    }
  };

  // Render store info card (when filtered by store)
  const renderStoreInfo = () => {
    if (!selectedStore || !storeData) return null;

    return (
      <View style={styles.storeInfoCard}>
        <View style={styles.storeHeader}>
          {storeData.logo ? (
            <Image source={{ uri: storeData.logo }} style={styles.storeLogo} />
          ) : (
            <View style={styles.storeLogoPlaceholder}>
              <Ionicons name="storefront" size={40} color="#299e60" />
            </View>
          )}
          <Text style={styles.storeName}>{storeData.name}</Text>
          {storeData.city && (
            <View style={styles.storeLocation}>
              <Ionicons name="location" size={14} color="#6B7280" />
              <Text style={styles.storeCity}>{storeData.city}</Text>
            </View>
          )}
        </View>

        {storeData.description && (
          <Text style={styles.storeDescription} numberOfLines={3}>
            {storeData.description}
          </Text>
        )}

        {storeData.phone_number && (
          <View style={styles.contactRow}>
            <Ionicons name="call" size={16} color="#299e60" />
            <Text style={styles.contactText}>{storeData.phone_number}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.clearStoreButton}
          onPress={() => setSelectedStore(null)}
        >
          <Ionicons name="close-circle" size={18} color="#EF4444" />
          <Text style={styles.clearStoreText}>Clear Store Filter</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render product card
  const renderProductCard = ({ item: product }: { item: Product }) => {
    const variant = product.default_variant;
    const price = variant?.final_price || variant?.price || 0;
    const originalPrice = variant?.price || 0;
    const hasDiscount = originalPrice > price;
    const discountValue = variant?.discount?.value;
    const isPercentage = variant?.discount?.is_percentage;

    const stockPercentage = Math.min(
      ((variant?.sold || product.sold || 0) / (variant?.available_stock || 100)) * 100,
      80
    );

    const imageUrl = product.images?.[0]?.image || 'https://via.placeholder.com/200';
    const wishlisted = isInWishlist(product.id);
    const isAddingToCart = addingToCartId === product.id;

    if (viewMode === 'list') {
      return (
        <TouchableOpacity
          style={styles.productCardList}
          onPress={() => router.push(`/screens/product/${product.id}`)}
          activeOpacity={0.9}
        >
          <View style={styles.productImageContainerList}>
            <Image source={{ uri: imageUrl }} style={styles.productImageList} contentFit="contain" />
            {hasDiscount && discountValue && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountValue}{isPercentage ? '%' : ''}</Text>
              </View>
            )}
            {product.is_new && (
              <View style={[styles.discountBadge, styles.newBadge]}>
                <Text style={styles.discountText}>New</Text>
              </View>
            )}
          </View>

          <View style={styles.productContentList}>
            <Text style={styles.productTitle} numberOfLines={2}>{product.name}</Text>

            {variant?.name && (
              <Text style={styles.variantText}>Variant: {variant.name}</Text>
            )}

            <View style={styles.ratingRow}>
              <Text style={styles.ratingValue}>{product.rating?.toFixed(1) || '0.0'}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.floor(product.rating || 0) ? 'star' : 'star-outline'}
                    size={12}
                    color="#FBBF24"
                  />
                ))}
              </View>
              <Text style={styles.reviewCount}>({product.review_count || 0})</Text>
            </View>

            <View style={styles.priceRow}>
              {hasDiscount && <Text style={styles.originalPrice}>৳{originalPrice}</Text>}
              <Text style={styles.currentPrice}>৳{price}</Text>
            </View>

            <TouchableOpacity
              style={[styles.addToCartButton, isAddingToCart && styles.addToCartButtonDisabled]}
              onPress={() => handleAddToCart(product)}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="cart-outline" size={16} color="#fff" />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => toggleWishlist(product)}
          >
            <Ionicons
              name={wishlisted ? 'heart' : 'heart-outline'}
              size={22}
              color={wishlisted ? '#EF4444' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }

    // Grid view
    return (
      <TouchableOpacity
        style={styles.productCardGrid}
        onPress={() => router.push(`/screens/product/${product.id}`)}
        activeOpacity={0.9}
      >
        <View style={styles.productImageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.productImage} contentFit="contain" />

          {hasDiscount && discountValue && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountValue}{isPercentage ? '%' : ''}</Text>
            </View>
          )}

          {product.is_new && (
            <View style={[styles.discountBadge, styles.newBadge]}>
              <Text style={styles.discountText}>New</Text>
            </View>
          )}

          {product.store && (
            <View style={styles.storeBadge}>
              {product.store.logo && (
                <Image source={{ uri: product.store.logo }} style={styles.storeBadgeLogo} />
              )}
              <Text style={styles.storeBadgeText} numberOfLines={1}>{product.store.name}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.wishlistButtonGrid}
            onPress={() => toggleWishlist(product)}
          >
            <Ionicons
              name={wishlisted ? 'heart' : 'heart-outline'}
              size={20}
              color={wishlisted ? '#EF4444' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.productContent}>
          <Text style={styles.productTitle} numberOfLines={2}>{product.name}</Text>

          {variant?.name && (
            <Text style={styles.variantText}>Variant: {variant.name}</Text>
          )}

          <View style={styles.ratingRow}>
            <Text style={styles.ratingValue}>{product.rating?.toFixed(1) || '0.0'}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.floor(product.rating || 0) ? 'star' : 'star-outline'}
                  size={12}
                  color="#FBBF24"
                />
              ))}
            </View>
            <Text style={styles.reviewCount}>({product.review_count || 0})</Text>
          </View>

          <View style={styles.stockSection}>
            <View style={styles.stockProgress}>
              <View style={[styles.stockProgressFill, { width: `${stockPercentage}%` }]} />
            </View>
            <Text style={styles.stockText}>
              Sold: {variant?.sold || product.sold || 0}/{variant?.stock || 0}
            </Text>
          </View>

          <View style={styles.priceRow}>
            {hasDiscount && <Text style={styles.originalPrice}>৳{originalPrice}</Text>}
            <Text style={styles.currentPrice}>৳{price}</Text>
            <Text style={styles.perQty}>/Qty</Text>
          </View>

          <TouchableOpacity
            style={[styles.addToCartButton, isAddingToCart && styles.addToCartButtonDisabled]}
            onPress={() => handleAddToCart(product)}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cart-outline" size={16} color="#fff" />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render filter modal
  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[styles.filterTab, filterTab === 'category' && styles.filterTabActive]}
              onPress={() => setFilterTab('category')}
            >
              <Text style={[styles.filterTabText, filterTab === 'category' && styles.filterTabTextActive]}>
                Categories
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filterTab === 'brand' && styles.filterTabActive]}
              onPress={() => setFilterTab('brand')}
            >
              <Text style={[styles.filterTabText, filterTab === 'brand' && styles.filterTabTextActive]}>
                Brands
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filterTab === 'rating' && styles.filterTabActive]}
              onPress={() => setFilterTab('rating')}
            >
              <Text style={[styles.filterTabText, filterTab === 'rating' && styles.filterTabTextActive]}>
                Rating
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {filterTab === 'category' && (
              <>
                <TouchableOpacity
                  style={[styles.filterItem, !selectedCategory && styles.filterItemActive]}
                  onPress={() => {
                    setSelectedCategory(null);
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={styles.filterItemText}>All Categories</Text>
                  {!selectedCategory && <Ionicons name="checkmark-circle" size={22} color="#299e60" />}
                </TouchableOpacity>
                {(filterOptions?.categories || categories).map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.filterItem, selectedCategory === cat.id.toString() && styles.filterItemActive]}
                    onPress={() => {
                      setSelectedCategory(cat.id.toString());
                      setShowFilterModal(false);
                    }}
                  >
                    <Text style={styles.filterItemText}>{cat.name}</Text>
                    {selectedCategory === cat.id.toString() && (
                      <Ionicons name="checkmark-circle" size={22} color="#299e60" />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}

            {filterTab === 'brand' && (
              <>
                <TouchableOpacity
                  style={[styles.filterItem, !selectedBrand && styles.filterItemActive]}
                  onPress={() => {
                    setSelectedBrand(null);
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={styles.filterItemText}>All Brands</Text>
                  {!selectedBrand && <Ionicons name="checkmark-circle" size={22} color="#299e60" />}
                </TouchableOpacity>
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    style={[styles.filterItem, selectedBrand === brand.id.toString() && styles.filterItemActive]}
                    onPress={() => {
                      setSelectedBrand(brand.id.toString());
                      setShowFilterModal(false);
                    }}
                  >
                    <View style={styles.brandItem}>
                      {brand.image && (
                        <Image source={{ uri: brand.image }} style={styles.brandLogo} />
                      )}
                      <Text style={styles.filterItemText}>{brand.name}</Text>
                    </View>
                    {selectedBrand === brand.id.toString() && (
                      <Ionicons name="checkmark-circle" size={22} color="#299e60" />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}

            {filterTab === 'rating' && (
              <>
                <TouchableOpacity
                  style={[styles.filterItem, !selectedRating && styles.filterItemActive]}
                  onPress={() => {
                    setSelectedRating(null);
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={styles.filterItemText}>All Ratings</Text>
                  {!selectedRating && <Ionicons name="checkmark-circle" size={22} color="#299e60" />}
                </TouchableOpacity>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.filterItem, selectedRating === rating && styles.filterItemActive]}
                    onPress={() => {
                      setSelectedRating(rating);
                      setShowFilterModal(false);
                    }}
                  >
                    <View style={styles.ratingFilterRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= rating ? 'star' : 'star-outline'}
                          size={18}
                          color="#FBBF24"
                        />
                      ))}
                      <Text style={styles.ratingFilterText}>& Above</Text>
                    </View>
                    {selectedRating === rating && (
                      <Ionicons name="checkmark-circle" size={22} color="#299e60" />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.applyFilterButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.applyFilterText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render sort modal
  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowSortModal(false)}
    >
      <TouchableOpacity
        style={styles.sortModalOverlay}
        activeOpacity={1}
        onPress={() => setShowSortModal(false)}
      >
        <View style={styles.sortModalContent}>
          {[
            { value: 'popular', label: 'Popular' },
            { value: 'latest', label: 'Latest' },
            { value: 'price-low', label: 'Price: Low to High' },
            { value: 'price-high', label: 'Price: High to Low' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.sortOption, sortBy === option.value && styles.sortOptionActive]}
              onPress={() => {
                setSortBy(option.value as SortOption);
                setShowSortModal(false);
              }}
            >
              <Text style={[styles.sortOptionText, sortBy === option.value && styles.sortOptionTextActive]}>
                {option.label}
              </Text>
              {sortBy === option.value && <Ionicons name="checkmark" size={20} color="#299e60" />}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
          onPress={() => currentPage > 1 && fetchProducts(currentPage - 1, true)}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#D1D5DB' : '#333'} />
        </TouchableOpacity>

        {pages.map((page) => (
          <TouchableOpacity
            key={page}
            style={[styles.pageNumber, currentPage === page && styles.pageNumberActive]}
            onPress={() => fetchProducts(page, true)}
          >
            <Text style={[styles.pageNumberText, currentPage === page && styles.pageNumberTextActive]}>
              {page.toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
          onPress={() => currentPage < totalPages && fetchProducts(currentPage + 1, true)}
          disabled={currentPage === totalPages}
        >
          <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#D1D5DB' : '#333'} />
        </TouchableOpacity>
      </View>
    );
  };

  // Calculate showing text
  const startItem = (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
      <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
        <Text style={styles.clearFiltersText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/cart')}>
          <Ionicons name="cart-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchSubmit}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.resultsText}>
          Showing {startItem}-{endItem} of {totalCount} results
        </Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'grid' && styles.viewToggleActive]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid" size={18} color={viewMode === 'grid' ? '#fff' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'list' && styles.viewToggleActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={18} color={viewMode === 'list' ? '#fff' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
            <Text style={styles.sortButtonText}>Sort</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
            <Ionicons name="funnel" size={18} color="#299e60" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Store Info Card (if filtered by store) */}
      {renderStoreInfo()}

      {/* Products */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#299e60" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : products.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          key={viewMode}
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={viewMode === 'grid' ? 2 : 1}
          columnWrapperStyle={viewMode === 'grid' ? styles.productRow : undefined}
          contentContainerStyle={styles.productList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                fetchProducts(1, true);
              }}
              colors={['#299e60']}
            />
          }
          ListFooterComponent={
            <>
              {isLoadingMore && (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color="#299e60" />
                </View>
              )}
              {renderPagination()}
            </>
          }
        />
      )}

      {/* Modals */}
      {renderFilterModal()}
      {renderSortModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#111827',
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: '#299e60',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsText: {
    fontSize: 13,
    color: '#6B7280',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewToggle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewToggleActive: {
    backgroundColor: '#299e60',
    borderColor: '#299e60',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  sortButtonText: {
    fontSize: 13,
    color: '#374151',
  },
  filterButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#299e60',
  },
  storeInfoCard: {
    backgroundColor: '#ECFDF5',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#299e60',
  },
  storeHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  storeLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  storeLogoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#299e60',
    textAlign: 'center',
  },
  storeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  storeCity: {
    fontSize: 13,
    color: '#6B7280',
  },
  storeDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
  },
  clearStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  clearStoreText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  productList: {
    padding: 12,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCardGrid: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productImageContainer: {
    height: 160,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImage: {
    width: '90%',
    height: '90%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadge: {
    backgroundColor: '#F59E0B',
    left: 'auto',
    right: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  storeBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxWidth: '70%',
  },
  storeBadgeLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  storeBadgeText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '500',
  },
  wishlistButtonGrid: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productContent: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 20,
  },
  variantText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  reviewCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  stockSection: {
    marginBottom: 8,
  },
  stockProgress: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  stockProgressFill: {
    height: '100%',
    backgroundColor: '#299e60',
    borderRadius: 2,
  },
  stockText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  perQty: {
    fontSize: 12,
    color: '#6B7280',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#299e60',
    paddingVertical: 10,
    borderRadius: 8,
  },
  addToCartButtonDisabled: {
    opacity: 0.7,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  productCardList: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  productImageContainerList: {
    width: 120,
    height: 140,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImageList: {
    width: '90%',
    height: '90%',
  },
  productContentList: {
    flex: 1,
    padding: 12,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  clearFiltersButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#299e60',
    borderRadius: 8,
  },
  clearFiltersText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  pageButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageNumber: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  pageNumberActive: {
    backgroundColor: '#299e60',
    borderColor: '#299e60',
  },
  pageNumberText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  pageNumberTextActive: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  clearAllText: {
    fontSize: 14,
    color: '#299e60',
    fontWeight: '500',
  },
  filterTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filterTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#299e60',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#299e60',
  },
  filterContent: {
    maxHeight: 400,
    padding: 16,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterItemActive: {
    backgroundColor: '#F0FDF4',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterItemText: {
    fontSize: 15,
    color: '#374151',
  },
  brandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  ratingFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingFilterText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  applyFilterButton: {
    margin: 16,
    backgroundColor: '#299e60',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyFilterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: width - 64,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortOptionActive: {
    backgroundColor: '#F0FDF4',
  },
  sortOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  sortOptionTextActive: {
    color: '#299e60',
    fontWeight: '500',
  },
});
