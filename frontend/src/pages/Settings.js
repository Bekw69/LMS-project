import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    Avatar,
    Chip,
    Divider
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Person,
    Notifications,
    Security,
    Language,
    Help
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/Settings/ThemeToggle';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    minHeight: '100vh',
    background: theme.palette.mode === 'light'
        ? 'linear-gradient(135deg, #FEFEFE 0%, #F8F6F7 100%)'
        : 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)'
}));

const HeaderCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    borderRadius: 16,
    background: theme.palette.mode === 'light'
        ? 'linear-gradient(135deg, #8B1538 0%, #5D0E26 100%)'
        : 'linear-gradient(135deg, #D32F2F 0%, #9A0007 100%)',
    color: 'white',
    boxShadow: theme.palette.mode === 'light'
        ? '0px 8px 32px rgba(139, 21, 56, 0.2)'
        : '0px 8px 32px rgba(211, 47, 47, 0.3)'
}));

const SettingsCard = styled(Card)(({ theme }) => ({
    height: '100%',
    borderRadius: 12,
    border: theme.palette.mode === 'light' ? `1px solid ${theme.palette.divider}` : 'none',
    boxShadow: theme.palette.mode === 'light'
        ? '0px 4px 12px rgba(139, 21, 56, 0.08)'
        : '0px 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.palette.mode === 'light'
            ? '0px 8px 24px rgba(139, 21, 56, 0.15)'
            : '0px 8px 24px rgba(0, 0, 0, 0.4)'
    }
}));

const Settings = () => {
    const { currentUser, currentRole } = useSelector(state => state.user);
    const { themeMode, colors } = useTheme();

    const settingsCategories = [
        {
            title: 'Профиль',
            description: 'Управление личной информацией',
            icon: <Person />,
            color: colors.primary,
            items: ['Личные данные', 'Аватар', 'Контакты']
        },
        {
            title: 'Уведомления',
            description: 'Настройка оповещений',
            icon: <Notifications />,
            color: colors.accent,
            items: ['Email уведомления', 'Push уведомления', 'Звуки']
        },
        {
            title: 'Безопасность',
            description: 'Пароль и конфиденциальность',
            icon: <Security />,
            color: colors.error,
            items: ['Смена пароля', 'Двухфакторная аутентификация', 'Сессии']
        },
        {
            title: 'Язык',
            description: 'Выбор языка интерфейса',
            icon: <Language />,
            color: colors.success,
            items: ['Русский', 'English', 'Қазақша']
        },
        {
            title: 'Помощь',
            description: 'Поддержка и документация',
            icon: <Help />,
            color: colors.warning,
            items: ['FAQ', 'Техподдержка', 'Обратная связь']
        }
    ];

    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'Admin': return 'Администратор';
            case 'Teacher': return 'Преподаватель';
            case 'Student': return 'Студент';
            default: return role;
        }
    };

    return (
        <StyledContainer maxWidth="lg">
            {/* Header */}
            <HeaderCard elevation={0}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                mr: 3,
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                fontSize: '2rem'
                            }}
                        >
                            {currentUser?.name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 300, mb: 1 }}>
                                Настройки
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                                {currentUser?.name || currentUser?.email || 'Пользователь'}
                            </Typography>
                            <Chip
                                label={getRoleDisplayName(currentRole)}
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    fontWeight: 500
                                }}
                            />
                        </Box>
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                        Управляйте своими предпочтениями и настройками системы
                    </Typography>
                </CardContent>
            </HeaderCard>

            <Grid container spacing={4}>
                {/* Настройки темы - занимает всю ширину */}
                <Grid item xs={12}>
                    <ThemeToggle />
                </Grid>

                {/* Остальные категории настроек */}
                {settingsCategories.map((category, index) => (
                    <Grid item xs={12} md={6} lg={4} key={index}>
                        <SettingsCard elevation={0}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: category.color,
                                            mr: 2,
                                            width: 48,
                                            height: 48
                                        }}
                                    >
                                        {category.icon}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {category.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {category.description}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box>
                                    {category.items.map((item, itemIndex) => (
                                        <Box
                                            key={itemIndex}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                py: 1,
                                                px: 2,
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: 'action.hover',
                                                    transform: 'translateX(4px)'
                                                }
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {item}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </SettingsCard>
                    </Grid>
                ))}
            </Grid>

            {/* Информация о системе */}
            <Paper
                sx={{
                    mt: 4,
                    p: 3,
                    borderRadius: 2,
                    background: themeMode === 'light'
                        ? 'linear-gradient(135deg, #F8F6F7 0%, #FFFFFF 100%)'
                        : 'linear-gradient(135deg, #262626 0%, #1A1A1A 100%)',
                    border: themeMode === 'light' ? `1px solid ${colors.divider}` : 'none'
                }}
                elevation={0}
            >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    О системе
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                            Версия системы
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            v2.0.0
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                            Дизайн
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Academic Minimalism
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                            Тема
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {themeMode === 'light' ? 'Дневная' : 'Ночная'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                            Real-time чат
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: colors.success }}>
                            Активен
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </StyledContainer>
    );
};

export default Settings; 