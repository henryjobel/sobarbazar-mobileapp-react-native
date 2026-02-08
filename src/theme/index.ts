/**
 * Theme System - Central Export
 * Import from here for all theme-related needs
 */

export { colors, semanticColors } from './colors';
export type { ColorPalette, SemanticColors } from './colors';

export { typography } from './typography';
export type { Typography } from './typography';

export { spacing, borderRadius, shadows } from './spacing';
export type { Spacing, BorderRadius, Shadows } from './spacing';

export { default as useTheme } from './useTheme';
export type { Theme } from './useTheme';

// Re-export existing theme for backward compatibility
export { Colors, Fonts } from '@/constants/theme';
