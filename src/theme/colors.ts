/**
 * Centralized Color System
 * Matches web frontend theme colors for consistent branding
 */

export const colors = {
  // Primary Brand Colors (Green)
  primary: {
    50: '#e8f5ed',
    100: '#c6e5d3',
    200: '#a1d4b8',
    300: '#7bc39d',
    400: '#5eb688',
    500: '#41a973',
    600: '#299e60', // Main brand color
    700: '#238c54',
    800: '#1d7a48',
    900: '#145a34',
    main: '#299e60',
    light: '#41a973',
    dark: '#238c54',
  },

  // Secondary Brand Colors (Orange)
  secondary: {
    50: '#fff5e6',
    100: '#ffe5c0',
    200: '#ffd499',
    300: '#ffc371',
    400: '#ffb64d',
    500: '#ffa929',
    600: '#FF7D00', // Main secondary color
    700: '#e56e00',
    800: '#cc6200',
    900: '#b35600',
    main: '#FF7D00',
    light: '#ffa929',
    dark: '#e56e00',
  },

  // Success Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#27AE60',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    main: '#22C55E',
    light: '#4ADE80',
    dark: '#27AE60',
  },

  // Danger/Error Colors
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    main: '#DC2626',
    light: '#EF4444',
    dark: '#B91C1C',
  },

  // Warning Colors
  warning: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308',
    600: '#FF9F29',
    700: '#f39016',
    800: '#e58209',
    900: '#d77907',
    main: '#EAB308',
    light: '#FF9F29',
    dark: '#f39016',
  },

  // Info Colors
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
  },

  // Neutral/Gray Colors
  neutral: {
    50: '#ECF1F9',
    100: '#E6E6E6',
    200: '#CCCCCC',
    300: '#B3B3B3',
    400: '#999999',
    500: '#808080',
    600: '#121535',
    700: '#060710',
    800: '#11132e',
    900: '#1A1A1A',
  },

  gray: {
    50: '#F1F1F1',
    100: '#E6E6E6',
    200: '#CCCCCC',
    300: '#B3B3B3',
    400: '#999999',
    500: '#808080',
    600: '#666666',
    700: '#4D4D4D',
    800: '#333333',
    900: '#1A1A1A',
  },

  // Background Colors
  background: {
    one: '#F3FAF2',   // Light green background
    two: '#FFFBF4',   // Light orange background
    three: '#F1F1F1', // Gray background
    white: '#FFFFFF',
    black: '#000000',
  },

  // Text Colors
  text: {
    primary: '#11181C',
    secondary: '#687076',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    light: '#E5E7EB',
    muted: '#6B7280',
  },
} as const;

// Semantic color mappings for easy usage
export const semanticColors = {
  success: colors.success.main,
  error: colors.danger.main,
  warning: colors.warning.main,
  info: colors.info.main,
  primary: colors.primary.main,
  secondary: colors.secondary.main,
} as const;

// Export types for TypeScript
export type ColorPalette = typeof colors;
export type SemanticColors = typeof semanticColors;
