import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

type ShippingArea = 'IN' | 'OUT';
type PaymentMethod = 'COD' | 'OP';

interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area: ShippingArea;
  postal_code: string;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    cart,
    checkout,
    shippingArea,
    setShippingArea,
    isLoading,
    subtotal,
    total,
    deliveryCharge,
  } = useCart();

  const cartItems = cart?.items || [];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [address, setAddress] = useState<ShippingAddress>({
    name: user?.name || user?.first_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    area: shippingArea,
    postal_code: '',
  });

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {};

    if (!address.name.trim()) newErrors.name = 'Name is required';
    if (!address.phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^01[3-9]\d{8}$/.test(address.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number (e.g., 01712345678)';
    }
    if (!address.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(address.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!address.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields correctly');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await checkout({
        shipping_address: {
          name: address.name,
          phone: address.phone,
          email: address.email,
          address: address.address + (address.city ? ', ' + address.city : ''),
          area: shippingArea,
        },
        payment_method: paymentMethod,
        notes,
      });

      setIsSubmitting(false);

      if (result.success) {
        // If online payment, open payment URL
        if (result.payment_url) {
          Linking.openURL(result.payment_url);
          return;
        }

        // COD order success
        router.replace({
          pathname: '/screens/order-success',
          params: { orderId: result.orderId || '' },
        });
      } else {
        router.replace({
          pathname: '/screens/order-failed',
          params: { error: result.error || 'Order failed' },
        });
      }
    } catch (error: any) {
      setIsSubmitting(false);
      Alert.alert('Error', error.message || 'Failed to place order');
    }
  };

  const updateAddress = (field: keyof ShippingAddress, value: string) => {
    setAddress({ ...address, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  // ✅ FIXED: Get product image with multiple fallbacks
  const getItemImage = (item: any): string => {
    const imageUrl =
      item.variant?.image ||
      item.product_image ||
      item.variant?.product_image ||
      item.variant?.product?.image ||
      item.image ||
      null;

    return imageUrl || 'https://via.placeholder.com/90/299e60/FFFFFF?text=Product';
  };

  // ✅ FIXED: Get product name with fallbacks
  const getItemName = (item: any): string => {
    return (
      item.variant?.name ||
      item.product_name ||
      item.name ||
      'Product'
    );
  };

  const getItemPrice = (item: any): number => {
    return item.variant?.final_price || item.variant?.price || item.discounted_price || 0;
  };

  // ✅ FIXED: Format variant attributes (handles Python dict format with single quotes)
  const formatVariantAttributes = (attributes: any): string => {
    if (!attributes) return '';

    let result = '';

    // If it's a string
    if (typeof attributes === 'string') {
      // Check if it looks like a Python dict or JSON
      if (attributes.includes('{') && attributes.includes(':')) {
        try {
          // ✅ FIX: Convert Python dict format to JSON format
          // Replace single quotes with double quotes
          const jsonString = attributes
            .replace(/'/g, '"')  // Replace single quotes with double quotes
            .replace(/None/g, 'null')  // Replace Python None with null
            .replace(/True/g, 'true')  // Replace Python True with true
            .replace(/False/g, 'false');  // Replace Python False with false

          const parsed = JSON.parse(jsonString);

          if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            // Convert to "Size: 41mm, Color: Midnight" format
            result = Object.entries(parsed)
              .filter(([_, value]) => value !== null && value !== undefined && value !== '')
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
          } else {
            result = jsonString.replace(/[{}"\[\]]/g, '');
          }
        } catch (error) {
          console.log('⚠️ Checkout - Parse error, cleaning string:', error);
          // Failed to parse, clean it manually
          result = attributes
            .replace(/[{}'"\[\]]/g, '')  // Remove braces and quotes
            .replace(/:/g, ': ')  // Add space after colons
            .trim();
        }
      } else {
        // Already a clean string
        result = attributes;
      }
    }
    // If it's already an object
    else if (typeof attributes === 'object' && attributes !== null && !Array.isArray(attributes)) {
      result = Object.entries(attributes)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    // Fallback
    else {
      result = String(attributes).replace(/[{}'"\[\]]/g, '');
    }

    return result;
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptyText}>Add some items to proceed with checkout</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.shopButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderItems}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemImageContainer}>
                  <Image
                    source={{ uri: getItemImage(item) }}
                    style={styles.itemImage}
                    contentFit="cover"
                  />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>{getItemName(item)}</Text>
                  {(() => {
                    const variantText = formatVariantAttributes(item.variant?.attributes);
                    return variantText ? (
                      <View style={styles.variantContainer}>
                        <Text style={styles.itemVariant}>{variantText}</Text>
                      </View>
                    ) : null;
                  })()}
                  <View style={styles.itemBottom}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.itemPrice}>৳{getItemPrice(item).toLocaleString()}</Text>
                      <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                    </View>
                    <View style={styles.totalBadge}>
                      <Text style={styles.totalBadgeText}>৳{(getItemPrice(item) * item.quantity).toLocaleString()}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter your full name"
              value={address.name}
              onChangeText={(text) => updateAddress('name', text)}
              editable={!isSubmitting}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <View style={[styles.phoneInputContainer, errors.phone && styles.inputError]}>
              <Text style={styles.phonePrefix}>+880</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="1712345678"
                value={address.phone}
                onChangeText={(text) => updateAddress('phone', text.replace(/\D/g, '').slice(0, 11))}
                keyboardType="phone-pad"
                editable={!isSubmitting}
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              value={address.email}
              onChangeText={(text) => updateAddress('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSubmitting}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.address && styles.inputError]}
              placeholder="House, Road, Area, City"
              value={address.address}
              onChangeText={(text) => updateAddress('address', text)}
              multiline
              numberOfLines={3}
              editable={!isSubmitting}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={address.city}
                onChangeText={(text) => updateAddress('city', text)}
                editable={!isSubmitting}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Postal Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Postal Code"
                value={address.postal_code}
                onChangeText={(text) => updateAddress('postal_code', text)}
                keyboardType="number-pad"
                editable={!isSubmitting}
              />
            </View>
          </View>
        </View>

        {/* Shipping Area */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Area</Text>
          <View style={styles.areaOptions}>
            <TouchableOpacity
              style={[styles.areaOption, shippingArea === 'IN' && styles.areaOptionActive]}
              onPress={() => setShippingArea('IN')}
              disabled={isSubmitting}
            >
              <View style={[styles.radioOuter, shippingArea === 'IN' && styles.radioOuterActive]}>
                {shippingArea === 'IN' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.areaInfo}>
                <Text style={[styles.areaTitle, shippingArea === 'IN' && styles.areaTitleActive]}>
                  Inside Dhaka
                </Text>
                <Text style={styles.areaSubtitle}>Delivery in 1-2 days</Text>
              </View>
              <Text style={[styles.areaPrice, shippingArea === 'IN' && styles.areaPriceActive]}>
                ৳{cart?.delivery_charge_inside_dhaka || 60}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.areaOption, shippingArea === 'OUT' && styles.areaOptionActive]}
              onPress={() => setShippingArea('OUT')}
              disabled={isSubmitting}
            >
              <View style={[styles.radioOuter, shippingArea === 'OUT' && styles.radioOuterActive]}>
                {shippingArea === 'OUT' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.areaInfo}>
                <Text style={[styles.areaTitle, shippingArea === 'OUT' && styles.areaTitleActive]}>
                  Outside Dhaka
                </Text>
                <Text style={styles.areaSubtitle}>Delivery in 3-5 days</Text>
              </View>
              <Text style={[styles.areaPrice, shippingArea === 'OUT' && styles.areaPriceActive]}>
                ৳{cart?.delivery_charge_outside_dhaka || 120}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod('COD')}
              disabled={isSubmitting}
            >
              <MaterialIcons
                name="payments"
                size={28}
                color={paymentMethod === 'COD' ? '#299e60' : '#6B7280'}
              />
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentTitle, paymentMethod === 'COD' && styles.paymentTitleActive]}>
                  Cash on Delivery
                </Text>
                <Text style={styles.paymentSubtitle}>Pay when you receive</Text>
              </View>
              <View style={[styles.radioOuter, paymentMethod === 'COD' && styles.radioOuterActive]}>
                {paymentMethod === 'COD' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'OP' && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod('OP')}
              disabled={isSubmitting}
            >
              <MaterialIcons
                name="credit-card"
                size={28}
                color={paymentMethod === 'OP' ? '#299e60' : '#6B7280'}
              />
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentTitle, paymentMethod === 'OP' && styles.paymentTitleActive]}>
                  Online Payment
                </Text>
                <Text style={styles.paymentSubtitle}>Card, bKash, Nagad</Text>
              </View>
              <View style={[styles.radioOuter, paymentMethod === 'OP' && styles.radioOuterActive]}>
                {paymentMethod === 'OP' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special instructions for your order..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            editable={!isSubmitting}
          />
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>৳{subtotal.toLocaleString()}</Text>
          </View>
          {(cart?.coupon_discount || 0) > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Coupon Discount</Text>
              <Text style={[styles.priceValue, styles.discountValue]}>
                -৳{(cart?.coupon_discount || 0).toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery ({shippingArea === 'IN' ? 'Inside Dhaka' : 'Outside Dhaka'})</Text>
            <Text style={styles.priceValue}>৳{deliveryCharge.toLocaleString()}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>৳{total.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>Total Amount</Text>
          <Text style={styles.bottomPrice}>৳{total.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderButton, (isSubmitting || isLoading) && styles.buttonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.placeOrderText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#299e60',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  orderItems: {
    gap: 12,
  },
  orderItem: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImageContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 10,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
  },
  variantContainer: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignSelf: 'flex-start',
  },
  itemVariant: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '500',
  },
  itemVariantLabel: {
    fontWeight: '700',
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  priceContainer: {
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#299e60',
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  totalBadge: {
    backgroundColor: '#299e60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  totalBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  phonePrefix: {
    paddingLeft: 16,
    fontSize: 15,
    color: '#6B7280',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  row: {
    flexDirection: 'row',
  },
  areaOptions: {
    gap: 12,
  },
  areaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  areaOptionActive: {
    borderColor: '#299e60',
    backgroundColor: '#F0FDF4',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: '#299e60',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#299e60',
  },
  areaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  areaTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  areaTitleActive: {
    color: '#299e60',
  },
  areaSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  areaPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  areaPriceActive: {
    color: '#299e60',
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  paymentOptionActive: {
    borderColor: '#299e60',
    backgroundColor: '#F0FDF4',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  paymentTitleActive: {
    color: '#299e60',
  },
  paymentSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  discountValue: {
    color: '#299e60',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#299e60',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomInfo: {
    flex: 1,
  },
  bottomLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  placeOrderButton: {
    backgroundColor: '#299e60',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
