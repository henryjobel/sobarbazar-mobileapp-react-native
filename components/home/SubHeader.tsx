import { Feather, SimpleLineIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, ViewStyle } from 'react-native';



interface SubHeaderProps {
  // You can add props here if needed
  // Example: location?: string;
  // Example: userName?: string;
}

const SubHeader: React.FC<SubHeaderProps> = () => {
  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      colors={['#bbe8ef', '#bdeee9', '#c3f1e3']}
      style={styles.container as ViewStyle}
    >
      <Feather name="map-pin" size={16} color="#2c4341" />
      <Text style={styles.deliver}>Deliver to MD.Jamal - Dhaka 897654</Text>
      <SimpleLineIcons name="arrow-down" size={10} color="#000000" />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliver: {
    fontSize: 13,
    color: '#2c4341',
    paddingHorizontal: 6,
  },
});

export default SubHeader;