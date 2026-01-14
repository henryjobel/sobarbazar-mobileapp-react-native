import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context';

interface Address {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  address: string;
  area: string;
  city: string;
  postal_code?: string;
  is_default: boolean;
  label?: string;
}

const CITIES = [
  { label: 'Dhaka', value: 'dhaka' },
  { label: 'Chittagong', value: 'chittagong' },
  { label: 'Sylhet', value: 'sylhet' },
  { label: 'Rajshahi', value: 'rajshahi' },
  { label: 'Khulna', value: 'khulna' },
  { label: 'Barishal', value: 'barishal' },
  { label: 'Rangpur', value: 'rangpur' },
  { label: 'Mymensingh', value: 'mymensingh' },
];

const LABELS = [
  { label: 'Home', icon: 'home-outline', value: 'home' },
  { label: 'Office', icon: 'business-outline', value: 'office' },
  { label: 'Other', icon: 'location-outline', value: 'other' },
];

const BASE_URL = 'https://api.hetdcl.com';

export default function AddressScreen() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    area: '',
    city: 'dhaka',
    postal_code: '',
    label: 'home',
    is_default: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchAddresses = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/api/v1.0/customers/addresses/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAddresses(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchAddresses]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAddresses();
  }, [fetchAddresses]);

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      address: '',
      area: '',
      city: 'dhaka',
      postal_code: '',
      label: 'home',
      is_default: false,
    });
    setErrors({});
    setEditingAddress(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      full_name: address.full_name,
      phone: address.phone,
      email: address.email || '',
      address: address.address,
      area: address.area || '',
      city: address.city?.toLowerCase() || 'dhaka',
      postal_code: address.postal_code || '',
      label: address.label || 'home',
      is_default: address.is_default,
    });
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^01[3-9]\d{8}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid Bangladesh phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const url = editingAddress
        ? `${BASE_URL}/api/v1.0/customers/addresses/${editingAddress.id}/`
        : `${BASE_URL}/api/v1.0/customers/addresses/`;

      const res = await fetch(url, {
        method: editingAddress ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchAddresses();
      } else {
        Alert.alert('Error', 'Failed to save address. Please try again.');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (address: Address) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete this address?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(
                `${BASE_URL}/api/v1.0/customers/addresses/${address.id}/`,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );

              if (res.ok) {
                fetchAddresses();
              } else {
                Alert.alert('Error', 'Failed to delete address.');
              }
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Something went wrong.');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (address: Address) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/v1.0/customers/addresses/${address.id}/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_default: true }),
        }
      );

      if (res.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const getLabelIcon = (label: string) => {
    const found = LABELS.find(l => l.value === label);
    return found?.icon || 'location-outline';
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.labelContainer}>
          <View style={[styles.labelIcon, item.is_default && styles.labelIconDefault]}>
            <Ionicons
              name={getLabelIcon(item.label || 'home') as any}
              size={18}
              color={item.is_default ? '#fff' : '#6B7280'}
            />
          </View>
          <View>
            <View style={styles.labelRow}>
              <Text style={styles.labelText}>
                {item.label?.charAt(0).toUpperCase() + (item.label?.slice(1) || '')}
              </Text>
              {item.is_default && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressName}>{item.full_name}</Text>
          </View>
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="create-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.addressContent}>
        <Text style={styles.addressText}>{item.address}</Text>
        <Text style={styles.addressText}>
          {item.area}{item.city ? `, ${item.city}` : ''}
          {item.postal_code ? ` - ${item.postal_code}` : ''}
        </Text>
        <Text style={styles.phoneText}>{item.phone}</Text>
      </View>

      {!item.is_default && (
        <TouchableOpacity
          style={styles.setDefaultButton}
          onPress={() => handleSetDefault(item)}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#3B82F6" />
          <Text style={styles.setDefaultText}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="location-outline" size={64} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No addresses yet</Text>
      <Text style={styles.emptySubtitle}>
        Add a delivery address to make checkout faster
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Address</Text>
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
        Please login to manage your addresses
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Addresses</Text>
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
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity style={styles.addIconButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Addresses List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContainer,
            addresses.length === 0 && styles.emptyListContainer,
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

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingAddress ? 'Edit Address' : 'Add Address'}
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
              <Text style={[styles.modalSave, isSaving && styles.modalSaveDisabled]}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Label Selection */}
            <Text style={styles.inputLabel}>Address Label</Text>
            <View style={styles.labelSelector}>
              {LABELS.map((label) => (
                <TouchableOpacity
                  key={label.value}
                  style={[
                    styles.labelOption,
                    formData.label === label.value && styles.labelOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, label: label.value })}
                >
                  <Ionicons
                    name={label.icon as any}
                    size={20}
                    color={formData.label === label.value ? '#fff' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.labelOptionText,
                      formData.label === label.value && styles.labelOptionTextSelected,
                    ]}
                  >
                    {label.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Full Name */}
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.full_name && styles.inputError]}
              placeholder="Enter full name"
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
            />
            {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}

            {/* Phone */}
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="01XXXXXXXXX"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            {/* Email */}
            <Text style={styles.inputLabel}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Address */}
            <Text style={styles.inputLabel}>Street Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.address && styles.inputError]}
              placeholder="House/Flat no., Street, Building"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

            {/* Area */}
            <Text style={styles.inputLabel}>Area *</Text>
            <TextInput
              style={[styles.input, errors.area && styles.inputError]}
              placeholder="Enter area/locality"
              value={formData.area}
              onChangeText={(text) => setFormData({ ...formData, area: text })}
            />
            {errors.area && <Text style={styles.errorText}>{errors.area}</Text>}

            {/* City */}
            <Text style={styles.inputLabel}>City *</Text>
            <View style={styles.citySelector}>
              {CITIES.map((city) => (
                <TouchableOpacity
                  key={city.value}
                  style={[
                    styles.cityOption,
                    formData.city === city.value && styles.cityOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, city: city.value })}
                >
                  <Text
                    style={[
                      styles.cityOptionText,
                      formData.city === city.value && styles.cityOptionTextSelected,
                    ]}
                  >
                    {city.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Postal Code */}
            <Text style={styles.inputLabel}>Postal Code (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter postal code"
              value={formData.postal_code}
              onChangeText={(text) => setFormData({ ...formData, postal_code: text })}
              keyboardType="number-pad"
            />

            {/* Default Checkbox */}
            <TouchableOpacity
              style={styles.defaultCheckbox}
              onPress={() => setFormData({ ...formData, is_default: !formData.is_default })}
            >
              <View style={[styles.checkbox, formData.is_default && styles.checkboxChecked]}>
                {formData.is_default && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Set as default address</Text>
            </TouchableOpacity>

            <View style={styles.modalBottomSpacer} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
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
  addressCard: {
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
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  labelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  labelIconDefault: {
    backgroundColor: '#3B82F6',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  defaultBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
  },
  addressName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContent: {
    marginLeft: 52,
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  phoneText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  setDefaultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  setDefaultText: {
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  modalSaveDisabled: {
    color: '#9CA3AF',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  labelSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  labelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  labelOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  labelOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  labelOptionTextSelected: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  citySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  cityOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  cityOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  cityOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#374151',
  },
  modalBottomSpacer: {
    height: 40,
  },
});
