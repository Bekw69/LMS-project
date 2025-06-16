import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeContextProvider');
    }
    return context;
};

// Academic Minimalism цветовая палитра
const colors = {
    // Дневная тема - бордово-белая
    light: {
        primary: '#8B1538', // Благородный бордовый
        primaryLight: '#A64B6B',
        primaryDark: '#5D0E26',
        secondary: '#6B4C57',
        background: '#FEFEFE', // Чистый белый
        paper: '#FFFFFF',
        surface: '#F8F6F7',
        text: {
            primary: '#2C1810',
            secondary: '#5D4E47',
            disabled: '#9E8B85'
        },
        divider: '#E8E0E2',
        accent: '#D4AF37', // Золотой акцент для важных элементов
        success: '#2E7D32',
        warning: '#F57C00',
        error: '#C62828'
    },
    // Ночная тема - черно-красная
    dark: {
        primary: '#D32F2F', // Более яркий красный для темной темы
        primaryLight: '#FF6659',
        primaryDark: '#9A0007',
        secondary: '#B71C1C',
        background: '#0D0D0D', // Глубокий черный
        paper: '#1A1A1A',
        surface: '#262626',
        text: {
            primary: '#FFFFFF',
            secondary: '#CCCCCC',
            disabled: '#666666'
        },
        divider: '#333333',
        accent: '#FFD700', // Золотой акцент
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336'
    }
};

// Типографика в стиле Academic Minimalism
const typography = {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
        fontSize: '2.5rem',
        fontWeight: 300,
        letterSpacing: '-0.02em',
        lineHeight: 1.2
    },
    h2: {
        fontSize: '2rem',
        fontWeight: 400,
        letterSpacing: '-0.01em',
        lineHeight: 1.3
    },
    h3: {
        fontSize: '1.75rem',
        fontWeight: 400,
        letterSpacing: '0em',
        lineHeight: 1.4
    },
    h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        letterSpacing: '0.01em',
        lineHeight: 1.4
    },
    h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        letterSpacing: '0.01em',
        lineHeight: 1.5
    },
    h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        lineHeight: 1.5
    },
    body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: '0.01em'
    },
    body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0.01em'
    },
    button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
        textTransform: 'none'
    }
};

// Создание темы
const createCustomTheme = (mode) => {
    const palette = colors[mode];
    
    return createTheme({
        palette: {
            mode,
            primary: {
                main: palette.primary,
                light: palette.primaryLight,
                dark: palette.primaryDark,
                contrastText: mode === 'light' ? '#FFFFFF' : '#FFFFFF'
            },
            secondary: {
                main: palette.secondary,
                contrastText: mode === 'light' ? '#FFFFFF' : '#FFFFFF'
            },
            background: {
                default: palette.background,
                paper: palette.paper
            },
            text: palette.text,
            divider: palette.divider,
            success: {
                main: palette.success
            },
            warning: {
                main: palette.warning
            },
            error: {
                main: palette.error
            },
            // Кастомные цвета
            custom: {
                surface: palette.surface,
                accent: palette.accent
            }
        },
        typography,
        shape: {
            borderRadius: 8 // Мягкие углы в стиле минимализма
        },
        shadows: mode === 'light' ? [
            'none',
            '0px 1px 3px rgba(139, 21, 56, 0.08)',
            '0px 2px 6px rgba(139, 21, 56, 0.12)',
            '0px 4px 12px rgba(139, 21, 56, 0.15)',
            '0px 6px 18px rgba(139, 21, 56, 0.18)',
            '0px 8px 24px rgba(139, 21, 56, 0.20)',
            // ... остальные тени
        ] : [
            'none',
            '0px 1px 3px rgba(0, 0, 0, 0.3)',
            '0px 2px 6px rgba(0, 0, 0, 0.4)',
            '0px 4px 12px rgba(0, 0, 0, 0.5)',
            '0px 6px 18px rgba(0, 0, 0, 0.6)',
            '0px 8px 24px rgba(0, 0, 0, 0.7)',
            // ... остальные тени
        ],
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        padding: '10px 24px',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: mode === 'light' 
                                ? '0px 2px 8px rgba(139, 21, 56, 0.2)' 
                                : '0px 2px 8px rgba(211, 47, 47, 0.3)'
                        }
                    },
                    contained: {
                        background: mode === 'light' 
                            ? `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDark} 100%)`
                            : `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryLight} 100%)`,
                        '&:hover': {
                            background: mode === 'light'
                                ? `linear-gradient(135deg, ${palette.primaryDark} 0%, ${palette.primary} 100%)`
                                : `linear-gradient(135deg, ${palette.primaryLight} 0%, ${palette.primary} 100%)`
                        }
                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        border: mode === 'light' ? `1px solid ${palette.divider}` : 'none'
                    }
                }
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        background: mode === 'light'
                            ? `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDark} 100%)`
                            : `linear-gradient(135deg, ${palette.background} 0%, ${palette.surface} 100%)`,
                        boxShadow: mode === 'light'
                            ? '0px 2px 12px rgba(139, 21, 56, 0.15)'
                            : '0px 2px 12px rgba(0, 0, 0, 0.5)'
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        border: mode === 'light' ? `1px solid ${palette.divider}` : 'none',
                        boxShadow: mode === 'light'
                            ? '0px 4px 12px rgba(139, 21, 56, 0.08)'
                            : '0px 4px 12px rgba(0, 0, 0, 0.3)'
                    }
                }
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 8,
                            '& fieldset': {
                                borderColor: palette.divider
                            },
                            '&:hover fieldset': {
                                borderColor: palette.primary
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: palette.primary,
                                borderWidth: 2
                            }
                        }
                    }
                }
            }
        }
    });
};

export const ThemeContextProvider = ({ children }) => {
    const [themeMode, setThemeMode] = useState(() => {
        const savedTheme = localStorage.getItem('themeMode');
        return savedTheme || 'light';
    });

    const theme = createCustomTheme(themeMode);

    const toggleTheme = () => {
        const newMode = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newMode);
        localStorage.setItem('themeMode', newMode);
    };

    useEffect(() => {
        localStorage.setItem('themeMode', themeMode);
    }, [themeMode]);

    const value = {
        themeMode,
        toggleTheme,
        theme,
        colors: colors[themeMode]
    };

    return (
        <ThemeContext.Provider value={value}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}; 