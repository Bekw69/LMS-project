import React, { useState, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    Grid,
    Card,
    CardContent,
    Divider,
    IconButton,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Badge,
    LinearProgress,
    CircularProgress
} from '@mui/material';
import {
    Edit,
    PhotoCamera,
    Save,
    Cancel,
    Person,
    Email,
    School,
    AdminPanelSettings,
    Delete,
    Visibility,
    VisibilityOff,
    CloudUpload,
    CheckCircle
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser, deleteUser } from '../../redux/userRelated/userHandle';
import { authLogout } from '../../redux/userRelated/userSlice';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { authSuccess } from '../../redux/userRelated/userSlice';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const AdminProfile = () => {
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Состояния для редактирования
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        schoolName: currentUser?.schoolName || '',
        password: '',
        confirmPassword: '',
        phone: currentUser?.phone || '',
        position: currentUser?.position || 'Администратор',
        bio: currentUser?.bio || ''
    });

    // Состояния для UI
    const [avatar, setAvatar] = useState(currentUser?.avatar || null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialog, setDeleteDialog] = useState(false);

    // Обработчики
    const handleInputChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showSnackbar('Размер файла не должен превышать 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        // Валидация
        if (formData.password && formData.password !== formData.confirmPassword) {
            showSnackbar('Пароли не совпадают', 'error');
            return;
        }

        if (formData.password && formData.password.length < 6) {
            showSnackbar('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }

        setLoading(true);
        try {
            const updateData = {
                name: formData.name,
                email: formData.email,
                schoolName: formData.schoolName,
                phone: formData.phone,
                position: formData.position,
                bio: formData.bio
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            if (avatarPreview) {
                updateData.avatar = avatarPreview;
            }

            // Отправляем запрос на обновление профиля
            const response = await axios.put(
                `${BASE_URL}/AdminProfile/${currentUser._id}`,
                updateData
            );

            if (response.data) {
                // Обновляем данные в Redux store
                dispatch(authSuccess({
                    ...response.data.admin,
                    role: 'Admin'
                }));

                setLoading(false);
                setIsEditing(false);
                setAvatarPreview(null);
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                showSnackbar('Профиль успешно обновлен!', 'success');
            }

        } catch (error) {
            setLoading(false);
            console.error('Profile update error:', error);
            const errorMessage = error.response?.data?.message || 'Ошибка при обновлении профиля';
            showSnackbar(errorMessage, 'error');
        }
    };

    const handleCancel = () => {
        setFormData({
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            schoolName: currentUser?.schoolName || '',
            password: '',
            confirmPassword: '',
            phone: currentUser?.phone || '',
            position: currentUser?.position || 'Администратор',
            bio: currentUser?.bio || ''
        });
        setAvatarPreview(null);
        setIsEditing(false);
    };

    const handleDeleteAccount = () => {
        try {
            dispatch(deleteUser(currentUser._id, "Admin"));
            dispatch(authLogout());
            navigate('/');
            showSnackbar('Аккаунт удален', 'info');
        } catch (error) {
            showSnackbar('Ошибка при удалении аккаунта', 'error');
        }
        setDeleteDialog(false);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A';
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Профиль администратора
            </Typography>

            <Grid container spacing={4}>
                {/* Левая колонка - Аватар и основная информация */}
                <Grid item xs={12} md={4}>
                    <ProfileCard>
                        <CardContent sx={{ textAlign: 'center', p: 4 }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                                <StyledAvatar
                                    src={avatarPreview || avatar}
                                    sx={{ width: 120, height: 120, fontSize: '2rem' }}
                                >
                                    {!avatar && !avatarPreview && getInitials(currentUser?.name)}
                                </StyledAvatar>
                                
                                {isEditing && (
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        badgeContent={
                                            <IconButton
                                                size="small"
                                                onClick={() => fileInputRef.current?.click()}
                                                sx={{
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    '&:hover': { bgcolor: 'primary.dark' }
                                                }}
                                            >
                                                <PhotoCamera fontSize="small" />
                                            </IconButton>
                                        }
                                    >
                                        <div />
                                    </Badge>
                                )}
                            </Box>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />

                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {currentUser?.name}
                            </Typography>
                            
                            <Chip
                                icon={<AdminPanelSettings />}
                                label={formData.position}
                                color="primary"
                                sx={{ mb: 2 }}
                            />

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {formData.bio || 'Администратор системы управления школой'}
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Email fontSize="small" color="action" />
                                    <Typography variant="body2">{currentUser?.email}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <School fontSize="small" color="action" />
                                    <Typography variant="body2">{currentUser?.schoolName}</Typography>
                                </Box>
                                {formData.phone && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">📞 {formData.phone}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </ProfileCard>

                    {/* Карточка статистики */}
                    <ProfileCard sx={{ mt: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                                Статистика
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                            {currentUser?.adminLevel === 'SuperAdmin' ? '∞' : '12'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Права доступа
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                        <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                                            24/7
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Активность
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString('ru-RU')}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Дата регистрации
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                <CheckCircle color="success" fontSize="small" />
                                <Typography variant="body2" color="success.main">
                                    Аккаунт подтвержден
                                </Typography>
                            </Box>
                        </CardContent>
                    </ProfileCard>
                </Grid>

                {/* Правая колонка - Форма редактирования */}
                <Grid item xs={12} md={8}>
                    <ProfileCard>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Информация профиля
                                </Typography>
                                
                                {!isEditing ? (
                                    <GradientButton
                                        variant="contained"
                                        startIcon={<Edit />}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Редактировать
                                    </GradientButton>
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Cancel />}
                                            onClick={handleCancel}
                                            disabled={loading}
                                            sx={{ borderRadius: '25px' }}
                                        >
                                            Отмена
                                        </Button>
                                        <GradientButton
                                            variant="contained"
                                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                            onClick={handleSave}
                                            disabled={loading}
                                        >
                                            {loading ? 'Сохранение...' : 'Сохранить'}
                                        </GradientButton>
                                    </Box>
                                )}
                            </Box>

                            {loading && <LinearProgress sx={{ mb: 2 }} />}

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Имя"
                                        value={formData.name}
                                        onChange={handleInputChange('name')}
                                        disabled={!isEditing}
                                        InputProps={{
                                            startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange('email')}
                                        disabled={!isEditing}
                                        InputProps={{
                                            startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Название школы"
                                        value={formData.schoolName}
                                        onChange={handleInputChange('schoolName')}
                                        disabled={!isEditing}
                                        InputProps={{
                                            startAdornment: <School sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Телефон"
                                        value={formData.phone}
                                        onChange={handleInputChange('phone')}
                                        disabled={!isEditing}
                                        placeholder="+7 (999) 123-45-67"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Должность"
                                        value={formData.position}
                                        onChange={handleInputChange('position')}
                                        disabled={!isEditing}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="О себе"
                                        multiline
                                        rows={3}
                                        value={formData.bio}
                                        onChange={handleInputChange('bio')}
                                        disabled={!isEditing}
                                        placeholder="Расскажите о себе..."
                                    />
                                </Grid>

                                {isEditing && (
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Новый пароль"
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={handleInputChange('password')}
                                                placeholder="Оставьте пустым, если не хотите менять"
                                                InputProps={{
                                                    endAdornment: (
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                        >
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    )
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Подтвердите пароль"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange('confirmPassword')}
                                                error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
                                                helperText={
                                                    formData.password !== formData.confirmPassword && formData.confirmPassword !== ''
                                                        ? 'Пароли не совпадают'
                                                        : ''
                                                }
                                                InputProps={{
                                                    endAdornment: (
                                                        <IconButton
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            edge="end"
                                                        >
                                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    )
                                                }}
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>

                            {/* Опасная зона */}
                            <Divider sx={{ my: 4 }} />
                            <Box>
                                <Typography variant="h6" color="error" gutterBottom>
                                    Опасная зона
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    После удаления аккаунта восстановление будет невозможно.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Delete />}
                                    onClick={() => setDeleteDialog(true)}
                                >
                                    Удалить аккаунт
                                </Button>
                            </Box>
                        </CardContent>
                    </ProfileCard>
                </Grid>

                {/* Дополнительная колонка - Активность и уведомления */}
                <Grid item xs={12}>
                    <ProfileCard>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                                Последняя активность
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                            Недавние действия
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {[
                                                { action: 'Вход в систему', time: 'Сегодня в 09:30', icon: '🔐' },
                                                { action: 'Создан новый класс', time: 'Вчера в 15:45', icon: '🏫' },
                                                { action: 'Добавлен учитель', time: '2 дня назад', icon: '👨‍🏫' },
                                                { action: 'Обновлено расписание', time: '3 дня назад', icon: '📅' }
                                            ].map((item, index) => (
                                                <AnimatedBox key={index} sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 2,
                                                    p: 2,
                                                    bgcolor: '#f8f9fa',
                                                    borderRadius: 2,
                                                    border: '1px solid #e9ecef',
                                                    cursor: 'pointer'
                                                }}>
                                                    <Typography variant="h6">{item.icon}</Typography>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                            {item.action}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {item.time}
                                                        </Typography>
                                                    </Box>
                                                </AnimatedBox>
                                            ))}
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                            Системная информация
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <AnimatedBox sx={{ 
                                                p: 2, 
                                                bgcolor: '#e3f2fd', 
                                                borderRadius: 2,
                                                border: '1px solid #bbdefb',
                                                cursor: 'pointer'
                                            }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                    Уровень доступа: {currentUser?.adminLevel}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Полные права администратора
                                                </Typography>
                                            </AnimatedBox>

                                            <AnimatedBox sx={{ 
                                                p: 2, 
                                                bgcolor: '#e8f5e8', 
                                                borderRadius: 2,
                                                border: '1px solid #c8e6c9',
                                                cursor: 'pointer'
                                            }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                                                    Статус: Активен
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Последний вход: сегодня
                                                </Typography>
                                            </AnimatedBox>

                                            <AnimatedBox sx={{ 
                                                p: 2, 
                                                bgcolor: '#fff3e0', 
                                                borderRadius: 2,
                                                border: '1px solid #ffcc02',
                                                cursor: 'pointer'
                                            }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                                                    Безопасность: Высокая
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Двухфакторная аутентификация включена
                                                </Typography>
                                            </AnimatedBox>

                                            <AnimatedBox sx={{ 
                                                p: 2, 
                                                bgcolor: '#fce4ec', 
                                                borderRadius: 2,
                                                border: '1px solid #f8bbd9',
                                                cursor: 'pointer'
                                            }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#c2185b' }}>
                                                    Версия системы: 2.1.0
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Последнее обновление: 1 неделю назад
                                                </Typography>
                                            </AnimatedBox>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </ProfileCard>
                </Grid>
            </Grid>

            {/* Диалог подтверждения удаления */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Подтвердите удаление</DialogTitle>
                <DialogContent>
                    <Typography>
                        Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Отмена</Button>
                    <Button onClick={handleDeleteAccount} color="error" variant="contained">
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Уведомления */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminProfile;

const Container = styled(Box)`
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
`;

const ProfileCard = styled(Card)`
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-in-out;
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
`;

const StyledAvatar = styled(Avatar)`
    border: 4px solid #fff;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease-in-out;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    &:hover {
        transform: scale(1.05);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
    }
`;

const AnimatedBox = styled(Box)`
    transition: all 0.2s ease-in-out;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
`;

const GradientButton = styled(Button)`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 25px;
    padding: 12px 24px;
    color: white;
    font-weight: bold;
    text-transform: none;
    transition: all 0.3s ease;
    
    &:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
`;