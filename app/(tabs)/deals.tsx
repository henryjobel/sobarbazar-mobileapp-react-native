import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// Dummy Data
const banners = [
  "https://i.imgur.com/lj8D2GQ.png",
  "https://i.imgur.com/bU6P5Iv.png",
  "https://i.imgur.com/5yz5V4I.png",
];

const flashSales = [
  {
    id: 1,
    name: "Wireless Earbuds",
    price: 699,
    oldPrice: 1200,
    discount: 42,
    image: "https://i.imgur.com/QsmK4Yf.jpeg",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Smart Fitness Band",
    price: 1199,
    oldPrice: 2200,
    discount: 45,
    image: "https://i.imgur.com/YZy9Nul.jpeg",
    rating: 4.7,
  },
  {
    id: 3,
    name: "Mini Trimmer",
    price: 399,
    oldPrice: 800,
    discount: 50,
    image: "https://i.imgur.com/J1Y5ZyW.jpeg",
    rating: 4.4,
  },
];

const featuredProducts = [
  {
    id: 4,
    name: "Bluetooth Speaker",
    price: 899,
    oldPrice: 1500,
    discount: 40,
    image: "https://i.imgur.com/s2fQ4MG.jpeg",
    rating: 4.6,
  },
  {
    id: 5,
    name: "Smart Watch",
    price: 2999,
    oldPrice: 3600,
    discount: 17,
    image: "https://i.imgur.com/v9yFZlH.jpeg",
    rating: 4.8,
  },
  {
    id: 6,
    name: "Wireless Mouse",
    price: 499,
    oldPrice: 800,
    discount: 38,
    image: "https://i.imgur.com/9HRgTfu.jpeg",
    rating: 4.5,
  },
  {
    id: 7,
    name: "Portable Charger",
    price: 699,
    oldPrice: 1200,
    discount: 42,
    image: "https://i.imgur.com/Lv5VXUe.jpeg",
    rating: 4.6,
  },
];

export default function Deals() {
  const [timer, setTimer] = useState({ hours: 1, minutes: 30, seconds: 0 });

  // Countdown timer for flash sale
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds -= 1;
        else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const renderProduct = (item) => (
    <View key={item.id} style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />

      <View style={styles.discountTag}>
        <Text style={styles.discountText}>{item.discount}% OFF</Text>
      </View>

      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>৳ {item.price}</Text>
        <Text style={styles.oldPrice}>৳ {item.oldPrice}</Text>
      </View>

      <View style={styles.ratingRow}>
        <FontAwesome name="star" size={14} color="#FFD700" />
        <Text style={{ marginLeft: 4 }}>{item.rating}</Text>
      </View>

      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addBtnText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Deals & Offers</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Slider */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerRow}>
          {banners.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.banner} />
          ))}
        </ScrollView>

        {/* Flash Sale Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Flash Sale</Text>
          <Text style={styles.timer}>
            {timer.hours}h {timer.minutes}m {timer.seconds}s left
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {flashSales.map(renderProduct)}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎁 Featured Products</Text>
          <View style={styles.grid}>
            {featuredProducts.map(renderProduct)}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6F6" },

  header: {
    backgroundColor: "#FF6B00",
    paddingVertical: 20,
    paddingHorizontal: 16,
    elevation: 5,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },

  bannerRow: { paddingVertical: 10, paddingLeft: 16 },
  banner: { width: 300, height: 140, borderRadius: 12, marginRight: 12 },

  section: { marginTop: 20, paddingLeft: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  timer: { fontSize: 13, color: "#FF3B30", marginBottom: 10 },

  productCard: {
    backgroundColor: "#fff",
    width: 160,
    borderRadius: 12,
    marginRight: 12,
    padding: 8,
    elevation: 3,
  },
  productImage: { width: "100%", height: 120, borderRadius: 12 },

  discountTag: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  productName: { fontSize: 13, fontWeight: "600", marginTop: 6 },
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  price: { fontSize: 14, fontWeight: "700", color: "#FF6B00", marginRight: 6 },
  oldPrice: { fontSize: 11, color: "#999", textDecorationLine: "line-through" },

  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  addBtn: {
    marginTop: 6,
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingRight: 16 },
});
