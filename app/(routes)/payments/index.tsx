import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context';

interface PaymentMethod {
  id: string;
  type: 'cod' | 'bkash' | 'nagad' | 'card';
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  available: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cod',
    type: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: 'cash-outline',
    iconBg: '#10B981',
    available: true,
  },
  {
    id: 'bkash',
    type: 'bkash',
    name: 'bKash',
    description: 'Pay with your bKash account',
    icon: 'phone-portrait-outline',
    iconBg: '#E91E63',
    available: true,
  },
  {
    id: 'nagad',
    type: 'nagad',
    name: 'Nagad',
    description: 'Pay with your Nagad account',
    icon: 'phone-portrait-outline',
    iconBg: '#FF6F00',
    available: true,
  },
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, AMEX accepted',
    icon: 'card-outline',
    iconBg: '#3B82F6',
    available: false,
  },
];

export default function PaymentsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const renderLoginPrompt = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="wallet-outline" size={64} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>Login Required</Text>
      <Text style={styles.emptySubtitle}>
        Please login to view payment options
      </Text>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push('/(routes)/login')}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Methods</Text>
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIcon}>
            <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
          </View>
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>Secure Payments</Text>
            <Text style={styles.infoBannerText}>
              All payments are processed securely. Your payment information is never stored on our servers.
            </Text>
          </View>
        </View>

        {/* Available Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Payment Methods</Text>
          <Text style={styles.sectionSubtitle}>
            Choose from our supported payment options at checkout
          </Text>

          {PAYMENT_METHODS.map((method, index) => (
            <View
              key={method.id}
              style={[
                styles.methodCard,
                !method.available && styles.methodCardDisabled,
                index === PAYMENT_METHODS.length - 1 && styles.lastMethodCard,
              ]}
            >
              <View style={[styles.methodIcon, { backgroundColor: method.iconBg }]}>
                <Ionicons name={method.icon as any} size={22} color="#fff" />
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodHeader}>
                  <Text style={[
                    styles.methodName,
                    !method.available && styles.methodNameDisabled,
                  ]}>
                    {method.name}
                  </Text>
                  {method.available ? (
                    <View style={styles.availableBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.availableText}>Available</Text>
                    </View>
                  ) : (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>Coming Soon</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Saved Cards Section - Placeholder */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Saved Cards</Text>
              <Text style={styles.sectionSubtitle}>
                Quick checkout with saved payment methods
              </Text>
            </View>
          </View>

          <View style={styles.emptyCards}>
            <Ionicons name="card-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyCardsTitle}>No saved cards</Text>
            <Text style={styles.emptyCardsText}>
              Card saving will be available soon. For now, you can use bKash, Nagad, or Cash on Delivery.
            </Text>
          </View>
        </View>

        {/* Payment Security Info */}
        <View style={styles.securitySection}>
          <Text style={styles.securityTitle}>Payment Security</Text>

          <View style={styles.securityRow}>
            <View style={styles.securityIcon}>
              <Ionicons name="lock-closed" size={18} color="#3B82F6" />
            </View>
            <View style={styles.securityContent}>
              <Text style={styles.securityLabel}>256-bit SSL Encryption</Text>
              <Text style={styles.securityText}>Your data is encrypted end-to-end</Text>
            </View>
          </View>

          <View style={styles.securityRow}>
            <View style={styles.securityIcon}>
              <Ionicons name="eye-off" size={18} color="#3B82F6" />
            </View>
            <View style={styles.securityContent}>
              <Text style={styles.securityLabel}>No Card Storage</Text>
              <Text style={styles.securityText}>We never store your full card details</Text>
            </View>
          </View>

          <View style={[styles.securityRow, styles.lastSecurityRow]}>
            <View style={styles.securityIcon}>
              <Ionicons name="shield" size={18} color="#3B82F6" />
            </View>
            <View style={styles.securityContent}>
              <Text style={styles.securityLabel}>PCI DSS Compliant</Text>
              <Text style={styles.securityText}>Following industry security standards</Text>
            </View>
          </View>
        </View>

        {/* Help Section */}
        <TouchableOpacity
          style={styles.helpSection}
          onPress={() => router.push('/(routes)/contact')}
        >
          <View style={styles.helpIcon}>
            <Ionicons name="help-circle-outline" size={24} color="#3B82F6" />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Need help with payments?</Text>
            <Text style={styles.helpText}>Contact our support team for assistance</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

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
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  methodCardDisabled: {
    opacity: 0.6,
  },
  lastMethodCard: {
    borderBottomWidth: 0,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  methodNameDisabled: {
    color: '#9CA3AF',
  },
  methodDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availableText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  comingSoonBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  comingSoonText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
  },
  emptyCards: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyCardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyCardsText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  securitySection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastSecurityRow: {
    borderBottomWidth: 0,
  },
  securityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  securityContent: {
    flex: 1,
  },
  securityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  securityText: {
    fontSize: 13,
    color: '#6B7280',
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  helpText: {
    fontSize: 13,
    color: '#6B7280',
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
  bottomSpacer: {
    height: 32,
  },
});
