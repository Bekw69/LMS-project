import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Avatar,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider
} from '@mui/material';
import {
    Group,
    School,
    Person,
    Schedule,
    CheckCircle,
    Pending,
    Cancel,
    Send,
    Info
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8]
    }
}));

const StatusChip = styled(Chip)(({ status }) => ({
    fontWeight: 600,
    ...(status === 'approved' && {
        backgroundColor: '#4caf50',
        color: 'white'
    }),
    ...(status === 'pending' && {
        backgroundColor: '#ff9800',
        color: 'white'
    }),
    ...(status === 'rejected' && {
        backgroundColor: '#f44336',
        color: 'white'
    })
}));

const StudentGroupRegistration = () => {
    const { currentUser } = useSelector(state => state.user);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [applicationReason, setApplicationReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    useEffect(() => {
        fetchData();
    }, [currentUser]);

    const fetchData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchAvailableGroups(),
                fetchMyApplications()
            ]);
        } catch (error) {
            showMessage('Ошибка при загрузке данных', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableGroups = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/groups/available/${currentUser.school._id}`);
            setAvailableGroups(response.data.data || []);
        } catch (error) {
            console.error('Ошибка загрузки групп:', error);
        }
    };

    const fetchMyApplications = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/group-applications/student/${currentUser._id}`);
            setMyApplications(response.data.data || []);
        } catch (error) {
            console.error('Ошибка загрузки заявок:', error);
        }
    };

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleApplyToGroup = (group) => {
        setSelectedGroup(group);
        setApplicationReason('');
        setDialogOpen(true);
    };

    const handleSubmitApplication = async () => {
        if (!applicationReason.trim()) {
            showMessage('Пожалуйста, укажите причину подачи заявки', 'error');
            return;
        }

        try {
            setSubmitting(true);
            const response = await axios.post(`${BASE_URL}/group-applications/create`, {
                studentId: currentUser._id,
                groupId: selectedGroup._id,
                reason: applicationReason,
                studentInfo: {
                    name: currentUser.name,
                    email: currentUser.email,
                    rollNum: currentUser.rollNum,
                    currentClass: currentUser.sclassName?.sclassName
                }
            });

            if (response.data.success) {
                showMessage('Заявка успешно подана!');
                setDialogOpen(false);
                fetchMyApplications(); // Обновляем список заявок
            }
        } catch (error) {
            showMessage(error.response?.data?.message || 'Ошибка при подаче заявки', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle />;
            case 'pending':
                return <Pending />;
            case 'rejected':
                return <Cancel />;
            default:
                return <Info />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return 'Одобрено';
            case 'pending':
                return 'На рассмотрении';
            case 'rejected':
                return 'Отклонено';
            default:
                return 'Неизвестно';
        }
    };

    const isAlreadyApplied = (groupId) => {
        return myApplications.some(app => 
            app.group._id === groupId && 
            (app.status === 'pending' || app.status === 'approved')
        );
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                Регистрация в группы
            </Typography>

            {message && (
                <Alert severity={messageType} sx={{ mb: 3 }}>
                    {message}
                </Alert>
            )}

            {/* Мои заявки */}
            {myApplications.length > 0 && (
                <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="primary" />
                        Мои заявки
                    </Typography>
                    <List>
                        {myApplications.map((application, index) => (
                            <React.Fragment key={application._id}>
                                <ListItem>
                                    <ListItemIcon>
                                        {getStatusIcon(application.status)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Typography variant="subtitle1">
                                                    {application.group.name}
                                                </Typography>
                                                <StatusChip 
                                                    label={getStatusText(application.status)}
                                                    status={application.status}
                                                    size="small"
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Подано: {new Date(application.createdAt).toLocaleDateString('ru-RU')}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    Причина: {application.reason}
                                                </Typography>
                                                {application.adminResponse && (
                                                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                                        Ответ администратора: {application.adminResponse}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < myApplications.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Доступные группы */}
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Group color="primary" />
                Доступные группы
            </Typography>

            {availableGroups.length === 0 ? (
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary">
                        Нет доступных групп для регистрации
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Обратитесь к администратору для получения информации о новых группах
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {availableGroups.map((group) => (
                        <Grid item xs={12} md={6} lg={4} key={group._id}>
                            <StyledCard>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        <Avatar
                                            sx={{
                                                bgcolor: 'primary.main',
                                                width: 56,
                                                height: 56
                                            }}
                                        >
                                            <Group />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" component="h3">
                                                {group.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {group.description}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box mb={2}>
                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <School fontSize="small" color="action" />
                                            Предметы: {group.subjects?.length || 0}
                                        </Typography>
                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Person fontSize="small" color="action" />
                                            Студентов: {group.currentStudents || 0} / {group.maxStudents || 'Не ограничено'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Schedule fontSize="small" color="action" />
                                            Создана: {new Date(group.createdAt).toLocaleDateString('ru-RU')}
                                        </Typography>
                                    </Box>

                                    {group.subjects && group.subjects.length > 0 && (
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                                Предметы:
                                            </Typography>
                                            <Box display="flex" flexWrap="wrap" gap={1}>
                                                {group.subjects.slice(0, 3).map((subject) => (
                                                    <Chip
                                                        key={subject._id}
                                                        label={subject.subName}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                                {group.subjects.length > 3 && (
                                                    <Chip
                                                        label={`+${group.subjects.length - 3} еще`}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<Send />}
                                        onClick={() => handleApplyToGroup(group)}
                                        disabled={isAlreadyApplied(group._id)}
                                        sx={{
                                            background: isAlreadyApplied(group._id) 
                                                ? 'linear-gradient(45deg, #9e9e9e 30%, #757575 90%)'
                                                : 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                                            '&:hover': {
                                                background: isAlreadyApplied(group._id)
                                                    ? 'linear-gradient(45deg, #9e9e9e 30%, #757575 90%)'
                                                    : 'linear-gradient(45deg, #1976d2 30%, #1cb5e0 90%)'
                                            }
                                        }}
                                    >
                                        {isAlreadyApplied(group._id) ? 'Заявка подана' : 'Подать заявку'}
                                    </Button>
                                </CardActions>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Диалог подачи заявки */}
            <Dialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Send color="primary" />
                        <Typography variant="h6">
                            Подача заявки в группу "{selectedGroup?.name}"
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Пожалуйста, укажите причину, по которой вы хотите присоединиться к этой группе.
                        Это поможет администратору принять решение по вашей заявке.
                    </Typography>
                    
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Причина подачи заявки"
                        value={applicationReason}
                        onChange={(e) => setApplicationReason(e.target.value)}
                        placeholder="Например: Интересуюсь данными предметами, хочу улучшить свои знания в этой области..."
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setDialogOpen(false)}
                        disabled={submitting}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitApplication}
                        disabled={submitting || !applicationReason.trim()}
                        startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                    >
                        {submitting ? 'Отправка...' : 'Подать заявку'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StudentGroupRegistration; 