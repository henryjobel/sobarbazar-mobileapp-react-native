import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();

  const doorLeftRotation = useSharedValue(0);
  const doorRightRotation = useSharedValue(0);
  const doorOpacity = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.8);

  useEffect(() => {
    // Step 1: Doors are closed initially (0deg)
    doorLeftRotation.value = 0;
    doorRightRotation.value = 0;

    // Step 2: Start door opening animation
    setTimeout(() => {
      doorLeftRotation.value = withTiming(-90, { duration: 1500 });
      doorRightRotation.value = withTiming(90, { duration: 1500 });
    }, 400);

    // Step 3: After fully opened, fade out doors
    setTimeout(() => {
      doorOpacity.value = withTiming(0, { duration: 600 });
    }, 2000);

    // Step 4: Show content
    setTimeout(() => {
      contentOpacity.value = withTiming(1, { duration: 700 });
      contentScale.value = withSpring(1);
    }, 2600);

  }, []);

  const leftDoorStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${doorLeftRotation.value}deg` }
    ],
    opacity: doorOpacity.value
  }));

  const rightDoorStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${doorRightRotation.value}deg` }
    ],
    opacity: doorOpacity.value
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }]
  }));

  const handleGetStarted = () => {
    // Navigate to home screen (tabs)
    router.push('/(tabs)');
  };

  return (
    <View style={styles.container}>

      <LinearGradient
        colors={['#f3faf2', '#f3faf2', '#f3faf2']} // Changed to your color
        style={styles.background}
      />

      {/* Doors */}
      <Animated.View style={[styles.leftDoor, leftDoorStyle]}>
        <LinearGradient
          colors={['#ffffff', '#f8f8f8', '#f0f0f0']} // White doors
          style={styles.doorGradient}
        />
      </Animated.View>

      <Animated.View style={[styles.rightDoor, rightDoorStyle]}>
        <LinearGradient
          colors={['#ffffff', '#f8f8f8', '#f0f0f0']} // White doors
          style={styles.doorGradient}
        />
      </Animated.View>

      {/* Content */}
      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.welcome}>Welcome to</Text>
        <Text style={styles.appName}>Sobarbazar</Text>
        <Text style={styles.subtitle}>Get start to shopping</Text>
        <Text style={styles.tagline}>New start, new shopping experience with us</Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4CAF50', '#45a049', '#3d8b40']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>GET STARTED</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3faf2', // Your color
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },

  leftDoor: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    left: 0,
    zIndex: 2,
    borderRightWidth: 2,
    borderRightColor: '#ddd'
  },

  rightDoor: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    right: 0,
    zIndex: 2,
    borderLeftWidth: 2,
    borderLeftColor: '#ddd'
  },

  doorGradient: {
    width: '100%',
    height: '100%'
  },

  content: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 1,
  },

  welcome: {
    fontSize: 28,
    color: '#666',
    marginBottom: 8,
  },

  appName: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#4CAF50', // Green color for app name
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 20,
    color: '#333',
    marginBottom: 12,
  },

  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 35,
  },

  button: {
    width: 250,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center'
  },

  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold'
  }
});