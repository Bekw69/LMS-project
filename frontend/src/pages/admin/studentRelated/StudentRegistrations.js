import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Card,
    CardContent,
    CardActions,
    Alert,
    Badge,
    Tooltip,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Visibility,
    CheckCircle,
    Cancel,
    Schedule,
    PersonAdd,
    ExpandMore,
    Email,
    Phone,
    School,
    MenuBook,
    People,
    AccessTime,
    SportsEsports,
    Edit,
    Close,
    Assignment,
    CalendarToday
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

const statusColors = {
    pending: 'warning',
    under_review: 'info',
    approved: 'success',
    rejected: 'error',
    enrolled: 'success'
};

const statusLabels = {
    pending: 'Ожидает',
    under_review: 'На рассмотрении',
    approved: 'Одобрено',
    rejected: 'Отклонено',
    enrolled: 'Зачислен'
};

const StudentRegistrations = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    
    const [activeTab, setActiveTab] = useState(0);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [stats, setStats] = useState({});
    
    // Диалоги
    const [viewDialog, setViewDialog] = useState(false);
    const [approveDialog, setApproveDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [scheduleDialog, setScheduleDialog] = useState(false);
    const [enrollDialog, setEnrollDialog] = useState(false);
    
    // Выбранная заявка
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [comment, setComment] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [generatedSchedule, setGeneratedSchedule] = useState([]);

    const tabs = [
        { label: 'Все заявки', status: '' },
        { label: 'Ожидают', status: 'pending' },
        { label: 'На рассмотрении', status: 'under_review' },
        { label: 'Одобрено', status: 'approved' },
        { label: 'Отклонено', status: 'rejected' },
        { label: 'Зачислены', status: 'enrolled' }
    ];

    useEffect(() => {
        fetchRegistrations();
        fetchStats();
    }, [activeTab, page, rowsPerPage]);

    const fetchRegistrations = async () => {
        if (!currentUser?._id) return;
        
        setLoading(true);
        try {
            const status = tabs[activeTab].status;
            const response = await axios.get(
                `/student-registrations/${currentUser._id}?status=${status}&page=${page + 1}&limit=${rowsPerPage}`
            );
            
            setRegistrations(response.data.registrations);
            setTotalCount(response.data.total);
        } catch (error) {
            console.error('Ошибка при загрузке заявок:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        if (!currentUser?._id) return;
        
        try {
            const response = await axios.get(`/student-registrations/${currentUser._id}/stats`);
            setStats(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке статистики:', error);
        }
    };

    const handleViewRegistration = async (registration) => {
        try {
            const response = await axios.get(`/student-registration/${registration._id}`);
            setSelectedRegistration(response.data);
            setViewDialog(true);
        } catch (error) {
            console.error('Ошибка при загрузке деталей заявки:', error);
        }
    };

    const handleApprove = async () => {
        try {
            await axios.put(`/student-registration/${selectedRegistration._id}/status`, {
                status: 'approved',
                adminComment: comment,
                adminId: currentUser._id
            });
            
            setApproveDialog(false);
            setComment('');
            fetchRegistrations();
            fetchStats();
        } catch (error) {
            console.error('Ошибка при одобрении заявки:', error);
        }
    };

    const handleReject = async () => {
        try {
            await axios.put(`/student-registration/${selectedRegistration._id}/reject`, {
                reason: comment,
                adminId: currentUser._id
            });
            
            setRejectDialog(false);
            setComment('');
            fetchRegistrations();
            fetchStats();
        } catch (error) {
            console.error('Ошибка при отклонении заявки:', error);
        }
    };

    const handleGenerateSchedule = async () => {
        try {
            const response = await axios.post(`/student-registration/${selectedRegistration._id}/generate-schedule`);
            setGeneratedSchedule(response.data.schedule);
            setScheduleDialog(true);
        } catch (error) {
            console.error('Ошибка при генерации расписания:', error);
        }
    };

    const handleEnrollStudent = async () => {
        if (!rollNumber) {
            alert('Введите номер студента');
            return;
        }

        try {
            await axios.post(`/student-registration/${selectedRegistration._id}/create-student`, {
                rollNumber: rollNumber,
                adminId: currentUser._id
            });
            
            setEnrollDialog(false);
            setRollNumber('');
            fetchRegistrations();
            fetchStats();
        } catch (error) {
            console.error('Ошибка при зачислении студента:', error);
            alert(error.response?.data?.message || 'Ошибка зачисления');
        }
    };

    const renderRegistrationDetails = () => {
        if (!selectedRegistration) return null;

        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        Детали заявки: {selectedRegistration.name}
                    </Typography>
                </Grid>

                {/* Личная информация */}
                <Grid item xs={12}>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="h6">
                                <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Личная информация
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography><strong>Имя:</strong> {selectedRegistration.name}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography><strong>Email:</strong> {selectedRegistration.email}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography><strong>Телефон:</strong> {selectedRegistration.phone}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography><strong>Дата рождения:</strong> {new Date(selectedRegistration.dateOfBirth).toLocaleDateString()}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography><strong>Пол:</strong> {selectedRegistration.gender}</Typography>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Родители */}
                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="h6">
                                <People sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Информация о родителях
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                {selectedRegistration.parentInfo.fatherName && (
                                    <>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1">Отец:</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography><strong>Имя:</strong> {selectedRegistration.parentInfo.fatherName}</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography><strong>Телефон:</strong> {selectedRegistration.parentInfo.fatherPhone}</Typography>
                                        </Grid>
                                    </>
                                )}
                                {selectedRegistration.parentInfo.motherName && (
                                    <>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1">Мать:</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography><strong>Имя:</strong> {selectedRegistration.parentInfo.motherName}</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography><strong>Телефон:</strong> {selectedRegistration.parentInfo.motherPhone}</Typography>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Выбранные предметы */}
                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="h6">
                                <MenuBook sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Выбранные предметы
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {selectedRegistration.selectedSubjects.map((subj, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <MenuBook />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={subj.subject.subName}
                                            secondary={`Приоритет: ${subj.priority}/5`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Предпочтения расписания */}
                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="h6">
                                <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Предпочтения расписания
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography><strong>Время начала:</strong> {selectedRegistration.schedulePreferences.preferredStartTime}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography><strong>Макс. часов в день:</strong> {selectedRegistration.schedulePreferences.maxHoursPerDay}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography><strong>Предпочитаемые дни:</strong></Typography>
                                    <Box sx={{ mt: 1 }}>
                                        {selectedRegistration.schedulePreferences.preferredDays.map(day => (
                                            <Chip key={day} label={day} sx={{ mr: 1, mb: 1 }} />
                                        ))}
                                    </Box>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Статус и комментарии */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Статус заявки</Typography>
                            <Chip 
                                label={statusLabels[selectedRegistration.status]} 
                                color={statusColors[selectedRegistration.status]}
                                sx={{ mb: 2 }}
                            />
                            <Typography variant="body2" color="textSecondary">
                                Подана: {new Date(selectedRegistration.registrationDate).toLocaleDateString()}
                            </Typography>
                            {selectedRegistration.reviewDate && (
                                <Typography variant="body2" color="textSecondary">
                                    Рассмотрена: {new Date(selectedRegistration.reviewDate).toLocaleDateString()}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Комментарии администратора */}
                {selectedRegistration.adminComments && selectedRegistration.adminComments.length > 0 && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Комментарии администратора</Typography>
                                {selectedRegistration.adminComments.map((comment, index) => (
                                    <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                        <Typography variant="body2">{comment.comment}</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(comment.date).toLocaleString()}
                                        </Typography>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        );
    };

    const renderSchedule = () => {
        if (!generatedSchedule || generatedSchedule.length === 0) return null;

        return (
            <Box>
                <Typography variant="h6" gutterBottom>Сгенерированное расписание</Typography>
                {generatedSchedule.map((daySchedule, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>{daySchedule.day}</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Время</TableCell>
                                        <TableCell>Предмет</TableCell>
                                        <TableCell>Кабинет</TableCell>
                                        <TableCell>Тип</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {daySchedule.timeSlots.map((slot, slotIndex) => (
                                        <TableRow key={slotIndex}>
                                            <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                                            <TableCell>{slot.subject}</TableCell>
                                            <TableCell>{slot.room}</TableCell>
                                            <TableCell>{slot.type}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Регистрации студентов
            </Typography>

            {/* Статистика */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                                {stats.total || 0}
                            </Typography>
                            <Typography variant="body2">Всего заявок</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {stats.stats && stats.stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={2} key={index}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color={statusColors[stat._id]}>
                                    {stat.count}
                                </Typography>
                                <Typography variant="body2">
                                    {statusLabels[stat._id]}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Вкладки */}
            <Paper sx={{ mb: 3 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabs.map((tab, index) => (
                        <Tab 
                            key={index} 
                            label={
                                <Badge 
                                    badgeContent={stats.stats?.find(s => s._id === tab.status)?.count || 0}
                                    color="primary"
                                    invisible={!tab.status}
                                >
                                    {tab.label}
                                </Badge>
                            }
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Таблица заявок */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Имя</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Класс</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell>Дата подачи</TableCell>
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : registrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Нет заявок
                                    </TableCell>
                                </TableRow>
                            ) : (
                                registrations.map((registration) => (
                                    <TableRow key={registration._id}>
                                        <TableCell>{registration.name}</TableCell>
                                        <TableCell>{registration.email}</TableCell>
                                        <TableCell>{registration.selectedClass?.sclassName}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={statusLabels[registration.status]}
                                                color={statusColors[registration.status]}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(registration.registrationDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Просмотр">
                                                <IconButton 
                                                    onClick={() => handleViewRegistration(registration)}
                                                    size="small"
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            {registration.status === 'pending' && (
                                                <>
                                                    <Tooltip title="Одобрить">
                                                        <IconButton 
                                                            onClick={() => {
                                                                setSelectedRegistration(registration);
                                                                setApproveDialog(true);
                                                            }}
                                                            size="small"
                                                            color="success"
                                                        >
                                                            <CheckCircle />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Отклонить">
                                                        <IconButton 
                                                            onClick={() => {
                                                                setSelectedRegistration(registration);
                                                                setRejectDialog(true);
                                                            }}
                                                            size="small"
                                                            color="error"
                                                        >
                                                            <Cancel />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            
                                            {registration.status === 'approved' && (
                                                <>
                                                    <Tooltip title="Генерировать расписание">
                                                        <IconButton 
                                                            onClick={() => {
                                                                setSelectedRegistration(registration);
                                                                handleGenerateSchedule();
                                                            }}
                                                            size="small"
                                                            color="info"
                                                        >
                                                            <Schedule />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Зачислить студента">
                                                        <IconButton 
                                                            onClick={() => {
                                                                setSelectedRegistration(registration);
                                                                setEnrollDialog(true);
                                                            }}
                                                            size="small"
                                                            color="primary"
                                                        >
                                                            <PersonAdd />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="Строк на странице:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
                />
            </Paper>

            {/* Диалог просмотра заявки */}
            <Dialog 
                open={viewDialog} 
                onClose={() => setViewDialog(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    Детали заявки
                    <IconButton
                        onClick={() => setViewDialog(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {renderRegistrationDetails()}
                </DialogContent>
            </Dialog>

            {/* Диалог одобрения */}
            <Dialog open={approveDialog} onClose={() => setApproveDialog(false)}>
                <DialogTitle>Одобрить заявку</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Комментарий (необязательно)"
                        multiline
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApproveDialog(false)}>Отмена</Button>
                    <Button onClick={handleApprove} variant="contained" color="success">
                        Одобрить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог отклонения */}
            <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)}>
                <DialogTitle>Отклонить заявку</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Причина отклонения"
                        multiline
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{ mt: 2 }}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialog(false)}>Отмена</Button>
                    <Button onClick={handleReject} variant="contained" color="error">
                        Отклонить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог расписания */}
            <Dialog 
                open={scheduleDialog} 
                onClose={() => setScheduleDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Расписание для студента</DialogTitle>
                <DialogContent>
                    {renderSchedule()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setScheduleDialog(false)}>Закрыть</Button>
                </DialogActions>
            </Dialog>

            {/* Диалог зачисления */}
            <Dialog open={enrollDialog} onClose={() => setEnrollDialog(false)}>
                <DialogTitle>Зачислить студента</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Номер студента"
                        type="number"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        sx={{ mt: 2 }}
                        required
                    />
                    <Alert severity="info" sx={{ mt: 2 }}>
                        После зачисления студент получит доступ к системе с указанным номером в качестве пароля.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEnrollDialog(false)}>Отмена</Button>
                    <Button onClick={handleEnrollStudent} variant="contained" color="primary">
                        Зачислить
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StudentRegistrations; 