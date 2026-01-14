import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'orders',
      title: 'Order Updates',
      description: 'Get notified about order status changes',
      icon: 'cube-outline',
      enabled: true,
    },
    {
      id: 'promotions',
      title: 'Promotions & Offers',
      description: 'Receive exclusive deals and discount alerts',
      icon: 'pricetag-outline',
      enabled: true,
    },
    {
      id: 'price_drops',
      title: 'Price Drops',
      description: 'Alert when wishlist items go on sale',
      icon: 'trending-down-outline',
      enabled: true,
    },
    {
      id: 'new_arrivals',
      title: 'New Arrivals',
      description: 'Discover new products in your favorite categories',
      icon: 'sparkles-outline',
      enabled: false,
    },
    {
      id: 'back_in_stock',
      title: 'Back in Stock',
      description: 'Get notified when out-of-stock items return',
      icon: 'refresh-outline',
      enabled: true,
    },
    {
      id: 'reminders',
      title: 'Cart Reminders',
      description: 'Remind about items left in your cart',
      icon: 'cart-outline',
      enabled: false,
    },
  ]);

  const [emailSettings, setEmailSettings] = useState({
    newsletter: true,
    orderConfirmation: true,
    shipping: true,
    reviews: false,
  });

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const toggleAllPush = (value: boolean) => {
    setPushEnabled(value);
    if (!value) {
      setSettings(settings.map(s => ({ ...s, enabled: false })));
    }
  };

  const renderLoginPrompt = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="notifications-outline" size={64} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>Login Required</Text>
      <Text style={styles.emptySubtitle}>
        Please login to manage your notification preferences
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
          <Text style={styles.headerTitle}>Notifications</Text>
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Master Toggle */}
        <View style={styles.masterToggle}>
          <View style={styles.masterToggleInfo}>
            <View style={styles.masterIconContainer}>
              <Ionicons name="notifications" size={24} color="#3B82F6" />
            </View>
            <View style={styles.masterTextContainer}>
              <Text style={styles.masterTitle}>Push Notifications</Text>
              <Text style={styles.masterSubtitle}>
                {pushEnabled ? 'Enabled for this device' : 'All notifications disabled'}
              </Text>
            </View>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={toggleAllPush}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={pushEnabled ? '#3B82F6' : '#9CA3AF'}
          />
        </View>

        {/* Push Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          <Text style={styles.sectionSubtitle}>
            Choose what notifications you want to receive
          </Text>

          {settings.map((setting, index) => (
            <View
              key={setting.id}
              style={[
                styles.settingRow,
                index === settings.length - 1 && styles.lastSettingRow,
              ]}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons
                  name={setting.icon as any}
                  size={22}
                  color={setting.enabled && pushEnabled ? '#3B82F6' : '#9CA3AF'}
                />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[
                  styles.settingTitle,
                  (!pushEnabled || !setting.enabled) && styles.settingTitleDisabled,
                ]}>
                  {setting.title}
                </Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.enabled && pushEnabled}
                onValueChange={() => toggleSetting(setting.id)}
                disabled={!pushEnabled}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={setting.enabled && pushEnabled ? '#3B82F6' : '#9CA3AF'}
              />
            </View>
          ))}
        </View>

        {/* Email Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          <Text style={styles.sectionSubtitle}>
            Manage your email preferences
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="mail-outline" size={22} color={emailSettings.newsletter ? '#3B82F6' : '#9CA3AF'} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Newsletter</Text>
              <Text style={styles.settingDescription}>Weekly updates and recommendations</Text>
            </View>
            <Switch
              value={emailSettings.newsletter}
              onValueChange={(v) => setEmailSettings({ ...emailSettings, newsletter: v })}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={emailSettings.newsletter ? '#3B82F6' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="receipt-outline" size={22} color={emailSettings.orderConfirmation ? '#3B82F6' : '#9CA3AF'} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Order Confirmation</Text>
              <Text style={styles.settingDescription}>Email confirmation after purchase</Text>
            </View>
            <Switch
              value={emailSettings.orderConfirmation}
              onValueChange={(v) => setEmailSettings({ ...emailSettings, orderConfirmation: v })}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={emailSettings.orderConfirmation ? '#3B82F6' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="car-outline" size={22} color={emailSettings.shipping ? '#3B82F6' : '#9CA3AF'} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Shipping Updates</Text>
              <Text style={styles.settingDescription}>Track your order via email</Text>
            </View>
            <Switch
              value={emailSettings.shipping}
              onValueChange={(v) => setEmailSettings({ ...emailSettings, shipping: v })}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={emailSettings.shipping ? '#3B82F6' : '#9CA3AF'}
            />
          </View>

          <View style={[styles.settingRow, styles.lastSettingRow]}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="star-outline" size={22} color={emailSettings.reviews ? '#3B82F6' : '#9CA3AF'} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Review Requests</Text>
              <Text style={styles.settingDescription}>Reminders to review purchased items</Text>
            </View>
            <Switch
              value={emailSettings.reviews}
              onValueChange={(v) => setEmailSettings({ ...emailSettings, reviews: v })}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={emailSettings.reviews ? '#3B82F6' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.infoNoteText}>
            You can also manage notifications from your device settings. Changes may take a few minutes to apply.
          </Text>
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
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  masterToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  masterIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  masterTextContainer: {
    flex: 1,
  },
  masterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  masterSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastSettingRow: {
    borderBottomWidth: 0,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingTitleDisabled: {
    color: '#9CA3AF',
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
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
