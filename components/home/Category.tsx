import { Categories } from '@/data/Categories';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

interface CategoryItem {
  id: number;
  name?: string;
  title?: string;
  image?: string | any;
  icon?: string;
  category?: {
    id: number;
    name: string;
  };
}

interface CategoryProps {
  categories?: CategoryItem[];
}

const Category: React.FC<CategoryProps> = ({ categories }) => {
  const router = useRouter();

  // Use API categories if available, otherwise use local data
  const displayCategories = categories && categories.length > 0
    ? categories.map(cat => ({
        id: cat.id,
        title: cat.name || cat.title || 'Category',
        image: cat.image || cat.icon,
        categoryId: cat.category?.id,
      }))
    : Categories;

  const handleCategoryPress = (category: any) => {
    // Navigate to category products
    router.push({
      pathname: '/screens/shop',
      params: { categoryId: category.id, categoryName: category.title },
    });
  };

  const handleViewAll = () => {
    router.push('/screens/shop');
  };

  if (displayCategories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
      >
        {displayCategories.map((item: any) => (
          <TouchableOpacity
            key={item.id.toString()}
            onPress={() => handleCategoryPress(item)}
            style={styles.categoryCard}
            activeOpacity={0.7}
          >
            <View style={styles.imageContainer}>
              {typeof item.image === 'string' ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.categoryImage}
                  contentFit="cover"
                />
              ) : (
                <Image
                  source={item.image}
                  style={styles.categoryImage}
                  contentFit="cover"
                />
              )}
            </View>
            <Text style={styles.categoryTitle} numberOfLines={2}>
              {item.title || item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scrollView: {
    paddingHorizontal: 8,
  },
  categoryCard: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 80,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2c4341',
    textAlign: 'center',
    marginTop: 4,
    height: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c4341',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
  },
  viewAllText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Category;
