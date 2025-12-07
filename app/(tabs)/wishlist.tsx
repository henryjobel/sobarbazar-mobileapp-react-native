import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Wishlist() {
  const [items, setItems] = useState([
    {
      id: 1,
      title: "Nike Air Max 270",
      price: 129,
      image:
        "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/99aa8f75-bf67-4c77-b7b1-e0cc0633d5c7/air-max-270-shoes.png",
    },
    {
      id: 2,
      title: "Apple Watch Series 9",
      price: 399,
      image:
        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MX2D3ref_VW_PF+watch-case-45-alum-starlight-nc-s9_VW_PF_WF_CO?wid=2000&hei=2000",
    },
    {
      id: 3,
      title: "Sony WH-1000XM5",
      price: 349,
      image:
        "https://m.media-amazon.com/images/I/61cCmgqPsoL._AC_SL1500_.jpg",
    },
  ]);

  const remove = (id) => setItems(items.filter((i) => i.id !== id));

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* Floating Heart Button */}
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={() => remove(item.id)}
      >
        <Feather name="heart" size={22} color="#FF3B30" />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.price}>${item.price}</Text>

        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* ⭐ Updated Header — SAME as Cart Page ⭐ */}
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.headerSubtitle}>Your saved products ❤️</Text>
      </View>

      <FlatList
        data={items}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingHorizontal: 16,
  },

  /* Cart-style header */
  headerBox: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
    marginHorizontal: -16,
    marginBottom: 10,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#222",
  },

  headerSubtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    width: "48%",
    borderRadius: 18,
    marginBottom: 18,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },

  image: {
    width: "100%",
    height: 150,
  },

  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 50,
    elevation: 4,
  },

  info: {
    padding: 14,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },

  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 12,
  },

  addBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },

  addBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});
