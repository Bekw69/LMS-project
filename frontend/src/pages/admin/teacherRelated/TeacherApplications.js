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
    Button,
    Chip,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Alert,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import {
    Person,
    Email,
    Phone,
    School,
    Work,
    Assignment,
    CheckCircle,
    Cancel,
    Visibility,
    Edit,
    Delete,
    Add,
    FilterList,
    Search,
    TrendingUp,
    PendingActions,
    ThumbUp,
    ThumbDown,
    Schedule
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../../../context/ThemeContext';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const TeacherApplications = () => {
    const { themeMode, colors } = useTheme();
    const { currentUser } = useSelector(state => state.user);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [stats, setStats] = useState({});
    const [tabValue, setTabValue] = useState(0);

    // Диалоги
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [createTeacherDialogOpen, setCreateTeacherDialogOpen] = useState(false);

    // Данные для назначения
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [assignmentData, setAssignmentData] = useState({
        subjectIds: [],
        classIds: [],
        salary: { amount: 0, currency: 'KZT', period: 'monthly' },
        startDate: ''
    });

    // Данные для создания учителя
    const [teacherPassword, setTeacherPassword] = useState('');
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchApplications();
        fetchStats();
        fetchSubjectsAndClasses();
    }, [statusFilter, page, rowsPerPage]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const params = {
                status: statusFilter === 'all' ? undefined : statusFilter,
                page: page + 1,
                limit: rowsPerPage
            };
            
            const response = await axios.get(
                `${BASE_URL}/teacher-applications/${currentUser._id}`,
                { params }
            );
            
            setApplications(response.data.applications);
        } catch (err) {
            setError('Ошибка при загрузке заявок');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}/teacher-applications/${currentUser._id}/stats`
            );
            setStats(response.data);
        } catch (err) {
            console.error('Ошибка при загрузке статистики:', err);
        }
    };

    const fetchSubjectsAndClasses = async () => {
        try {
            const [subjectsRes, classesRes] = await Promise.all([
                axios.get(`${BASE_URL}/AllSubjects/${currentUser._id}`),
                axios.get(`${BASE_URL}/SclassList/${currentUser._id}`)
            ]);
            
            setAvailableSubjects(subjectsRes.data);
            setAvailableClasses(classesRes.data);
        } catch (err) {
            console.error('Ошибка при загрузке предметов и классов:', err);
        }
    };

    const fetchApplicationDetails = async (applicationId) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/teacher-application/${applicationId}`
            );
            setSelectedApplication(response.data);
            setDetailsOpen(true);
        } catch (err) {
            setError('Ошибка при загрузке деталей заявки');
        }
    };

    const handleStatusUpdate = async (applicationId, status, comment = '') => {
        try {
            await axios.put(
                `${BASE_URL}/teacher-application/${applicationId}/status`,
                {
                    status,
                    adminComment: comment,
                    adminId: currentUser._id
                }
            );
            
            fetchApplications();
            fetchStats();
            setApproveDialogOpen(false);
            setRejectDialogOpen(false);
        } catch (err) {
            setError('Ошибка при обновлении статуса');
        }
    };

    const handleAssignSubjectsAndClasses = async () => {
        try {
            await axios.put(
                `${BASE_URL}/teacher-application/${selectedApplication._id}/assign`,
                assignmentData
            );
            
            fetchApplications();
            setAssignDialogOpen(false);
            setAssignmentData({
                subjectIds: [],
                classIds: [],
                salary: { amount: 0, currency: 'KZT', period: 'monthly' },
                startDate: ''
            });
        } catch (err) {
            setError('Ошибка при назначении предметов');
        }
    };

    const handleCreateTeacher = async () => {
        try {
            await axios.post(
                `${BASE_URL}/teacher-application/${selectedApplication._id}/create-teacher`,
                { password: teacherPassword }
            );
            
            fetchApplications();
            setCreateTeacherDialogOpen(false);
            setTeacherPassword('');
        } catch (err) {
            setError('Ошибка при создании учителя');
        }
    };

    const handleRejectApplication = async () => {
        try {
            await axios.put(
                `${BASE_URL}/teacher-application/${selectedApplication._id}/reject`,
                {
                    reason: rejectReason,
                    adminId: currentUser._id
                }
            );
            
            fetchApplications();
            fetchStats();
            setRejectDialogOpen(false);
            setRejectReason('');
        } catch (err) {
            setError('Ошибка при отклонении заявки');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return colors.warning;
            case 'under_review': return colors.info;
            case 'approved': return colors.success;
            case 'rejected': return colors.error;
            case 'interview_scheduled': return colors.primary;
            default: return colors.text.secondary;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Ожидает';
            case 'under_review': return 'На рассмотрении';
            case 'approved': return 'Одобрено';
            case 'rejected': return 'Отклонено';
            case 'interview_scheduled': return 'Собеседование';
            default: return status;
        }
    };

    const filteredApplications = applications.filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStatsCards = () => (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
                <StatsCard themeMode={themeMode} colors={colors}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                                bgcolor: colors.primary, 
                                mr: 2,
                                width: 56,
                                height: 56
                            }}>
                                <Assignment />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 300 }}>
                                    {stats.totalApplications || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Всего заявок
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </StatsCard>
            </Grid>
            
            <Grid item xs={12} md={3}>
                <StatsCard themeMode={themeMode} colors={colors}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                                bgcolor: colors.warning, 
                                mr: 2,
                                width: 56,
                                height: 56
                            }}>
                                <PendingActions />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 300 }}>
                                    {stats.stats?.find(s => s._id === 'pending')?.count || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Ожидают
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </StatsCard>
            </Grid>
            
            <Grid item xs={12} md={3}>
                <StatsCard themeMode={themeMode} colors={colors}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                                bgcolor: colors.success, 
                                mr: 2,
                                width: 56,
                                height: 56
                            }}>
                                <ThumbUp />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 300 }}>
                                    {stats.stats?.find(s => s._id === 'approved')?.count || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Одобрено
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </StatsCard>
            </Grid>
            
            <Grid item xs={12} md={3}>
                <StatsCard themeMode={themeMode} colors={colors}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                                bgcolor: colors.error, 
                                mr: 2,
                                width: 56,
                                height: 56
                            }}>
                                <ThumbDown />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 300 }}>
                                    {stats.stats?.find(s => s._id === 'rejected')?.count || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Отклонено
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </StatsCard>
            </Grid>
        </Grid>
    );

    const renderApplicationsTable = () => (
        <MainCard themeMode={themeMode} colors={colors}>
            <CardContent>
                {/* Фильтры и поиск */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Поиск по имени или email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        sx={{ minWidth: 300 }}
                    />
                    
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Статус</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="all">Все</MenuItem>
                            <MenuItem value="pending">Ожидают</MenuItem>
                            <MenuItem value="under_review">На рассмотрении</MenuItem>
                            <MenuItem value="approved">Одобрено</MenuItem>
                            <MenuItem value="rejected">Отклонено</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Таблица */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Кандидат</TableCell>
                                <TableCell>Контакты</TableCell>
                                <TableCell>Предпочитаемые предметы</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell>Дата подачи</TableCell>
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : filteredApplications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography color="text.secondary">
                                            Заявки не найдены
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredApplications.map((application) => (
                                    <TableRow key={application._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar sx={{ mr: 2, bgcolor: colors.primary }}>
                                                    {application.name.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {application.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {application.education?.[0]?.degree}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        
                                        <TableCell>
                                            <Typography variant="body2">
                                                {application.email}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {application.phone}
                                            </Typography>
                                        </TableCell>
                                        
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {application.preferredSubjects?.slice(0, 3).map((subject, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={subject}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                                {application.preferredSubjects?.length > 3 && (
                                                    <Chip
                                                        label={`+${application.preferredSubjects.length - 3}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        
                                        <TableCell>
                                            <Chip
                                                label={getStatusText(application.status)}
                                                sx={{
                                                    bgcolor: `${getStatusColor(application.status)}20`,
                                                    color: getStatusColor(application.status),
                                                    fontWeight: 500
                                                }}
                                            />
                                        </TableCell>
                                        
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(application.applicationDate).toLocaleDateString('ru-RU')}
                                            </Typography>
                                        </TableCell>
                                        
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => fetchApplicationDetails(application._id)}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                                
                                                {application.status === 'pending' && (
                                                    <>
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => {
                                                                setSelectedApplication(application);
                                                                setApproveDialogOpen(true);
                                                            }}
                                                        >
                                                            <CheckCircle />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => {
                                                                setSelectedApplication(application);
                                                                setRejectDialogOpen(true);
                                                            }}
                                                        >
                                                            <Cancel />
                                                        </IconButton>
                                                    </>
                                                )}
                                                
                                                {application.status === 'approved' && !application.teacherId && (
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => {
                                                            setSelectedApplication(application);
                                                            setAssignDialogOpen(true);
                                                        }}
                                                    >
                                                        <Assignment />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={stats.totalApplications || 0}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                    labelRowsPerPage="Строк на странице:"
                />
            </CardContent>
        </MainCard>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" sx={{ 
                    fontWeight: 300, 
                    mb: 2,
                    color: colors.text.primary
                }}>
                    Заявки учителей
                </Typography>
                <Typography variant="h6" sx={{ 
                    color: colors.text.secondary,
                    fontWeight: 300
                }}>
                    Управление заявками на должность учителя
                </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {typeof error === 'string' ? error : error.message || 'Неизвестная ошибка'}
                </Alert>
            )}

            {/* Stats Cards */}
            {renderStatsCards()}

            {/* Applications Table */}
            {renderApplicationsTable()}

            {/* Диалоги будут добавлены в следующей части... */}
        </Container>
    );
};

export default TeacherApplications;

// Styled Components
const MainCard = styled(Card)(({ themeMode, colors }) => ({
    borderRadius: 16,
    background: themeMode === 'light'
        ? 'rgba(255, 255, 255, 0.95)'
        : 'rgba(26, 26, 26, 0.95)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.divider}`,
    boxShadow: themeMode === 'light'
        ? '0px 8px 32px rgba(139, 21, 56, 0.06)'
        : '0px 8px 32px rgba(0, 0, 0, 0.3)'
}));

const StatsCard = styled(Card)(({ themeMode, colors }) => ({
    borderRadius: 16,
    background: themeMode === 'light'
        ? 'rgba(255, 255, 255, 0.9)'
        : 'rgba(26, 26, 26, 0.9)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.divider}`,
    boxShadow: themeMode === 'light'
        ? '0px 4px 16px rgba(139, 21, 56, 0.04)'
        : '0px 4px 16px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: themeMode === 'light'
            ? '0px 8px 24px rgba(139, 21, 56, 0.08)'
            : '0px 8px 24px rgba(0, 0, 0, 0.4)'
    }
})); 