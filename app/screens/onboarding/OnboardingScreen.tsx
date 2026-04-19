import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: W, height: H } = Dimensions.get('window');
const API_BASE_URL = 'https://api.hetdcl.com';

// ─── Floating Particle ────────────────────────────────────────────────────────
function FloatingParticle({
  size,
  posStyle,
  duration = 15000,
}: {
  size: number;
  posStyle: object;
  duration?: number;
}) {
  const ty = useRef(new Animated.Value(0)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0.3)).current;
  const sc = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ty, { toValue: -60, duration: duration * 0.4, useNativeDriver: true }),
          Animated.timing(ty, { toValue: 15, duration: duration * 0.3, useNativeDriver: true }),
          Animated.timing(ty, { toValue: 0, duration: duration * 0.3, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(tx, { toValue: 25, duration: duration * 0.33, useNativeDriver: true }),
          Animated.timing(tx, { toValue: -18, duration: duration * 0.33, useNativeDriver: true }),
          Animated.timing(tx, { toValue: 0, duration: duration * 0.34, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(op, { toValue: 0.65, duration: duration * 0.25, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0.2, duration: duration * 0.25, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0.5, duration: duration * 0.25, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0.3, duration: duration * 0.25, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(sc, { toValue: 1.25, duration: duration * 0.5, useNativeDriver: true }),
          Animated.timing(sc, { toValue: 0.85, duration: duration * 0.5, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [duration, op, sc, tx, ty]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(47,181,104,0.22)',
        },
        posStyle,
        { opacity: op, transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }] },
      ]}
    />
  );
}

// ─── Store Slide Card ─────────────────────────────────────────────────────────
function StoreCard({ store }: { store: any }) {
  return (
    <View style={styles.storeCard}>
      <View style={styles.storeCardImg}>
        <Image
          source={
            store.logo
              ? { uri: store.logo }
              : require('../../../assets/images/logo.png')
          }
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.storeCardName} numberOfLines={1}>{store.name}</Text>
        <Text style={styles.storeCardDesc} numberOfLines={1}>
          {store.description || store.store_type || ''}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [activeStores, setActiveStores] = useState<any[]>([]);

  // Welcome fade-in
  const welcomeOp = useRef(new Animated.Value(0)).current;
  const welcomeTY = useRef(new Animated.Value(22)).current;
  const welcomeSc = useRef(new Animated.Value(0.96)).current;

  // Logo float
  const logoFloat = useRef(new Animated.Value(0)).current;

  // Glow pulse
  const glowSc = useRef(new Animated.Value(0.95)).current;
  const glowOp = useRef(new Animated.Value(0.5)).current;

  // Popup slide-in
  const popupTY = useRef(new Animated.Value(H)).current;

  useEffect(() => {
    // Fade-in welcome content
    Animated.parallel([
      Animated.timing(welcomeOp, { toValue: 1, duration: 800, delay: 120, useNativeDriver: true }),
      Animated.timing(welcomeTY, { toValue: 0, duration: 800, delay: 120, useNativeDriver: true }),
      Animated.timing(welcomeSc, { toValue: 1, duration: 800, delay: 120, useNativeDriver: true }),
    ]).start();

    // Logo float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: -12, duration: 1600, useNativeDriver: true }),
        Animated.timing(logoFloat, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    ).start();

    // Glow pulse loop
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(glowSc, { toValue: 1.18, duration: 1600, useNativeDriver: true }),
          Animated.timing(glowSc, { toValue: 0.95, duration: 1600, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(glowOp, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(glowOp, { toValue: 0.45, duration: 1600, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Fetch active stores
    const rakamari = { id: 'rokomari', name: 'RAKAMARI', logo: null, description: 'Exclusive Online Store' };
    fetch(`${API_BASE_URL}/api/v1.0/stores/public/`)
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        const list = json?.data || (Array.isArray(json) ? json : []);
        const active = list.filter((s: any) => s.is_active !== false);
        const mid = Math.floor(active.length / 2);
        const merged = [...active.slice(0, mid), rakamari, ...active.slice(mid)];
        setActiveStores(merged.length > 1 ? merged : [rakamari, ...active]);
      })
      .catch(() => setActiveStores([rakamari]));
  }, [glowOp, glowSc, logoFloat, welcomeOp, welcomeSc, welcomeTY]);

  const openPopup = () => {
    setShowPopup(true);
    Animated.spring(popupTY, { toValue: 0, useNativeDriver: true, bounciness: 5 }).start();
  };

  const closePopup = () => {
    Animated.timing(popupTY, { toValue: H, duration: 300, useNativeDriver: true }).start(() =>
      setShowPopup(false)
    );
  };

  const handleShopSelect = (shopType: string) => {
    closePopup();
    setTimeout(() => router.replace('/(tabs)'), 320);
  };

  return (
    <View style={styles.container}>
      {/* Background radial glow */}
      <Animated.View
        pointerEvents="none"
        style={[styles.bgGlow, { transform: [{ scale: glowSc }], opacity: glowOp }]}
      />

      {/* Floating Particles */}
      <FloatingParticle size={120} posStyle={{ top: H * 0.12, left: W * 0.06 }} duration={18000} />
      <FloatingParticle size={80} posStyle={{ top: H * 0.58, right: W * 0.1 }} duration={14000} />
      <FloatingParticle size={140} posStyle={{ bottom: H * 0.15, left: W * 0.15 }} duration={20000} />
      <FloatingParticle size={60} posStyle={{ top: H * 0.38, right: W * 0.2 }} duration={12000} />
      <FloatingParticle size={100} posStyle={{ top: H * 0.68, left: W * 0.48 }} duration={16000} />
      <FloatingParticle size={90} posStyle={{ top: H * 0.22, right: W * 0.3 }} duration={17000} />

      {/* Welcome Content */}
      <Animated.View
        style={[
          styles.welcomeContent,
          {
            opacity: welcomeOp,
            transform: [{ translateY: welcomeTY }, { scale: welcomeSc }],
          },
        ]}
      >
        {/* Logo with glow rings */}
        <View style={styles.logoWrapper}>
          <Animated.View
            pointerEvents="none"
            style={[styles.glowRing1, { transform: [{ scale: glowSc }], opacity: glowOp }]}
          />
          <Animated.View
            pointerEvents="none"
            style={[styles.glowRing2, { transform: [{ scale: glowSc }] }]}
          />
          <Animated.Image
            source={require('../../../assets/images/logo.png')}
            style={[styles.logo, { transform: [{ translateY: logoFloat }] }]}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome to SobarBazarBD</Text>
        <Text style={styles.subtitle}>Your One-Stop Shopping Destination</Text>

        {/* Start Shopping Button */}
        <TouchableOpacity
          style={styles.startBtn}
          onPress={openPopup}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#16a34a', '#15803d', '#166534']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.startBtnGrad}
          >
            <Text style={styles.startBtnText}>Start Shopping</Text>
            <Text style={styles.startBtnBangla}>(কেনাকাটা এইখানে)</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Become a Seller Button */}
        <TouchableOpacity
          style={styles.sellerBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.sellerBtnIcon}>🏪</Text>
          <View>
            <Text style={styles.sellerBtnText}>Become a Seller</Text>
            <Text style={styles.sellerBtnBangla}>(উদ্যোক্তা হউন)</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Shop Type Selection Modal */}
      <Modal visible={showPopup} transparent animationType="none" onRequestClose={closePopup}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closePopup} activeOpacity={1} />
          <Animated.View style={[styles.popupSheet, { transform: [{ translateY: popupTY }] }]}>
            {/* Back button */}
            <TouchableOpacity style={styles.popupBackBtn} onPress={closePopup}>
              <Text style={styles.popupBackArrow}>←</Text>
              <Text style={styles.popupBackText}> পেছনে যান</Text>
            </TouchableOpacity>

            {/* Header */}
            <Text style={styles.popupTitle}>আপনাদের সেবা বেছে নিন</Text>
            <Text style={styles.popupSubtitle}>Choose Your Shopping Experience</Text>

            {/* Retail / Wholesale cards */}
            <View style={styles.shopCardsRow}>
              {/* Retail */}
              <TouchableOpacity
                style={[styles.shopCard, styles.shopCardRetail]}
                onPress={() => handleShopSelect('retail')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#f0fdf4', '#dcfce7']}
                  style={styles.shopCardGrad}
                >
                  <View style={styles.shopCardIcon}>
                    <Text style={styles.shopCardIconText}>🛍️</Text>
                  </View>
                  <Text style={styles.shopCardTitle}>Retail Shop</Text>
                  <Text style={styles.shopCardBangla}>(খুচরা বিক্রেতা)</Text>
                  <Text style={styles.shopCardEnter}>Enter →</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Wholesale */}
              <TouchableOpacity
                style={[styles.shopCard, styles.shopCardWholesale]}
                onPress={() => handleShopSelect('wholesale')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#f0f9ff', '#dbeafe']}
                  style={styles.shopCardGrad}
                >
                  <View style={[styles.shopCardIcon, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                    <Text style={styles.shopCardIconText}>🚚</Text>
                  </View>
                  <Text style={[styles.shopCardTitle, { color: '#1d4ed8' }]}>Wholesale Shop</Text>
                  <Text style={[styles.shopCardBangla, { color: '#3b82f6' }]}>(পাইকারি বিক্রেতা)</Text>
                  <Text style={[styles.shopCardEnter, { color: '#2563eb' }]}>Enter →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Active Stores Slider */}
            {activeStores.length > 0 && (
              <View style={styles.storesSection}>
                <View style={styles.storesSectionHeader}>
                  <View style={styles.storesDot} />
                  <Text style={styles.storesSectionTitle}>আমাদের সক্রিয় দোকানসমূহ</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
                >
                  {[...activeStores, ...activeStores].map((store, i) => (
                    <StoreCard key={i} store={store} />
                  ))}
                </ScrollView>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eefff7',
    overflow: 'hidden',
  },

  // Background glow
  bgGlow: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(47,181,104,0.13)',
    top: H / 2 - 250,
    left: W / 2 - 250,
  },

  // Welcome content
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    zIndex: 10,
  },

  // Logo
  logoWrapper: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  glowRing1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(47,181,104,0.18)',
  },
  glowRing2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  logo: {
    width: 130,
    height: 130,
    zIndex: 2,
  },

  // Title & Subtitle
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#15803d',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(21,128,61,0.75)',
    textAlign: 'center',
    marginBottom: 36,
    letterSpacing: 0.2,
  },

  // Start Shopping button
  startBtn: {
    width: W * 0.75,
    borderRadius: 60,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    marginBottom: 16,
  },
  startBtnGrad: {
    paddingVertical: 17,
    alignItems: 'center',
    borderRadius: 60,
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  startBtnBangla: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 2,
  },

  // Become a Seller button
  sellerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: '#16a34a',
    backgroundColor: 'rgba(22,163,74,0.06)',
  },
  sellerBtnIcon: { fontSize: 20 },
  sellerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803d',
  },
  sellerBtnBangla: {
    fontSize: 11,
    color: 'rgba(21,128,61,0.7)',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  popupSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 30,
    maxHeight: H * 0.88,
  },

  popupBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  popupBackArrow: { fontSize: 22, color: '#374151' },
  popupBackText: { fontSize: 14, color: '#374151', fontWeight: '600' },

  popupTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginTop: 4,
  },
  popupSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 4,
  },

  // Shop type cards
  shopCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 28,
  },
  shopCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  shopCardRetail: {},
  shopCardWholesale: {},
  shopCardGrad: {
    padding: 20,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },
  shopCardIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(22,163,74,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopCardIconText: { fontSize: 28 },
  shopCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803d',
    marginBottom: 2,
  },
  shopCardBangla: {
    fontSize: 11,
    color: '#16a34a',
    marginBottom: 10,
  },
  shopCardEnter: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803d',
  },

  // Stores section
  storesSection: {
    marginTop: 4,
  },
  storesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  storesDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  storesSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 10,
    gap: 10,
    width: 160,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  storeCardImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  storeCardName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  storeCardDesc: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 1,
  },
});
