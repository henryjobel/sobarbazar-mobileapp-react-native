import { Ionicons } from '@expo/vector-icons';
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
import { SafeAreaView } from 'react-native-safe-area-context';

const CONTACT_INFO = {
  phone: '+880 1700-000000',
  email: 'support@sobarbazar.com',
  whatsapp: '+8801700000000',
  address: 'House 123, Road 456, Dhaka 1205, Bangladesh',
  hours: 'Sat - Thu: 9:00 AM - 10:00 PM',
};

const QUICK_TOPICS = [
  { id: 'order', label: 'Order Issue', icon: 'cube-outline' },
  { id: 'refund', label: 'Refund Request', icon: 'cash-outline' },
  { id: 'delivery', label: 'Delivery Problem', icon: 'car-outline' },
  { id: 'product', label: 'Product Query', icon: 'pricetag-outline' },
  { id: 'account', label: 'Account Help', icon: 'person-outline' },
  { id: 'other', label: 'Other', icon: 'chatbubble-outline' },
];

export default function ContactScreen() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Message should be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Message Sent',
        'Thank you for contacting us. We will respond to your inquiry within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
              });
              setSelectedTopic(null);
            },
          },
        ]
      );
    }, 1500);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${CONTACT_INFO.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${CONTACT_INFO.email}`);
  };

  const handleWhatsApp = () => {
    const message = selectedTopic
      ? `Hi, I need help with: ${QUICK_TOPICS.find(t => t.id === selectedTopic)?.label}`
      : 'Hi, I need help';
    Linking.openURL(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(message)}`);
  };

  const handleMap = () => {
    const address = encodeURIComponent(CONTACT_INFO.address);
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Quick Contact */}
          <View style={styles.quickContactSection}>
            <Text style={styles.sectionTitle}>Quick Contact</Text>
            <View style={styles.quickContactCards}>
              <TouchableOpacity style={styles.quickContactCard} onPress={handleCall}>
                <View style={[styles.quickContactIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="call" size={24} color="#10B981" />
                </View>
                <Text style={styles.quickContactLabel}>Call Us</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickContactCard} onPress={handleWhatsApp}>
                <View style={[styles.quickContactIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                </View>
                <Text style={styles.quickContactLabel}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickContactCard} onPress={handleEmail}>
                <View style={[styles.quickContactIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="mail" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.quickContactLabel}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.infoSection}>
            <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
              <View style={styles.infoIcon}>
                <Ionicons name="call-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{CONTACT_INFO.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
              <View style={styles.infoIcon}>
                <Ionicons name="mail-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{CONTACT_INFO.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow} onPress={handleMap}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{CONTACT_INFO.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={[styles.infoRow, styles.lastInfoRow]}>
              <View style={styles.infoIcon}>
                <Ionicons name="time-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Business Hours</Text>
                <Text style={styles.infoValue}>{CONTACT_INFO.hours}</Text>
              </View>
            </View>
          </View>

          {/* Contact Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Send us a Message</Text>

            {/* Topic Selection */}
            <Text style={styles.inputLabel}>What can we help you with?</Text>
            <View style={styles.topicsGrid}>
              {QUICK_TOPICS.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={[
                    styles.topicChip,
                    selectedTopic === topic.id && styles.topicChipSelected,
                  ]}
                  onPress={() => setSelectedTopic(topic.id)}
                >
                  <Ionicons
                    name={topic.icon as any}
                    size={16}
                    color={selectedTopic === topic.id ? '#fff' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.topicChipText,
                      selectedTopic === topic.id && styles.topicChipTextSelected,
                    ]}
                  >
                    {topic.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Name */}
            <Text style={styles.inputLabel}>Your Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            {/* Email */}
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Phone */}
            <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="01XXXXXXXXX"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />

            {/* Subject */}
            <Text style={styles.inputLabel}>Subject (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief subject of your inquiry"
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
            />

            {/* Message */}
            <Text style={styles.inputLabel}>Your Message *</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.message && styles.inputError]}
              placeholder="Describe your inquiry in detail..."
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Send Message</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickContactSection: {
    marginBottom: 16,
  },
  quickContactCards: {
    flexDirection: 'row',
    gap: 12,
  },
  quickContactCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickContactIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickContactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  topicChipSelected: {
    backgroundColor: '#3B82F6',
  },
  topicChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  topicChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
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
    minHeight: 120,
    paddingTop: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 24,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
});
