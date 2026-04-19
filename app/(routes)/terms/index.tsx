import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SECTIONS = [
  {
    id: '1',
    title: 'Terms of Service',
    icon: 'document-text-outline' as const,
    content: `Last updated: March 2026\n\nWelcome to SobarBazarBD. By downloading or using our app, you agree to these Terms of Service. Please read them carefully.\n\n• You must be at least 18 years old to use this service.\n• You are responsible for maintaining the confidentiality of your account and password.\n• You agree to provide accurate and complete information during registration.\n• Prohibited activities include fraud, misuse, or any unlawful activity.\n• We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    id: '2',
    title: 'Privacy Policy',
    icon: 'shield-checkmark-outline' as const,
    content: `We value your privacy and are committed to protecting your personal information.\n\nInformation We Collect:\n• Account information (name, email, phone number)\n• Order and transaction history\n• Device information and usage analytics\n\nHow We Use Your Information:\n• To process and fulfill your orders\n• To communicate about your account and orders\n• To improve our services and user experience\n• To prevent fraud and ensure security\n\nWe do not sell your personal data to third parties.`,
  },
  {
    id: '3',
    title: 'Refund & Return Policy',
    icon: 'refresh-outline' as const,
    content: `We want you to be satisfied with your purchase.\n\n• Items can be returned within 7 days of delivery.\n• Products must be in original condition with tags attached.\n• Refunds are processed within 3-5 business days after receiving the returned item.\n• Digital products and perishable goods are non-refundable.\n• To initiate a return, contact our support team through the Help section.`,
  },
  {
    id: '4',
    title: 'Delivery Policy',
    icon: 'bicycle-outline' as const,
    content: `Delivery timelines and policies:\n\n• Within Dhaka: 1-3 business days\n• Outside Dhaka: 3-7 business days\n• Express delivery available in selected areas\n• Delivery charges vary by location and order size\n• Free delivery on orders above BDT 1000 within Dhaka\n• We are not responsible for delays caused by natural disasters or other force majeure events.`,
  },
  {
    id: '5',
    title: 'Payment Policy',
    icon: 'card-outline' as const,
    content: `Payment methods and security:\n\n• We accept cash on delivery, mobile banking (bKash, Nagad, Rocket), and card payments.\n• All online transactions are encrypted and secure.\n• We do not store your card details on our servers.\n• In case of payment disputes, please contact us within 48 hours.\n• Prices are in Bangladeshi Taka (BDT) and include applicable taxes.`,
  },
];

export default function TermsScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
          Terms & Privacy
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Info Banner */}
        <View
          style={{
            backgroundColor: '#f0fdf4',
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
            borderLeftWidth: 3,
            borderLeftColor: '#16a34a',
          }}
        >
          <Ionicons name="information-circle" size={20} color="#16a34a" style={{ marginTop: 1 }} />
          <Text style={{ fontSize: 13, color: '#166534', flex: 1, lineHeight: 20 }}>
            Please read our terms and policies carefully. Using SobarBazarBD means you agree to these terms.
          </Text>
        </View>

        {/* Accordion Sections */}
        {SECTIONS.map(section => (
          <View
            key={section.id}
            style={{
              backgroundColor: '#fff',
              borderRadius: 14,
              marginBottom: 10,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: expandedId === section.id ? '#16a34a' : '#e5e7eb',
            }}
          >
            <TouchableOpacity
              onPress={() => toggle(section.id)}
              activeOpacity={0.75}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: expandedId === section.id ? '#f0fdf4' : '#f3f4f6',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name={section.icon}
                  size={20}
                  color={expandedId === section.id ? '#16a34a' : '#6b7280'}
                />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: '600',
                  color: expandedId === section.id ? '#15803d' : '#111827',
                }}
              >
                {section.title}
              </Text>
              <Ionicons
                name={expandedId === section.id ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#9ca3af"
              />
            </TouchableOpacity>

            {expandedId === section.id && (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingBottom: 16,
                  paddingTop: 2,
                  borderTopWidth: 1,
                  borderTopColor: '#f0fdf4',
                }}
              >
                <Text style={{ fontSize: 13.5, color: '#374151', lineHeight: 22 }}>
                  {section.content}
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Footer note */}
        <Text
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: '#9ca3af',
            marginTop: 10,
          }}
        >
          For questions, contact us at support@sobarbazarbd.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
