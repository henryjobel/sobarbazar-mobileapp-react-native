/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Colors are aligned with the web frontend theme for consistent branding.
 */

import { Platform } from 'react-native';

// Web frontend theme colors
const primaryGreen = '#299e60'; // Main brand color from web
const primaryGreenLight = '#22C55E'; // Success green
const secondaryOrange = '#FF7D00'; // Secondary brand color
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    backgroundSecondary: '#F3FAF2', // Matches web bg-color-one
    backgroundTertiary: '#FFFBF4', // Matches web bg-color-two
    tint: primaryGreen,
    primary: primaryGreen,
    primaryLight: primaryGreenLight,
    secondary: secondaryOrange,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primaryGreen,
    // Semantic colors matching web
    success: '#22C55E',
    successDark: '#27AE60',
    danger: '#DC2626',
    dangerLight: '#EF4444',
    warning: '#EAB308',
    warningLight: '#FF9F29',
    info: '#3B82F6',
    infoLight: '#2563EB',
    // Neutral/Gray colors
    gray50: '#F1F1F1',
    gray100: '#E6E6E6',
    gray200: '#CCCCCC',
    gray300: '#B3B3B3',
    gray400: '#999999',
    gray500: '#808080',
    gray600: '#666666',
    gray700: '#4D4D4D',
    gray800: '#333333',
    gray900: '#1A1A1A',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    backgroundSecondary: '#1F2937',
    backgroundTertiary: '#374151',
    tint: tintColorDark,
    primary: primaryGreenLight,
    primaryLight: '#4ADE80',
    secondary: '#FFA726',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Semantic colors for dark mode
    success: '#4ADE80',
    successDark: '#22C55E',
    danger: '#F87171',
    dangerLight: '#EF4444',
    warning: '#FACC15',
    warningLight: '#FDE047',
    info: '#60A5FA',
    infoLight: '#3B82F6',
    // Neutral/Gray colors for dark
    gray50: '#374151',
    gray100: '#4B5563',
    gray200: '#6B7280',
    gray300: '#9CA3AF',
    gray400: '#D1D5DB',
    gray500: '#E5E7EB',
    gray600: '#F3F4F6',
    gray700: '#F9FAFB',
    gray800: '#FFFFFF',
    gray900: '#FFFFFF',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
