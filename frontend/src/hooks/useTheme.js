import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'crm-theme';

/**
 * Light/dark theme hook.
 * Persists to localStorage and reflects the choice on <html data-theme="...">.
 * Defaults to the professional light theme.
 */
export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
