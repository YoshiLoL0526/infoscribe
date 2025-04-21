import { createContext, useContext } from 'react';

// Creamos el contexto
export const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

// Valores iniciales y constantes
export const THEME_STORAGE_KEY = 'app_theme_preference';
export const DEFAULT_THEME = 'light';
export const VALID_THEMES = ['light', 'dark', 'system'];