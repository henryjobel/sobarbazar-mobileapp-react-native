import { useLocalSearchParams } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProductScreen() {
  const params = useLocalSearchParams();
  const { id, categoryName } = params;

  // Sample products data
  const sampleProducts = [
    { id: 1, name: 'Smartphone X', price: '₹29,999', image: '📱' },
    { id: 2, name: 'Laptop Pro', price: '₹79,999', image: '💻' },
    { id: 3, name: 'Headphones', price: '₹4,999', image: '🎧' },
    { id: 4, name: 'Smart Watch', price: '₹14,999', image: '⌚' },
    { id: 5, name: 'Tablet Air', price: '₹39,999', image: '📱' },
    { id: 6, name: 'Camera DSLR', price: '₹54,999', image: '📷' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{categoryName || 'Products'}</Text>
          <Text style={styles.subtitle}>Category ID: {id}</Text>
        </View>

        <View style={styles.productsContainer}>
          {sampleProducts.map((product) => (
            <TouchableOpacity 
              key={product.id} 
              style={styles.productCard}
              activeOpacity={0.7}
            >
              <View style={styles.productImage}>
                <Text style={styles.imageIcon}>{product.image}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.price}</Text>
                <Text style={styles.productDesc}>
                  High quality product with best features
                </Text>
              </View>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c4341',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  productsContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  imageIcon: {
    fontSize: 30,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c4341',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 12,
    color: '#6c757d',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#007bff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});