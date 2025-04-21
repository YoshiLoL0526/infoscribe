import { useState, useEffect } from 'react'
import { VALID_THEMES, THEME_STORAGE_KEY, DEFAULT_THEME, ThemeContext } from '../contexts/theme-context'


export const ThemeProvider = ({ children }) => {
    // Estado para almacenar el tema actual
    const [theme, setTheme] = useState(() => {
        // Intentamos recuperar la preferencia guardada
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

        // Si existe y es válida, la usamos
        if (savedTheme && VALID_THEMES.includes(savedTheme)) {
            return savedTheme;
        }

        // Si no, comprobamos preferencia del sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        // Valor por defecto
        return DEFAULT_THEME;
    });

    // Estado efectivo (que puede ser el del sistema si theme='system')
    const [effectiveTheme, setEffectiveTheme] = useState(theme);

    // Cambiar tema y guardar preferencia
    const changeTheme = (newTheme) => {
        if (!VALID_THEMES.includes(newTheme)) {
            console.error(`Tema inválido: ${newTheme}. Debe ser uno de: ${VALID_THEMES.join(', ')}`);
            return;
        }

        setTheme(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    };

    // Comprobar tema del sistema y actualizar cuando cambie
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (theme === 'system') {
                setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
            }
        };

        // Establecer efectiveTheme inicialmente
        if (theme === 'system') {
            setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
        } else {
            setEffectiveTheme(theme);
        }

        // Añadir listener para cambios en preferencia del sistema
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else if (mediaQuery.addListener) {
            // Soporte para navegadores más antiguos
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, [theme]);

    // Aplicar clase al elemento HTML para temas CSS
    useEffect(() => {
        const root = document.documentElement;

        if (effectiveTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [effectiveTheme]);

    // Valor que expone el contexto
    const contextValue = {
        theme: effectiveTheme,
        rawTheme: theme,
        changeTheme,
        isTheme: (themeToCheck) => effectiveTheme === themeToCheck,
        isDark: effectiveTheme === 'dark',
        isLight: effectiveTheme === 'light'
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};