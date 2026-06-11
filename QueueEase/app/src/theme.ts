/**
 * QueueEase Design Tokens
 * Medical-grade light theme — teal primary, clean whites, soft greys
 */

export const Colors = {
  // Primary teal (from mockups)
  primary: '#0D9488',       // teal-600
  primaryDark: '#0F766E',   // teal-700
  primaryLight: '#CCFBF1',  // teal-100
  primaryMid: '#5EEAD4',    // teal-300

  // Accents
  accent: '#14B8A6',        // teal-500
  accentSoft: '#F0FDFA',    // teal-50

  // Backgrounds
  bgPage: '#F8FAFB',
  bgCard: '#FFFFFF',
  bgInput: '#F4F7F9',
  bgMuted: '#EEF2F6',

  // Text
  textPrimary: '#0F172A',   // slate-900
  textSecondary: '#475569', // slate-600
  textMuted: '#94A3B8',     // slate-400
  textOnPrimary: '#FFFFFF',

  // Status
  success: '#059669',
  successLight: '#D1FAE5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#0369A1',
  infoLight: '#E0F2FE',

  // Borders
  border: '#E2E8F0',
  borderFocus: '#0D9488',

  // Queue status colors
  waiting: '#0D9488',
  called: '#7C3AED',
  served: '#059669',
  noShow: '#9CA3AF',
  cancelled: '#DC2626',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: Colors.textPrimary, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: Colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600' as const, color: Colors.textPrimary },
  h4: { fontSize: 16, fontWeight: '600' as const, color: Colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.textSecondary, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: Colors.textMuted, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '600' as const, color: Colors.textMuted, letterSpacing: 0.5 },
  caption: { fontSize: 11, fontWeight: '500' as const, color: Colors.textMuted },
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
};
