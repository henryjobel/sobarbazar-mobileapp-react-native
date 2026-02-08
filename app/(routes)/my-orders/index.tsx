import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useAuth } from '../../../context';
import { getOrders } from '../../../utils/api';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    image: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  order_number: string;
  status: 'Placed' | 'Paid' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total_amount: number;
  order_date: string;
  created_at?: string;
  items: OrderItem[];
  shipping_address?: string;
  payment_method?: string;
}

const STATUS_CONFIG: { [key: string]: any } = {
  Placed: { color: '#F59E0B', bg: '#FEF3C7', label: 'Placed', icon: 'time-outline' },
  Paid: { color: '#10B981', bg: '#D1FAE5', label: 'Paid', icon: 'checkmark-circle-outline' },
  Confirmed: { color: '#3B82F6', bg: '#DBEAFE', label: 'Confirmed', icon: 'checkmark-done-outline' },
  Processing: { color: '#3B82F6', bg: '#DBEAFE', label: 'Processing', icon: 'reload-outline' },
  Shipped: { color: '#8B5CF6', bg: '#EDE9FE', label: 'Shipped', icon: 'car-outline' },
  Delivered: { color: '#10B981', bg: '#D1FAE5', label: 'Delivered', icon: 'checkmark-circle-outline' },
  Cancelled: { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled', icon: 'close-circle-outline' },
};

export default function MyOrdersScreen() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    try {
      const data = await getOrders(token);
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchOrders]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order: Order) => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString()}`;
  };

  const renderFilterChip = (filter: string, label: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterChip,
        activeFilter === filter && styles.filterChipActive,
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text
        style={[
          styles.filterChipText,
          activeFilter === filter && styles.filterChipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.Placed;
    const firstItem = item.items?.[0];
    const itemCount = item.items?.length || 0;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/screens/order-detail/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>Order #{item.order_number || item.id}</Text>
            <Text style={styles.orderDate}>{formatDate(item.order_date || item.created_at || '')}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.orderItems}>
          {firstItem && (
            <View style={styles.itemPreview}>
              <Image
                source={{ uri: firstItem.product?.image || 'https://via.placeholder.com/60' }}
                style={styles.itemImage}
                contentFit="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {firstItem.product?.name || 'Product'}
                </Text>
                <Text style={styles.itemQuantity}>
                  Qty: {firstItem.quantity} × {formatPrice(firstItem.price)}
                </Text>
              </View>
            </View>
          )}
          {itemCount > 1 && (
            <Text style={styles.moreItems}>+{itemCount - 1} more item(s)</Text>
          )}
        </View>

        {/* Order Footer */}
        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>{formatPrice(item.total_amount)}</Text>
          </View>
          <View style={styles.viewDetailsBtn}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No orders yet</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'all'
          ? "When you place orders, they'll appear here"
          : `No ${activeFilter} orders found`}
      </Text>
      <TouchableOpacity
        style={styles.shopNowButton}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.shopNowText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoginPrompt = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="lock-closed-outline" size={64} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>Login Required</Text>
      <Text style={styles.emptySubtitle}>
        Please login to view your orders
      </Text>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push('/(routes)/login')}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated && !isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={styles.headerRight} />
        </View>
        {renderLoginPrompt()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'all', label: 'All' },
            { key: 'Placed', label: 'Placed' },
            { key: 'Paid', label: 'Paid' },
            { key: 'Processing', label: 'Processing' },
            { key: 'Shipped', label: 'Shipped' },
            { key: 'Delivered', label: 'Delivered' },
            { key: 'Cancelled', label: 'Cancelled' },
          ]}
          renderItem={({ item }: { item: { key: string; label: string } }) => renderFilterChip(item.key, item.label)}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Orders List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item: Order) => item.id.toString()}
          contentContainerStyle={[
            styles.listContainer,
            filteredOrders.length === 0 && styles.emptyListContainer,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#fff',
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
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
  },
  itemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  moreItems: {
    fontSize: 13,
    color: '#3B82F6',
    marginTop: 8,
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
