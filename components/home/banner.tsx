import React, { useEffect, useRef, useState } from 'react'
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'

const { width: screenWidth } = Dimensions.get('window')

// Banner images array - Add your actual image count here
const BANNER_IMAGES = [
  require('../../assets/images/banners/slider1.jpeg'),
  require('../../assets/images/banners/slider2.jpeg'),
  require('../../assets/images/banners/slider3.jpeg'),
  require('../../assets/images/banners/slider4.jpeg'),
  require('../../assets/images/banners/slider5.jpeg'),
]

interface BannerProps {
  banners?: any[];
}

export default function BigSaleBanner({ banners }: BannerProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  
  // Auto slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeIndex === BANNER_IMAGES.length - 1) {
        flatListRef.current?.scrollToIndex({
          index: 0,
          animated: true,
        })
        setActiveIndex(0)
      } else {
        flatListRef.current?.scrollToIndex({
          index: activeIndex + 1,
          animated: true,
        })
        setActiveIndex(prev => prev + 1)
      }
    }, 3000) // Change slide every 3 seconds

    return () => clearInterval(interval)
  }, [activeIndex])

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / slideSize)
    setActiveIndex(index)
  }

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => console.log(`Banner ${index + 1} pressed`)}
    >
      <Image
        source={item}
        style={styles.bannerImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  )

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {BANNER_IMAGES.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            activeIndex === index ? styles.activeDot : styles.inactiveDot
          ]}
        />
      ))}
    </View>
  )

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={BANNER_IMAGES}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={screenWidth}
        decelerationRate="fast"
      />
      
      {renderPagination()}
      
      {/* Optional: Show sale badge */}
      <View style={styles.saleBadge}>
        <Text style={styles.saleText}>BIG SALE</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    backgroundColor: '#fff',
    position: 'relative',
  },
  bannerImage: {
    width: screenWidth - 32,
    height: 200,
    borderRadius: 16,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF6B6B',
    width: 20,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  saleBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF4757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  saleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
})