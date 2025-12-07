import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const vendors = [
  {
    id: 1,
    name: "Nike",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
  },
  {
    id: 2,
    name: "Apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  },
  {
    id: 3,
    name: "Sony",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Sony_logo.svg",
  },
  {
    id: 4,
    name: "Samsung",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
  },
  {
    id: 5,
    name: "Adidas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
  },
];

export default function Vendors() {
  return (
    <View style={styles.container}>
      {/* Section Title */}
      <Text style={styles.title}>Top Brands</Text>
      <Text style={styles.subtitle}>Shop from your favorite vendors</Text>

      {/* Horizontal Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {vendors.map((vendor) => (
          <TouchableOpacity key={vendor.id} style={styles.card}>
            <Image source={{ uri: vendor.logo }} style={styles.logo} />
            <Text style={styles.name}>{vendor.name}</Text>
          </TouchableOpacity>
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
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 100,
    height: 120,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    padding: 10,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    color: "#222",
  },
});
