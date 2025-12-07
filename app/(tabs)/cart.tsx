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

export default function CartPage() {
  const [items, setItems] = useState([
    {
      id: 1,
      title: "Apple AirPods Pro 2",
      price: 249,
      qty: 1,
      image:
        "https://m.media-amazon.com/images/I/71cQWYVtcBL._AC_SL1500_.jpg",
    },
    {
      id: 2,
      title: "Sony XM5 Headphones",
      price: 399,
      qty: 1,
      image:
        "https://m.media-amazon.com/images/I/61cCmgqPsoL._AC_SL1500_.jpg",
    },
  ]);

  const add = (id) =>
    setItems(items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));

  const minus = (id) =>
    setItems(
      items.map((i) =>
        i.id === id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i
      )
    );

  const remove = (id) => setItems(items.filter((i) => i.id !== id));

  const total = items.reduce((t, i) => t + i.qty * i.price, 0);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>${item.price}</Text>

        {/* Quantity Box */}
        <View style={styles.qtyWrapper}>
          <TouchableOpacity onPress={() => minus(item.id)} style={styles.qtyBtnBox}>
            <Text style={styles.qtyBtn}>–</Text>
          </TouchableOpacity>

          <Text style={styles.qtyText}>{item.qty}</Text>

          <TouchableOpacity onPress={() => add(item.id)} style={styles.qtyBtnBox}>
            <Text style={styles.qtyBtn}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete Button */}
      <TouchableOpacity onPress={() => remove(item.id)} style={styles.deleteBtn}>
        <Feather name="trash-2" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.headerSub}>Review your items ✨</Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 160 }}
      />

      {/* Bottom Checkout Panel */}
      <View style={styles.bottom}>
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  header: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#222",
  },

  headerSub: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginHorizontal: 18,
    marginTop: 18,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },

  image: {
    width: 85,
    height: 85,
    borderRadius: 18,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  price: {
    fontSize: 17,
    color: "#007AFF",
    fontWeight: "700",
    marginVertical: 6,
  },

  qtyWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  qtyBtnBox: {
    backgroundColor: "#EFEFF5",
    padding: 8,
    borderRadius: 10,
  },

  qtyBtn: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333",
  },

  qtyText: {
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 12,
  },

  deleteBtn: {
    paddingLeft: 10,
  },

  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  totalLabel: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },

  totalValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#007AFF",
  },

  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
  },
});
