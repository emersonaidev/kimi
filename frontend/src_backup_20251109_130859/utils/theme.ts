/**
 * Helper function to get glassmorphism background color based on theme and scroll state
 */
export function getGlassmorphismBg(theme: 'light' | 'dark', scrolled: boolean): string {
  if (scrolled) {
    return theme === 'dark' 
      ? 'rgba(28, 28, 30, 0.8)' 
      : 'rgba(255, 255, 255, 0.8)';
  }
  return theme === 'dark'
    ? 'rgba(28, 28, 30, 1)'
    : 'rgba(255, 255, 255, 1)';
}

/**
 * Helper function to get bottom nav glassmorphism background
 */
export function getBottomNavBg(theme: 'light' | 'dark'): string {
  return theme === 'dark'
    ? 'rgba(28, 28, 30, 0.8)'
    : 'rgba(255, 255, 255, 0.8)';
}

/**
 * Helper function to get chat input glassmorphism background
 */
export function getChatInputBg(theme: 'light' | 'dark'): string {
  return theme === 'dark'
    ? 'rgba(28, 28, 30, 0.8)'
    : 'rgba(255, 255, 255, 0.8)';
}
