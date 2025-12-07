import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const vendors = [
  {
    id: 1,
    name: "Nike Store",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    shopUrl: "https://www.nike.com",
    tagline: "Sportswear & Shoes",
  },
  {
    id: 2,
    name: "Apple Store",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    shopUrl: "https://www.apple.com",
    tagline: "Premium Electronics",
  },
  {
    id: 3,
    name: "Sony Shop",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Sony_logo.svg",
    shopUrl: "https://www.sony.com",
    tagline: "Gadgets & Entertainment",
  },
  {
    id: 4,
    name: "Samsung Store",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
    shopUrl: "https://www.samsung.com",
    tagline: "Smartphones & Appliances",
  },
  {
    id: 5,
    name: "Adidas Shop",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    shopUrl: "https://www.adidas.com",
    tagline: "Sports & Lifestyle",
  },
];

export default function Vendors() {
  const [followed, setFollowed] = useState({});

  const toggleFollow = (id) => {
    setFollowed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const visitShop = (url) => {
    Alert.alert("Visit Shop", `Opening: ${url}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Shops</Text>
      <Text style={styles.subtitle}>Browse your favorite vendor shops</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {vendors.map((vendor) => (
          <View key={vendor.id} style={styles.card}>
            {/* Logo / Banner */}
            <View style={styles.logoContainer}>
              <Image source={{ uri: vendor.logo }} style={styles.logo} />
            </View>

            {/* Shop Name */}
            <Text style={styles.shopName}>{vendor.name}</Text>

            {/* Tagline */}
            <Text style={styles.tagline}>{vendor.tagline}</Text>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.followButton, followed[vendor.id] ? styles.following : styles.follow]}
                onPress={() => toggleFollow(vendor.id)}
              >
                <Text style={[styles.followText, followed[vendor.id] && { color: "#299e60" }]}>
                  {followed[vendor.id] ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.visitButton}
                onPress={() => visitShop(vendor.shopUrl)}
              >
                <Text style={styles.visitText}>Visit Shop</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingLeft: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  scroll: {
    paddingVertical: 10,
  },
  card: {
    width: 200,
    borderRadius: 20,
    backgroundColor: "#e6f9ef",
    marginRight: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: "contain",
  },
  shopName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: "#444",
    textAlign: "center",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  followButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 6,
    borderWidth: 1,
  },
  follow: {
    backgroundColor: "#299e60",
    borderColor: "#299e60",
  },
  following: {
    backgroundColor: "#fff",
    borderColor: "#299e60",
  },
  followText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  visitButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#299e60",
    backgroundColor: "#fff",
  },
  visitText: {
    color: "#299e60",
    fontWeight: "600",
    fontSize: 12,
  },
});
