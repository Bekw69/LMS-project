import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Container,
    Paper,
    Typography,
    Box,
    Tabs,
    Tab,
    TextField,
    Button,
    Avatar,
    Grid,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    IconButton,
    InputAdornment,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    MenuItem
} from '@mui/material';
import {
    Person,
    Security,
    Notifications,
    Palette,
    Edit,
    Save,
    Cancel,
    Visibility,
    VisibilityOff,
    PhotoCamera,
    School,
    Class,
    Assignment,
    Grade
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { authSuccess } from '../../redux/userRelated/userSlice';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        boxShadow: theme.shadows[8],
        transform: 'translateY(-2px)'
    }
}));

const TeacherSettings = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    // Profile settings
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        bio: '',
        qualification: '',
        experience: '',
        specialization: ''
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Password settings
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        assignmentSubmissions: true,
        studentMessages: true,
        systemUpdates: true,
        gradeReminders: true,
        classUpdates: true
    });

    // Teaching preferences
    const [teachingPreferences, setTeachingPreferences] = useState({
        autoGrading: false,
        allowLateSubmissions: true,
        requireConfirmation: true,
        showStudentProgress: true,
        enableDiscussions: true,
        defaultAssignmentDuration: 7
    });

    useEffect(() => {
        if (currentUser) {
            setProfileData({
                name: currentUser.name || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                address: currentUser.address || '',
                dateOfBirth: currentUser.dateOfBirth || '',
                bio: currentUser.bio || '',
                qualification: currentUser.qualification || '',
                experience: currentUser.experience || '',
                specialization: currentUser.specialization || ''
            });
        }
    }, [currentUser]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    // Profile handlers
    const handleProfileChange = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const updateData = {
                ...profileData,
                ...(avatarPreview && { avatar: avatarPreview })
            };

            const response = await axios.put(
                `${BASE_URL}/TeacherProfile/${currentUser._id}`,
                updateData
            );

            if (response.data) {
                dispatch(authSuccess({
                    ...response.data.teacher,
                    role: 'Teacher'
                }));
                setIsEditingProfile(false);
                setAvatarPreview(null);
                showMessage('Профиль успешно обновлен!');
            }
        } catch (error) {
            showMessage('Ошибка при обновлении профиля', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Password handlers
    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showMessage('Пароли не совпадают', 'error');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showMessage('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }

        setLoading(true);
        try {
            await axios.put(`${BASE_URL}/TeacherPassword/${currentUser._id}`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            showMessage('Пароль успешно изменен!');
        } catch (error) {
            showMessage('Ошибка при смене пароля', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Notification handlers
    const handleNotificationChange = (setting, value) => {
        setNotificationSettings(prev => ({ ...prev, [setting]: value }));
    };

    const handleSaveNotifications = async () => {
        setLoading(true);
        try {
            await axios.put(`${BASE_URL}/TeacherNotifications/${currentUser._id}`, notificationSettings);
            showMessage('Настройки уведомлений сохранены!');
        } catch (error) {
            showMessage('Ошибка при сохранении настроек', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Teaching preferences handlers
    const handleTeachingPreferenceChange = (setting, value) => {
        setTeachingPreferences(prev => ({ ...prev, [setting]: value }));
    };

    const handleSaveTeachingPreferences = async () => {
        setLoading(true);
        try {
            await axios.put(`${BASE_URL}/TeacherPreferences/${currentUser._id}`, teachingPreferences);
            showMessage('Настройки преподавания сохранены!');
        } catch (error) {
            showMessage('Ошибка при сохранении настроек', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                Настройки преподавателя
            </Typography>

            {message && (
                <Alert severity={messageType} sx={{ mb: 3 }}>
                    {message}
                </Alert>
            )}

            <Paper elevation={3} sx={{ borderRadius: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="settings tabs"
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab icon={<Person />} label="Профиль" />
                    <Tab icon={<Security />} label="Безопасность" />
                    <Tab icon={<Notifications />} label="Уведомления" />
                    <Tab icon={<School />} label="Преподавание" />
                </Tabs>

                {/* Profile Tab */}
                <TabPanel value={tabValue} index={0}>
                    <StyledCard>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6">Личная информация</Typography>
                                <Button
                                    startIcon={isEditingProfile ? <Cancel /> : <Edit />}
                                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                                    variant={isEditingProfile ? "outlined" : "contained"}
                                >
                                    {isEditingProfile ? 'Отмена' : 'Редактировать'}
                                </Button>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <Avatar
                                            src={avatarPreview || currentUser?.avatar}
                                            sx={{ width: 120, height: 120, mb: 2 }}
                                        >
                                            {currentUser?.name?.charAt(0)}
                                        </Avatar>
                                        {isEditingProfile && (
                                            <Button
                                                component="label"
                                                startIcon={<PhotoCamera />}
                                                variant="outlined"
                                                size="small"
                                            >
                                                Изменить фото
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                />
                                            </Button>
                                        )}
                                        
                                        {/* Информация о преподавании */}
                                        <Box mt={3} width="100%">
                                            <Typography variant="h6" gutterBottom>
                                                Преподавательская информация
                                            </Typography>
                                            <List dense>
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <School color="primary" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Предметы"
                                                        secondary={currentUser?.teachSubject?.length || 0}
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <Class color="primary" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Классы"
                                                        secondary={currentUser?.teachSclass?.length || 0}
                                                    />
                                                </ListItem>
                                            </List>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={8}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Имя"
                                                value={profileData.name}
                                                onChange={(e) => handleProfileChange('name', e.target.value)}
                                                disabled={!isEditingProfile}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                value={profileData.email}
                                                onChange={(e) => handleProfileChange('email', e.target.value)}
                                                disabled={!isEditingProfile}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Телефон"
                                                value={profileData.phone}
                                                onChange={(e) => handleProfileChange('phone', e.target.value)}
                                                disabled={!isEditingProfile}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Дата рождения"
                                                type="date"
                                                value={profileData.dateOfBirth}
                                                onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                                                disabled={!isEditingProfile}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Адрес"
                                                value={profileData.address}
                                                onChange={(e) => handleProfileChange('address', e.target.value)}
                                                disabled={!isEditingProfile}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Квалификация"
                                                value={profileData.qualification}
                                                onChange={(e) => handleProfileChange('qualification', e.target.value)}
                                                disabled={!isEditingProfile}
                                                placeholder="Например: Магистр математики"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Опыт работы (лет)"
                                                type="number"
                                                value={profileData.experience}
                                                onChange={(e) => handleProfileChange('experience', e.target.value)}
                                                disabled={!isEditingProfile}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Специализация"
                                                value={profileData.specialization}
                                                onChange={(e) => handleProfileChange('specialization', e.target.value)}
                                                disabled={!isEditingProfile}
                                                placeholder="Например: Алгебра, Геометрия, Математический анализ"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="О себе"
                                                multiline
                                                rows={3}
                                                value={profileData.bio}
                                                onChange={(e) => handleProfileChange('bio', e.target.value)}
                                                disabled={!isEditingProfile}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {isEditingProfile && (
                                <Box mt={3} display="flex" gap={2}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Save />}
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                    >
                                        {loading ? <CircularProgress size={20} /> : 'Сохранить'}
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </StyledCard>
                </TabPanel>

                {/* Security Tab */}
                <TabPanel value={tabValue} index={1}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="h6" mb={3}>Смена пароля</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Текущий пароль"
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                                    >
                                                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Новый пароль"
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                    >
                                                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Подтвердите пароль"
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                    >
                                                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Box mt={3}>
                                <Button
                                    variant="contained"
                                    onClick={handleChangePassword}
                                    disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                                >
                                    {loading ? <CircularProgress size={20} /> : 'Изменить пароль'}
                                </Button>
                            </Box>
                        </CardContent>
                    </StyledCard>
                </TabPanel>

                {/* Notifications Tab */}
                <TabPanel value={tabValue} index={2}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="h6" mb={3}>Настройки уведомлений</Typography>
                            <Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.emailNotifications}
                                            onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                                        />
                                    }
                                    label="Email уведомления"
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                                    Получать уведомления на электронную почту
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.assignmentSubmissions}
                                            onChange={(e) => handleNotificationChange('assignmentSubmissions', e.target.checked)}
                                        />
                                    }
                                    label="Сдача заданий"
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                                    Уведомления о новых сданных заданиях от студентов
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.studentMessages}
                                            onChange={(e) => handleNotificationChange('studentMessages', e.target.checked)}
                                        />
                                    }
                                    label="Сообщения от студентов"
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                                    Уведомления о новых сообщениях в чатах
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.gradeReminders}
                                            onChange={(e) => handleNotificationChange('gradeReminders', e.target.checked)}
                                        />
                                    }
                                    label="Напоминания об оценках"
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                                    Напоминания о непроверенных заданиях
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notificationSettings.classUpdates}
                                            onChange={(e) => handleNotificationChange('classUpdates', e.target.checked)}
                                        />
                                    }
                                    label="Обновления классов"
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 3 }}>
                                    Уведомления об изменениях в расписании и составе классов
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                onClick={handleSaveNotifications}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={20} /> : 'Сохранить настройки'}
                            </Button>
                        </CardContent>
                    </StyledCard>
                </TabPanel>

                {/* Teaching Preferences Tab */}
                <TabPanel value={tabValue} index={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="h6" mb={3}>Настройки преподавания</Typography>
                            <Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={teachingPreferences.autoGrading}
                                            onChange={(e) => handleTeachingPreferenceChange('autoGrading', e.target.checked)}
                                        />
                                    }
                                    label="Автоматическое оценивание"
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                                    Автоматически оценивать тесты с множественным выбором
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={teachingPreferences.allowLateSubmissions}
                                            onChange={(e) => handleTeachingPreferenceChange('allowLateSubmissions', e.target.checked)}
                                        />
                                    }
                                    label="Разрешить поздние сдачи"
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                                    Позволить студентам сдавать задания после дедлайна
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={teachingPreferences.requireConfirmation}
                                            onChange={(e) => handleTeachingPreferenceChange('requireConfirmation', e.target.checked)}
                                        />
                                    }
                                    label="Требовать подтверждение"
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                                    Требовать подтверждение перед отправкой заданий студентам
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={teachingPreferences.showStudentProgress}
                                            onChange={(e) => handleTeachingPreferenceChange('showStudentProgress', e.target.checked)}
                                        />
                                    }
                                    label="Показывать прогресс студентов"
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                                    Отображать детальную статистику по успеваемости
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={teachingPreferences.enableDiscussions}
                                            onChange={(e) => handleTeachingPreferenceChange('enableDiscussions', e.target.checked)}
                                        />
                                    }
                                    label="Включить обсуждения"
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 3 }}>
                                    Разрешить студентам обсуждать задания в комментариях
                                </Typography>

                                <Box mb={3}>
                                    <Typography variant="subtitle1" mb={2}>
                                        Длительность заданий по умолчанию (дни)
                                    </Typography>
                                    <TextField
                                        type="number"
                                        value={teachingPreferences.defaultAssignmentDuration}
                                        onChange={(e) => handleTeachingPreferenceChange('defaultAssignmentDuration', parseInt(e.target.value))}
                                        inputProps={{ min: 1, max: 30 }}
                                        sx={{ width: 200 }}
                                    />
                                </Box>
                            </Box>
                            <Button
                                variant="contained"
                                onClick={handleSaveTeachingPreferences}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={20} /> : 'Сохранить настройки'}
                            </Button>
                        </CardContent>
                    </StyledCard>
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default TeacherSettings; 