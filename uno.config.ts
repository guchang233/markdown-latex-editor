import { defineConfig, presetUno, presetTypography, presetWebFonts } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        mono: ['JetBrains Mono', 'monospace']
      }
    })
  ],
  theme: {
    colors: {
      // Light theme colors
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#10b981',
      neutral: '#111827',
      'base-100': '#ffffff',
      'base-200': '#f9fafb',
      'base-300': '#f3f4f6',
      
      // Dark theme colors
      'primary-dark': '#60a5fa',
      'secondary-dark': '#818cf8',
      'accent-dark': '#34d399',
      'neutral-dark': '#f9fafb',
      'base-100-dark': '#111827',
      'base-200-dark': '#1f2937',
      'base-300-dark': '#374151',
    },
    fontFamily: {
      sans: 'Inter, ui-sans-serif, system-ui',
      mono: 'JetBrains Mono, ui-monospace, SFMono-Regular'
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    }
  },
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg bg-primary text-white hover:bg-opacity-90 transition-all duration-200',
    'btn-secondary': 'px-4 py-2 rounded-lg bg-secondary text-white hover:bg-opacity-90 transition-all duration-200',
    'input': 'px-4 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    'card': 'bg-base-100 rounded-xl shadow-md overflow-hidden',
    'card-dark': 'bg-base-100-dark rounded-xl shadow-md overflow-hidden'
  }
}); 