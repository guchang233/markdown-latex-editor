import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';
interface ThemeState {
  theme: Theme;
}

// Create a writable store with initial theme
const createThemeStore = () => {
  const { subscribe, update, set } = writable<ThemeState>({
    theme: 'light', // Default theme
  });

  return {
    subscribe,
    setTheme: (theme: Theme) => {
      // Save to localStorage for persistence
      try {
        localStorage.setItem('marktex-theme', theme);
      } catch (e) {
        console.warn('Failed to save theme preference to localStorage:', e);
      }
      
      set({ theme });
    },
    toggleTheme: () => {
      update((state: ThemeState) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        
        // Save to localStorage for persistence
        try {
          localStorage.setItem('marktex-theme', newTheme);
        } catch (e) {
          console.warn('Failed to save theme preference to localStorage:', e);
        }
        
        return { theme: newTheme };
      });
    },
    initialize: () => {
      // Try to load from localStorage
      try {
        const savedTheme = localStorage.getItem('marktex-theme') as Theme | null;
        if (savedTheme) {
          set({ theme: savedTheme });
        }
      } catch (e) {
        console.warn('Failed to load theme preference from localStorage:', e);
      }
    }
  };
};

export const themeStore = createThemeStore(); 