export const colors = {
  inkPrimary: '#202646',
  inkSecondary: '#5A6082',
  paper: '#FFFFFF',
  accentBlue: '#2952A3',
  divider: '#EBEBEB',
  background: '#F5F3F0',
  cardBackground: '#FFFFFF',
  cardBorder: '#E8E6E3',
  textPrimary: '#1A1A1A',
  textSecondary: '#7A7A7A',
  selectedDay: '#1A1A1A',
  unselectedDay: '#F0EFED',
  sectionPill: '#F0F0F4',
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 12,
  md: 24,
  lg: 48,
  xl: 80,
} as const;

import { Platform } from 'react-native';

export const fonts = {
  playfairDisplay: Platform.select({ android: 'PlayfairDisplay_400Regular', ios: 'PlayfairDisplay-Regular' })!,
  playfairDisplayItalic: Platform.select({ android: 'PlayfairDisplay_400Regular_Italic', ios: 'PlayfairDisplay-Italic' })!,
  playfairDisplayMedium: Platform.select({ android: 'PlayfairDisplay_500Medium', ios: 'PlayfairDisplay-Medium' })!,
  playfairDisplaySemiBold: Platform.select({ android: 'PlayfairDisplay_600SemiBold', ios: 'PlayfairDisplay-SemiBold' })!,
  inter: Platform.select({ android: 'Inter_400Regular', ios: 'Inter-Regular' })!,
  interMedium: Platform.select({ android: 'Inter_500Medium', ios: 'Inter-Medium' })!,
  interSemiBold: Platform.select({ android: 'Inter_600SemiBold', ios: 'Inter-SemiBold' })!,
} as const;
