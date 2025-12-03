// import { getCategoryFromApi, getImgUrl } from '@/utils/helper';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import React, { useEffect, useState } from 'react';
// import {
//     ActivityIndicator,
//     Dimensions,
//     Image,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from 'react-native';


// const { width } = Dimensions.get('window');

// // Types
// type CategoryItem = {
//   id: string | number;
//   title: string;
//   image: string;
//   description?: string;
// };

// type RootStackParamList = {
//   ProductScreen: { categoryId: string | number; categoryName: string };
//   CategoryProducts: { categoryId: string | number };
// };

// type CategoryNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// // Styles
// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#ffffff',
//     paddingVertical: 16,
//     paddingHorizontal: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   scrollView: {
//     paddingHorizontal: 8,
//   },
//   categoryCard: {
//     alignItems: 'center',
//     marginHorizontal: 8,
//     width: 80,
//   },
//   imageContainer: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: '#f8f9fa',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   categoryImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   categoryTitle: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#2c4341',
//     textAlign: 'center',
//     marginTop: 4,
//   },
//   categoryDescription: {
//     fontSize: 10,
//     color: '#6c757d',
//     textAlign: 'center',
//     marginTop: 2,
//   },
//   loadingContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 20,
//   },
//   errorContainer: {
//     alignItems: 'center',
//     paddingVertical: 20,
//   },
//   errorText: {
//     color: '#dc3545',
//     fontSize: 14,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#2c4341',
//     marginLeft: 16,
//     marginBottom: 16,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     marginBottom: 12,
//   },
//   viewAllButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: '#007bff',
//     borderRadius: 16,
//   },
//   viewAllText: {
//     color: '#ffffff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
// });

// const Category: React.FC = () => {
//   const navigation = useNavigation<CategoryNavigationProp>();
//   const [categories, setCategories] = useState<CategoryItem[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       // Assuming your API function returns data or accepts a callback
//       await getCategoryFromApi((data: CategoryItem[]) => {
//         setCategories(data);
//       });
//     } catch (err) {
//       setError('Failed to load categories. Please try again.');
//       console.error('Category fetch error:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCategoryPress = (category: CategoryItem) => {
//     navigation.navigate('ProductScreen', {
//       categoryId: category.id,
//       categoryName: category.title,
//     });
//   };

//   const handleViewAll = () => {
//     // Navigate to all categories screen or expand view
//     navigation.navigate('CategoryProducts', { categoryId: 'all' });
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.sectionTitle}>Categories</Text>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="small" color="#007bff" />
//           <Text style={{ marginLeft: 8, color: '#6c757d' }}>Loading categories...</Text>
//         </View>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.sectionTitle}>Categories</Text>
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity onPress={fetchCategories} style={{ marginTop: 8 }}>
//             <Text style={{ color: '#007bff', fontSize: 14 }}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.sectionHeader}>
//         <Text style={styles.sectionTitle}>Categories</Text>
//         <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton}>
//           <Text style={styles.viewAllText}>View All</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.scrollView}
//       >
//         {categories.length > 0 ? (
//           categories.map((item) => (
//             <TouchableOpacity
//               key={item.id.toString()}
//               onPress={() => handleCategoryPress(item)}
//               style={styles.categoryCard}
//               activeOpacity={0.7}
//             >
//               <View style={styles.imageContainer}>
//                 <Image
//                   source={{ uri: getImgUrl(item.image) }}
//                   style={styles.categoryImage}
//                   resizeMode="cover"
//                 />
//               </View>
//               <Text style={styles.categoryTitle} numberOfLines={1}>
//                 {item.title}
//               </Text>
//               {item.description && (
//                 <Text style={styles.categoryDescription} numberOfLines={1}>
//                   {item.description}
//                 </Text>
//               )}
//             </TouchableOpacity>
//           ))
//         ) : (
//           <View style={{ paddingHorizontal: 20 }}>
//             <Text style={{ color: '#6c757d' }}>No categories available</Text>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// export default Category;

import { Categories } from '@/data/Categories';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');


type CategoryItem = {
  id: string | number;
  title: string;
  image: any; 
  description?: string;
};

type RootStackParamList = {
  ProductScreen: { categoryId: string | number; categoryName: string };
  CategoryProducts: { categoryId: string | number };
};

type CategoryNavigationProp = NativeStackNavigationProp<RootStackParamList>;


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
  },
  categoryImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c4341',
    textAlign: 'center',
    marginTop: 4,
  },
  categoryDescription: {
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c4341',
    marginLeft: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007bff',
    borderRadius: 16,
  },
  viewAllText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

const Category: React.FC = () => {
  const navigation = useNavigation<CategoryNavigationProp>();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API delay for better UX (optional)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Directly use the imported Categories data
      setCategories(Categories as CategoryItem[]);
      
    } catch (err) {
      setError('Failed to load categories. Please try again.');
      console.error('Category fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryPress = (category: CategoryItem) => {
    navigation.navigate('ProductScreen', {
      categoryId: category.id,
      categoryName: category.title,
    });
  };

  const handleViewAll = () => {
    // Navigate to all categories screen
    navigation.navigate('CategoryProducts', { categoryId: 'all' });
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007bff" />
          <Text style={{ marginLeft: 8, color: '#6c757d' }}>Loading categories...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchCategories} style={{ marginTop: 8 }}>
            <Text style={{ color: '#007bff', fontSize: 14 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main render
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
        {categories.length > 0 ? (
          categories.map((item) => (
            <TouchableOpacity
              key={item.id.toString()}
              onPress={() => handleCategoryPress(item)}
              style={styles.categoryCard}
              activeOpacity={0.7}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={item.image}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.categoryTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
            <Text style={{ color: '#6c757d' }}>No categories available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Category;