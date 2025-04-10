// This file exports theme tokens as constants for TypeScript usage
// These should match the CSS variables in index.css

export const colors = {
  // Dark theme colors
  dark: {
    50: 'rgb(234, 234, 234)', // #EAEAEA
    100: 'rgb(189, 189, 189)', // #BDBDBD
    200: 'rgb(158, 158, 158)', // #9E9E9E
    300: 'rgb(117, 117, 117)', // #757575
    400: 'rgb(97, 97, 97)',    // #616161
    500: 'rgb(66, 66, 66)',    // #424242
    600: 'rgb(48, 48, 48)',    // #303030
    700: 'rgb(36, 36, 36)',    // #242424
    800: 'rgb(26, 26, 26)',    // #1A1A1A
    900: 'rgb(15, 15, 15)',    // #0F0F0F
    950: 'rgb(8, 8, 8)',       // #080808
  },
  
  // Primary color - Purple
  primary: {
    50: 'rgb(244, 240, 255)',  // #F4F0FF
    100: 'rgb(233, 227, 255)', // #E9E3FF
    200: 'rgb(212, 196, 255)', // #D4C4FF
    300: 'rgb(190, 166, 255)', // #BEA6FF
    400: 'rgb(169, 135, 255)', // #A987FF
    500: 'rgb(139, 92, 246)',  // #8B5CF6
    600: 'rgb(124, 77, 238)',  // #7C4DEE
    700: 'rgb(109, 61, 230)',  // #6D3DE6
    800: 'rgb(94, 48, 218)',   // #5E30DA
    900: 'rgb(76, 33, 203)',   // #4C21CB
  },
};

export const elevation = {
  0: 'var(--bg-elevation-0)',
  1: 'var(--bg-elevation-1)',
  2: 'var(--bg-elevation-2)',
  3: 'var(--bg-elevation-3)',
  4: 'var(--bg-elevation-4)',
  6: 'var(--bg-elevation-6)',
  8: 'var(--bg-elevation-8)',
  12: 'var(--bg-elevation-12)',
  16: 'var(--bg-elevation-16)',
  24: 'var(--bg-elevation-24)',
};

export const shadows = {
  dp0: 'var(--shadow-dp0)',
  dp1: 'var(--shadow-dp1)',
  dp2: 'var(--shadow-dp2)',
  dp3: 'var(--shadow-dp3)',
  dp4: 'var(--shadow-dp4)',
  dp6: 'var(--shadow-dp6)',
  dp8: 'var(--shadow-dp8)',
  dp12: 'var(--shadow-dp12)',
  dp16: 'var(--shadow-dp16)',
  dp24: 'var(--shadow-dp24)',
  primaryGlow: 'var(--shadow-glow-primary)',
  secondaryGlow: 'var(--shadow-glow-secondary)',
  successGlow: 'var(--shadow-glow-success)',
  errorGlow: 'var(--shadow-glow-error)',
};

export const radius = {
  xs: 'var(--radius-xs)',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
  full: 'var(--radius-full)',
};

export const animation = {
  short: 'var(--animation-short)',
  medium: 'var(--animation-medium)',
  long: 'var(--animation-long)',
};

export const zIndex = {
  dropdown: 'var(--z-index-dropdown)',
  sticky: 'var(--z-index-sticky)',
  fixed: 'var(--z-index-fixed)',
  modalBackdrop: 'var(--z-index-modal-backdrop)',
  modal: 'var(--z-index-modal)',
  popover: 'var(--z-index-popover)',
  tooltip: 'var(--z-index-tooltip)',
};