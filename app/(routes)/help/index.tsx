import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    category: 'Orders',
    question: 'How do I track my order?',
    answer: 'You can track your order by going to "My Orders" in your account. Each order has a tracking status that shows where your package is. You\'ll also receive SMS and email updates when your order ships and is out for delivery.',
  },
  {
    id: '2',
    category: 'Orders',
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel your order if it hasn\'t been shipped yet. Go to "My Orders", select the order you want to cancel, and tap "Cancel Order". If the order has already shipped, you\'ll need to wait for delivery and then request a return.',
  },
  {
    id: '3',
    category: 'Orders',
    question: 'How long does delivery take?',
    answer: 'Delivery typically takes 2-5 business days within Dhaka and 3-7 business days outside Dhaka. Express delivery options are available for selected areas. You\'ll see the estimated delivery date at checkout.',
  },
  {
    id: '4',
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash on Delivery (COD), bKash, Nagad, and major credit/debit cards. You can select your preferred payment method at checkout.',
  },
  {
    id: '5',
    category: 'Payments',
    question: 'Is Cash on Delivery available?',
    answer: 'Yes, Cash on Delivery is available for all orders. You can pay in cash when your order is delivered. Please have the exact amount ready as delivery personnel may not carry change.',
  },
  {
    id: '6',
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We offer a 7-day return policy for most items. Products must be unused, in original packaging, and with all tags attached. Some categories like undergarments and perishable items are not eligible for return.',
  },
  {
    id: '7',
    category: 'Returns',
    question: 'How do I request a refund?',
    answer: 'To request a refund, go to "My Orders", select the delivered order, and tap "Request Refund". Fill in the reason and upload photos if applicable. Refunds are processed within 7-10 business days after we receive the returned item.',
  },
  {
    id: '8',
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'On the login screen, tap "Forgot Password" and enter your email address. We\'ll send you a link to reset your password. The link expires in 24 hours, so please reset your password promptly.',
  },
  {
    id: '9',
    category: 'Account',
    question: 'How do I update my contact information?',
    answer: 'Go to "Account" > "Personal Information" to update your name, phone number, and other details. To change your email address, please contact our support team.',
  },
  {
    id: '10',
    category: 'Products',
    question: 'Are all products genuine?',
    answer: 'Yes, we guarantee that all products sold on SobarBazar are 100% genuine. We source directly from authorized distributors and brands. If you receive a product you believe is not genuine, please contact us immediately.',
  },
];

const CATEGORIES = ['All', 'Orders', 'Payments', 'Returns', 'Account', 'Products'];

export default function HelpScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const renderFAQItem = (faq: FAQItem) => {
    const isExpanded = expandedId === faq.id;

    return (
      <TouchableOpacity
        key={faq.id}
        style={[styles.faqItem, isExpanded && styles.faqItemExpanded]}
        onPress={() => toggleExpand(faq.id)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <View style={styles.faqHeaderLeft}>
            <View style={styles.faqCategoryBadge}>
              <Text style={styles.faqCategoryText}>{faq.category}</Text>
            </View>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
          </View>
          <View style={[styles.expandIcon, isExpanded && styles.expandIconRotated]}>
            <Ionicons
              name="chevron-down"
              size={20}
              color={isExpanded ? '#3B82F6' : '#9CA3AF'}
            />
          </View>
        </View>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{faq.answer}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-buoy" size={48} color="#3B82F6" />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Search our FAQs or browse by topic below
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipSelected,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ List */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>
            Frequently Asked Questions
            <Text style={styles.resultCount}> ({filteredFAQs.length})</Text>
          </Text>

          {filteredFAQs.length > 0 ? (
            filteredFAQs.map(renderFAQItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search term or browse all categories
              </Text>
            </View>
          )}
        </View>

        {/* Still Need Help */}
        <View style={styles.stillNeedHelp}>
          <View style={styles.stillNeedHelpIcon}>
            <Ionicons name="chatbubbles-outline" size={32} color="#3B82F6" />
          </View>
          <Text style={styles.stillNeedHelpTitle}>Still need help?</Text>
          <Text style={styles.stillNeedHelpText}>
            Our support team is available to assist you
          </Text>
          <View style={styles.helpButtons}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => router.push('/(routes)/contact')}
            >
              <Ionicons name="mail-outline" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Contact Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => router.push('/(routes)/contact')}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#3B82F6" />
              <Text style={styles.chatButtonText}>Live Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <Text style={styles.quickLinksTitle}>Quick Links</Text>
          <View style={styles.quickLinksGrid}>
            <TouchableOpacity
              style={styles.quickLinkItem}
              onPress={() => router.push('/(routes)/my-oders')}
            >
              <View style={[styles.quickLinkIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="cube-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.quickLinkText}>Track Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickLinkItem}
              onPress={() => router.push('/(routes)/address')}
            >
              <View style={[styles.quickLinkIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="location-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.quickLinkText}>Addresses</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickLinkItem}
              onPress={() => router.push('/(routes)/payments')}
            >
              <View style={[styles.quickLinkIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="card-outline" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.quickLinkText}>Payments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickLinkItem}
              onPress={() => router.push('/(routes)/security')}
            >
              <View style={[styles.quickLinkIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="shield-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles.quickLinkText}>Security</Text>
            </TouchableOpacity>
          </View>
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContainer: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  categoryChipSelected: {
    backgroundColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  faqSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  resultCount: {
    fontWeight: '400',
    color: '#6B7280',
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  faqItemExpanded: {
    backgroundColor: '#F9FAFB',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  faqHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  faqCategoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  faqCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
  },
  expandIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandIconRotated: {
    backgroundColor: '#EFF6FF',
    transform: [{ rotate: '180deg' }],
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  stillNeedHelp: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  stillNeedHelpIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stillNeedHelpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  stillNeedHelpText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  helpButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  quickLinks: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  quickLinksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickLinkItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  quickLinkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  bottomSpacer: {
    height: 32,
  },
});
