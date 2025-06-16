import React from 'react';
import {
    Box,
    IconButton,
    Tooltip,
    Switch,
    FormControlLabel,
    Typography,
    Paper,
    Divider
} from '@mui/material';
import {
    LightMode,
    DarkMode,
    Palette,
    Settings
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: 16,
    background: theme.palette.mode === 'light' 
        ? 'linear-gradient(135deg, #FFFFFF 0%, #F8F6F7 100%)'
        : 'linear-gradient(135deg, #1A1A1A 0%, #262626 100%)',
    border: theme.palette.mode === 'light' 
        ? `1px solid ${theme.palette.divider}`
        : 'none',
    boxShadow: theme.palette.mode === 'light'
        ? '0px 8px 32px rgba(139, 21, 56, 0.08)'
        : '0px 8px 32px rgba(0, 0, 0, 0.4)'
}));

const ThemeSwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
        margin: 1,
        padding: 0,
        transform: 'translateX(6px)',
        '&.Mui-checked': {
            color: '#fff',
            transform: 'translateX(22px)',
            '& .MuiSwitch-thumb:before': {
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                    '#fff',
                )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
            },
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
        width: 32,
        height: 32,
        '&:before': {
            content: "''",
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                '#fff',
            )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
        },
    },
    '& .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
        borderRadius: 20 / 2,
    },
}));

const ColorPreview = styled(Box)(({ theme, color }) => ({
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: color,
    border: `2px solid ${theme.palette.divider}`,
    boxShadow: theme.palette.mode === 'light'
        ? '0px 2px 8px rgba(0, 0, 0, 0.1)'
        : '0px 2px 8px rgba(0, 0, 0, 0.3)'
}));

const ThemeToggle = () => {
    const { themeMode, toggleTheme, colors } = useTheme();

    return (
        <StyledPaper elevation={0}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Settings sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Настройки темы
                </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Переключатель темы */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Режим отображения
                </Typography>
                
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'action.hover'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LightMode sx={{ mr: 1, color: themeMode === 'light' ? 'primary.main' : 'text.secondary' }} />
                        <Typography variant="body2" sx={{ mr: 2 }}>
                            Дневной режим
                        </Typography>
                    </Box>
                    
                    <ThemeSwitch
                        checked={themeMode === 'dark'}
                        onChange={toggleTheme}
                        inputProps={{ 'aria-label': 'theme toggle' }}
                    />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                            Ночной режим
                        </Typography>
                        <DarkMode sx={{ color: themeMode === 'dark' ? 'primary.main' : 'text.secondary' }} />
                    </Box>
                </Box>
            </Box>

            {/* Цветовая схема */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Цветовая схема
                </Typography>
                
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'action.hover'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Palette sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="body2">
                            Academic Minimalism
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Основной цвет">
                            <ColorPreview color={colors.primary} />
                        </Tooltip>
                        <Tooltip title="Фон">
                            <ColorPreview color={colors.background} />
                        </Tooltip>
                        <Tooltip title="Акцент">
                            <ColorPreview color={colors.accent} />
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* Описание тем */}
            <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                backgroundColor: 'action.hover',
                border: `1px solid ${colors.divider}`
            }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Дневной режим:</strong> Бордово-белая цветовая схема для комфортной работы днем
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    <strong>Ночной режим:</strong> Черно-красная цветовая схема для работы в темное время
                </Typography>
            </Box>
        </StyledPaper>
    );
};

export default ThemeToggle; 