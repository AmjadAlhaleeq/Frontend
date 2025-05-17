
/**
 * Application theme configuration
 * Contains color tokens and theme variables
 */

export const themeColors = {
  // Base teal color palette
  teal: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#0F766E", // Primary brand color
    600: "#0d6d66",
    700: "#0c5954",
    800: "#084643",
    900: "#053231",
    950: "#022322",
  },
  
  // Used for warnings and errors
  danger: {
    light: "#fee2e2",
    DEFAULT: "#ef4444",
    dark: "#b91c1c",
  },
  
  // Used for warnings
  warning: {
    light: "#fef3c7",
    DEFAULT: "#f59e0b",
    dark: "#b45309",
  },
  
  // Used for success states
  success: {
    light: "#d1fae5",
    DEFAULT: "#10b981",
    dark: "#047857",
  },
};

// Semantic colors
export const semanticColors = {
  primary: themeColors.teal[500],
  primaryHover: themeColors.teal[600],
  primaryActive: themeColors.teal[700],
  primaryLight: themeColors.teal[100],
  
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  
  background: "#ffffff",
  backgroundAlt: "#f8fafc",
  
  border: "#e2e8f0",
  borderDark: "#cbd5e1",
  
  focusRing: themeColors.teal[300],
};

export const getColorVariable = (color: string, opacity: number = 100) => {
  return `rgba(var(--${color}), ${opacity / 100})`;
};

export default { themeColors, semanticColors, getColorVariable };
