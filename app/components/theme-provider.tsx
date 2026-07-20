'use client';

import { useEffect } from 'react';

interface ThemeProviderProps {
  primaryColor: string; // oklch format
}

export function ThemeProvider({ primaryColor }: ThemeProviderProps) {
  useEffect(() => {
    // Inject CSS variable overrides
    document.documentElement.style.setProperty('--primary', primaryColor);
    
    // Parse oklch to get lightness for foreground
    const match = primaryColor.match(/oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\)/);
    if (match) {
      const lightness = parseFloat(match[1]);
      // Use white text if color is dark (L < 0.6), black if light
      const foreground = lightness < 0.6 ? 'oklch(1 0 0)' : 'oklch(0 0 0)';
      document.documentElement.style.setProperty('--primary-foreground', foreground);
    }
  }, [primaryColor]);

  return null;
}
