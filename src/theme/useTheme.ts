/**
 * Theme Hook
 * Provides theme values with dark mode support
 */

import { useColorScheme } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';
import { Colors } from '@/constants/theme';

export default function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: {
      // Spread all color palettes
      ...colors,

      // Dynamic colors based on theme
      text: isDark ? Colors.dark.text : Colors.light.text,
      background: isDark ? Colors.dark.background : Colors.light.background,
      backgroundSecondary: isDark ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary,
      tint: isDark ? Colors.dark.tint : Colors.light.tint,
      icon: isDark ? Colors.dark.icon : Colors.light.icon,

      // Card colors
      card: isDark ? '#1F2937' : '#FFFFFF',
      border: isDark ? '#374151' : '#E5E7EB',

      // Overlay
      overlay: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
    },
    typography,
    spacing,
    borderRadius,
    shadows,
    isDark,
    colorScheme: colorScheme || 'light',
  };
}

export type Theme = ReturnType<typeof useTheme>;
