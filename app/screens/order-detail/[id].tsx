import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useAuth } from '../../../context';
import { getOrderById } from '../../../utils/api';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    image: string;
    slug?: string;
  };
  variant?: {
    name: string;
    value: string;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  subtotal: number;
  shipping_charge: number;
  discount: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address: {
    full_name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    area?: string;
    postal_code?: string;
  };
  tracking_number?: string;
  estimated_delivery?: string;
  notes?: string;
}

const STATUS_CONFIG = {
  pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'Pending', icon: 'time-outline' },
  processing: { color: '#3B82F6', bg: '#DBEAFE', label: 'Processing', icon: 'reload-outline' },
  shipped: { color: '#8B5CF6', bg: '#EDE9FE', label: 'Shipped', icon: 'car-outline' },
  delivered: { color: '#10B981', bg: '#D1FAE5', label: 'Delivered', icon: 'checkmark-circle-outline' },
  cancelled: { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled', icon: 'close-circle-outline' },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { color: '#F59E0B', label: 'Payment Pending' },
  paid: { color: '#10B981', label: 'Paid' },
  failed: { color: '#EF4444', label: 'Payment Failed' },
  refunded: { color: '#6B7280', label: 'Refunded' },
};

const ORDER_TIMELINE = [
  { key: 'pending', label: 'Order Placed', icon: 'receipt-outline' },
  { key: 'processing', label: 'Processing', icon: 'cube-outline' },
  { key: 'shipped', label: 'Shipped', icon: 'car-outline' },
  { key: 'delivered', label: 'Delivered', icon: 'checkmark-circle-outline' },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!token || !id) return;

    try {
      const data = await getOrderById(id, token);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchOrder();
  }, [fetchOrder]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString()}`;
  };

  const getStatusIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return ORDER_TIMELINE.findIndex(item => item.key === status);
  };

  const handleCall = () => {
    if (order?.shipping_address?.phone) {
      Linking.openURL(`tel:${order.shipping_address.phone}`);
    }
  };

  const handleTrackOrder = () => {
    if (order?.tracking_number) {
      // Open tracking URL - this would typically be a courier's tracking page
      Linking.openURL(`https://track.example.com/${order.tracking_number}`);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorSubtitle}>
            We couldn't find the order you're looking for.
          </Text>
          <TouchableOpacity style={styles.goBackButton} onPress={() => router.back()}>
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.payment_status] || PAYMENT_STATUS_CONFIG.pending;
  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.order_number || order.id}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
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
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIconContainer, { backgroundColor: statusConfig.bg }]}>
            <Ionicons name={statusConfig.icon as any} size={32} color={statusConfig.color} />
          </View>
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
          <Text style={styles.statusDate}>
            {order.status === 'delivered' ? 'Delivered on' : 'Last updated'}: {formatDate(order.updated_at)}
          </Text>
          {order.estimated_delivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <Text style={styles.estimatedDelivery}>
              Estimated delivery: {formatDate(order.estimated_delivery)}
            </Text>
          )}
        </View>

        {/* Order Timeline */}
        {order.status !== 'cancelled' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Timeline</Text>
            <View style={styles.timeline}>
              {ORDER_TIMELINE.map((item, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <View key={item.key} style={styles.timelineItem}>
                    <View style={styles.timelineIconContainer}>
                      <View
                        style={[
                          styles.timelineIcon,
                          isCompleted && styles.timelineIconCompleted,
                          isCurrent && styles.timelineIconCurrent,
                        ]}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={18}
                          color={isCompleted ? '#fff' : '#9CA3AF'}
                        />
                      </View>
                      {index < ORDER_TIMELINE.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            isCompleted && index < currentStatusIndex && styles.timelineLineCompleted,
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text
                        style={[
                          styles.timelineLabel,
                          isCompleted && styles.timelineLabelCompleted,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Tracking Info */}
        {order.tracking_number && order.status === 'shipped' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tracking Information</Text>
            <View style={styles.trackingCard}>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingLabel}>Tracking Number</Text>
                <Text style={styles.trackingNumber}>{order.tracking_number}</Text>
              </View>
              <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
                <Ionicons name="locate-outline" size={18} color="#3B82F6" />
                <Text style={styles.trackButtonText}>Track</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({order.items?.length || 0})</Text>
          {order.items?.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => router.push(`/screens/product/${item.product?.id}`)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: item.product?.image || 'https://via.placeholder.com/80' }}
                style={styles.itemImage}
                contentFit="cover"
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product?.name || 'Product'}
                </Text>
                {item.variant && (
                  <Text style={styles.itemVariant}>
                    {item.variant.name}: {item.variant.value}
                  </Text>
                )}
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.price)} × {item.quantity}
                  </Text>
                </View>
                <Text style={styles.itemSubtotal}>{formatPrice(item.subtotal || item.price * item.quantity)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.addressIconContainer}>
                <Ionicons name="location-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>{order.shipping_address?.full_name}</Text>
                <Text style={styles.addressPhone}>{order.shipping_address?.phone}</Text>
              </View>
              <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                <Ionicons name="call-outline" size={20} color="#10B981" />
              </TouchableOpacity>
            </View>
            <Text style={styles.addressText}>
              {order.shipping_address?.address}
              {order.shipping_address?.area ? `, ${order.shipping_address.area}` : ''}
              {order.shipping_address?.city ? `, ${order.shipping_address.city}` : ''}
              {order.shipping_address?.postal_code ? ` - ${order.shipping_address.postal_code}` : ''}
            </Text>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.paymentMethodRow}>
              <Text style={styles.paymentMethodLabel}>Payment Method</Text>
              <Text style={styles.paymentMethodValue}>{order.payment_method || 'Cash on Delivery'}</Text>
            </View>
            <View style={styles.paymentStatusRow}>
              <Text style={styles.paymentStatusLabel}>Payment Status</Text>
              <View style={[styles.paymentStatusBadge, { backgroundColor: `${paymentConfig.color}20` }]}>
                <Text style={[styles.paymentStatusText, { color: paymentConfig.color }]}>
                  {paymentConfig.label}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.shipping_charge)}</Text>
            </View>
            {order.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>-{formatPrice(order.discount)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(order.total_amount)}</Text>
            </View>
          </View>
        </View>

        {/* Order Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {order.status === 'delivered' && (
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Ionicons name="refresh-outline" size={20} color="#fff" />
              <Text style={styles.reorderButtonText}>Order Again</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => router.push('/(routes)/contact')}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#3B82F6" />
            <Text style={styles.helpButtonText}>Need Help?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  goBackButton: {
    marginTop: 24,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  goBackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  estimatedDelivery: {
    fontSize: 13,
    color: '#3B82F6',
    marginTop: 8,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  timeline: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineIconContainer: {
    alignItems: 'center',
    width: 40,
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconCompleted: {
    backgroundColor: '#10B981',
  },
  timelineIconCurrent: {
    backgroundColor: '#3B82F6',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#10B981',
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 8,
  },
  timelineLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  timelineLabelCompleted: {
    color: '#1F2937',
  },
  trackingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackingInfo: {
    flex: 1,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemVariant: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 13,
    color: '#6B7280',
  },
  itemSubtotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
    textAlign: 'right',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  addressPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentMethodLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentMethodValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  paymentStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentStatusLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
  },
  discountValue: {
    color: '#10B981',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  actionButtons: {
    marginHorizontal: 16,
    gap: 12,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  reorderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  bottomSpacer: {
    height: 32,
  },
});
