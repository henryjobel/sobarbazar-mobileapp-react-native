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
  id: number | string;
  name?: string;
  title?: string;
  image?: string | any;
  icon?: string;
  isExclusive?: boolean;
  droploo_id?: number;
  image_url?: string;
  category?: {
    id: number;
    name: string;
  };
}

interface CategoryProps {
  categories?: CategoryItem[];
  exclusiveCategories?: CategoryItem[];
}

const Category: React.FC<CategoryProps> = ({ categories, exclusiveCategories }) => {
  const router = useRouter();

  // Format regular categories
  const regularFormatted = (categories && categories.length > 0
    ? categories.map(cat => ({
        id: cat.id,
        title: cat.name || cat.title || 'Category',
        image: cat.image || cat.icon,
        isExclusive: false,
      }))
    : Categories);

  // Format exclusive/RAKAMARI categories and append
  const exclusiveFormatted = (exclusiveCategories && exclusiveCategories.length > 0)
    ? exclusiveCategories.map(cat => ({
        id: `exclusive-${cat.droploo_id || cat.id}`,
        title: cat.name || 'RAKAMARI',
        image: cat.image_url || cat.image,
        droploo_id: cat.droploo_id || cat.id,
        isExclusive: true,
      }))
    : [];

  const displayCategories = [...regularFormatted, ...exclusiveFormatted];

  const handleCategoryPress = (category: any) => {
    if (category.isExclusive) {
      router.push(`/screens/rakamari?category=${category.droploo_id}&name=${encodeURIComponent(category.title)}`);
    } else {
      router.push(`/(tabs)/shop?category=${category.id}&name=${encodeURIComponent(category.title)}`);
    }
  };

  const handleViewAll = () => {
    router.push('/(tabs)/shop');
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
            <View style={[styles.imageContainer, item.isExclusive && styles.exclusiveImageContainer]}>
              {typeof item.image === 'string' ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.categoryImage}
                  contentFit="cover"
                />
              ) : item.image ? (
                <Image
                  source={item.image}
                  style={styles.categoryImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={{ fontSize: 22 }}>🌟</Text>
              )}
              {item.isExclusive && (
                <View style={styles.exclusiveBadge}>
                  <Text style={styles.exclusiveBadgeText}>R</Text>
                </View>
              )}
            </View>
            <Text style={[styles.categoryTitle, item.isExclusive && styles.exclusiveTitle]} numberOfLines={2}>
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
  exclusiveImageContainer: {
    borderColor: '#f59e0b',
    borderWidth: 2,
    backgroundColor: '#fffbeb',
  },
  exclusiveBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exclusiveBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  exclusiveTitle: {
    color: '#92400e',
  },
});

export default Category;
