import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Alert,
    Tabs,
    Tab,
    LinearProgress,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Badge
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Assignment as AssignmentIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Visibility as VisibilityIcon,
    Grade as GradeIcon,
    AccessTime as AccessTimeIcon,
    Person as PersonIcon,
    AttachFile as AttachFileIcon,
    Download as DownloadIcon
} from '@mui/icons-material';

const AssignmentManager = ({ 
    userRole = 'teacher', // teacher, student
    teacherId = null,
    studentId = null,
    classId = null
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [assignmentData, setAssignmentData] = useState({
        title: '',
        description: '',
        subject: '',
        dueDate: '',
        maxPoints: 100,
        attachments: [],
        instructions: '',
        allowLateSubmission: true,
        submissionType: 'file' // file, text, both
    });

    const [submissionData, setSubmissionData] = useState({
        text: '',
        files: [],
        comments: ''
    });

    useEffect(() => {
        loadAssignments();
        if (userRole === 'teacher') {
            loadSubmissions();
        }
    }, [teacherId, studentId, classId]);

    const loadAssignments = async () => {
        // Загрузка заданий в зависимости от роли
        try {
            let endpoint = '';
            if (userRole === 'teacher' && teacherId) {
                endpoint = `/assignments/teacher/${teacherId}`;
            } else if (userRole === 'student' && studentId) {
                endpoint = `/assignments/student/${studentId}`;
            }
            
            // Заглушка для демонстрации
            setAssignments(generateSampleAssignments());
        } catch (error) {
            console.error('Ошибка загрузки заданий:', error);
        }
    };

    const loadSubmissions = async () => {
        // Загрузка работ студентов для учителя
        try {
            const endpoint = `/submissions/teacher/${teacherId}`;
            // Заглушка для демонстрации
            setSubmissions(generateSampleSubmissions());
        } catch (error) {
            console.error('Ошибка загрузки работ:', error);
        }
    };

    const generateSampleAssignments = () => {
        const subjects = ['Математика', 'Физика', 'Химия', 'История', 'Литература'];
        const statuses = ['active', 'completed', 'overdue'];
        
        return Array.from({ length: 8 }, (_, i) => ({
            id: i + 1,
            title: `Задание ${i + 1}`,
            description: `Описание задания ${i + 1}. Выполните все пункты согласно инструкции.`,
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            maxPoints: Math.floor(Math.random() * 50) + 50,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            submissionsCount: Math.floor(Math.random() * 25) + 5,
            totalStudents: 30,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            allowLateSubmission: Math.random() > 0.5,
            submissionType: ['file', 'text', 'both'][Math.floor(Math.random() * 3)]
        }));
    };

    const generateSampleSubmissions = () => {
        const students = [
            'Иванов Иван', 'Петров Петр', 'Сидоров Сидор', 'Козлов Козьма',
            'Смирнов Смирн', 'Попов Поп', 'Лебедев Лебедь', 'Новиков Новик'
        ];
        const statuses = ['submitted', 'graded', 'late', 'missing'];
        
        return Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            studentName: students[Math.floor(Math.random() * students.length)],
            assignmentTitle: `Задание ${Math.floor(Math.random() * 5) + 1}`,
            submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            grade: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 1 : null,
            maxPoints: 100,
            feedback: Math.random() > 0.7 ? 'Хорошая работа! Есть небольшие замечания.' : '',
            files: Math.floor(Math.random() * 3) + 1
        }));
    };

    const handleCreateAssignment = () => {
        setAssignmentData({
            title: '',
            description: '',
            subject: '',
            dueDate: '',
            maxPoints: 100,
            attachments: [],
            instructions: '',
            allowLateSubmission: true,
            submissionType: 'file'
        });
        setSelectedAssignment(null);
        setOpenDialog(true);
    };

    const handleEditAssignment = (assignment) => {
        setAssignmentData({
            title: assignment.title,
            description: assignment.description,
            subject: assignment.subject,
            dueDate: assignment.dueDate,
            maxPoints: assignment.maxPoints,
            attachments: assignment.attachments || [],
            instructions: assignment.instructions || '',
            allowLateSubmission: assignment.allowLateSubmission,
            submissionType: assignment.submissionType
        });
        setSelectedAssignment(assignment);
        setOpenDialog(true);
    };

    const handleSaveAssignment = async () => {
        try {
            if (selectedAssignment) {
                // Обновление задания
                const updatedAssignments = assignments.map(a => 
                    a.id === selectedAssignment.id ? { ...a, ...assignmentData } : a
                );
                setAssignments(updatedAssignments);
            } else {
                // Создание нового задания
                const newAssignment = {
                    id: Date.now(),
                    ...assignmentData,
                    status: 'active',
                    submissionsCount: 0,
                    totalStudents: 30,
                    createdAt: new Date().toISOString()
                };
                setAssignments([newAssignment, ...assignments]);
            }
            setOpenDialog(false);
        } catch (error) {
            console.error('Ошибка сохранения задания:', error);
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        try {
            setAssignments(assignments.filter(a => a.id !== assignmentId));
        } catch (error) {
            console.error('Ошибка удаления задания:', error);
        }
    };

    const handleGradeSubmission = (submissionId, grade, feedback) => {
        const updatedSubmissions = submissions.map(s => 
            s.id === submissionId 
                ? { ...s, grade, feedback, status: 'graded' }
                : s
        );
        setSubmissions(updatedSubmissions);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'primary';
            case 'completed': return 'success';
            case 'overdue': return 'error';
            case 'submitted': return 'info';
            case 'graded': return 'success';
            case 'late': return 'warning';
            case 'missing': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Активно';
            case 'completed': return 'Завершено';
            case 'overdue': return 'Просрочено';
            case 'submitted': return 'Сдано';
            case 'graded': return 'Оценено';
            case 'late': return 'Поздно';
            case 'missing': return 'Не сдано';
            default: return status;
        }
    };

    const renderAssignmentsList = () => (
        <Grid container spacing={3}>
            {assignments.map(assignment => (
                <Grid item xs={12} md={6} lg={4} key={assignment.id}>
                    <Card elevation={2}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Typography variant="h6" component="div" noWrap>
                                    {assignment.title}
                                </Typography>
                                <Chip 
                                    label={getStatusLabel(assignment.status)} 
                                    color={getStatusColor(assignment.status)}
                                    size="small"
                                />
                            </Box>
                            
                            <Typography variant="body2" color="textSecondary" paragraph>
                                {assignment.description}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" mb={1}>
                                <AssignmentIcon sx={{ mr: 1, fontSize: 16 }} />
                                <Typography variant="body2">{assignment.subject}</Typography>
                            </Box>
                            
                            <Box display="flex" alignItems="center" mb={1}>
                                <AccessTimeIcon sx={{ mr: 1, fontSize: 16 }} />
                                <Typography variant="body2">
                                    До: {new Date(assignment.dueDate).toLocaleDateString()}
                                </Typography>
                            </Box>
                            
                            <Box display="flex" alignItems="center" mb={2}>
                                <GradeIcon sx={{ mr: 1, fontSize: 16 }} />
                                <Typography variant="body2">
                                    Макс. баллов: {assignment.maxPoints}
                                </Typography>
                            </Box>
                            
                            {userRole === 'teacher' && (
                                <Box mb={2}>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={(assignment.submissionsCount / assignment.totalStudents) * 100}
                                        sx={{ mb: 1 }}
                                    />
                                    <Typography variant="caption" color="textSecondary">
                                        Сдано: {assignment.submissionsCount}/{assignment.totalStudents}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                        
                        <CardActions>
                            <Button size="small" startIcon={<VisibilityIcon />}>
                                Просмотр
                            </Button>
                            {userRole === 'teacher' && (
                                <>
                                    <Button 
                                        size="small" 
                                        startIcon={<EditIcon />}
                                        onClick={() => handleEditAssignment(assignment)}
                                    >
                                        Изменить
                                    </Button>
                                    <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </>
                            )}
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderSubmissionsList = () => (
        <TableContainer component={Paper} elevation={2}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Студент</TableCell>
                        <TableCell>Задание</TableCell>
                        <TableCell>Дата сдачи</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Оценка</TableCell>
                        <TableCell align="center">Действия</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {submissions.map(submission => (
                        <TableRow key={submission.id} hover>
                            <TableCell>
                                <Box display="flex" alignItems="center">
                                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                        {submission.studentName.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body2">
                                        {submission.studentName}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell>{submission.assignmentTitle}</TableCell>
                            <TableCell>
                                {new Date(submission.submittedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <Chip 
                                    label={getStatusLabel(submission.status)} 
                                    color={getStatusColor(submission.status)}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                {submission.grade ? (
                                    <Typography variant="body2" fontWeight="bold">
                                        {submission.grade}/{submission.maxPoints}
                                    </Typography>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        Не оценено
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell align="center">
                                <Tooltip title="Просмотр работы">
                                    <IconButton size="small">
                                        <VisibilityIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Скачать файлы">
                                    <IconButton size="small">
                                        <DownloadIcon />
                                    </IconButton>
                                </Tooltip>
                                {submission.status !== 'graded' && (
                                    <Tooltip title="Оценить">
                                        <IconButton size="small" color="primary">
                                            <GradeIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderStats = () => {
        const totalAssignments = assignments.length;
        const activeAssignments = assignments.filter(a => a.status === 'active').length;
        const overdueAssignments = assignments.filter(a => a.status === 'overdue').length;
        const totalSubmissions = submissions.length;
        const gradedSubmissions = submissions.filter(s => s.status === 'graded').length;

        return (
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" color="primary">
                                {totalAssignments}
                            </Typography>
                            <Typography variant="body2">Всего заданий</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <ScheduleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="h4" color="success.main">
                                {activeAssignments}
                            </Typography>
                            <Typography variant="body2">Активных</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AccessTimeIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                            <Typography variant="h4" color="error.main">
                                {overdueAssignments}
                            </Typography>
                            <Typography variant="body2">Просроченных</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                            <Typography variant="h4" color="info.main">
                                {gradedSubmissions}/{totalSubmissions}
                            </Typography>
                            <Typography variant="body2">Проверено</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">
                    <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {userRole === 'teacher' ? 'Управление заданиями' : 'Мои задания'}
                </Typography>
                {userRole === 'teacher' && (
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={handleCreateAssignment}
                    >
                        Создать задание
                    </Button>
                )}
            </Box>

            {userRole === 'teacher' && renderStats()}

            <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)} 
                sx={{ mb: 3 }}
            >
                <Tab 
                    label={
                        <Badge badgeContent={assignments.length} color="primary">
                            Задания
                        </Badge>
                    } 
                />
                {userRole === 'teacher' && (
                    <Tab 
                        label={
                            <Badge badgeContent={submissions.filter(s => s.status === 'submitted').length} color="error">
                                Работы на проверке
                            </Badge>
                        } 
                    />
                )}
            </Tabs>

            {activeTab === 0 && renderAssignmentsList()}
            {activeTab === 1 && userRole === 'teacher' && renderSubmissionsList()}

            {/* Диалог создания/редактирования задания */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedAssignment ? 'Редактировать задание' : 'Создать задание'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Название задания"
                                value={assignmentData.title}
                                onChange={(e) => setAssignmentData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Описание"
                                multiline
                                rows={3}
                                value={assignmentData.description}
                                onChange={(e) => setAssignmentData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Предмет</InputLabel>
                                <Select
                                    value={assignmentData.subject}
                                    onChange={(e) => setAssignmentData(prev => ({ ...prev, subject: e.target.value }))}
                                >
                                    <MenuItem value="Математика">Математика</MenuItem>
                                    <MenuItem value="Физика">Физика</MenuItem>
                                    <MenuItem value="Химия">Химия</MenuItem>
                                    <MenuItem value="История">История</MenuItem>
                                    <MenuItem value="Литература">Литература</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Дедлайн"
                                type="datetime-local"
                                value={assignmentData.dueDate}
                                onChange={(e) => setAssignmentData(prev => ({ ...prev, dueDate: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Максимальные баллы"
                                type="number"
                                value={assignmentData.maxPoints}
                                onChange={(e) => setAssignmentData(prev => ({ ...prev, maxPoints: parseInt(e.target.value) }))}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Тип сдачи</InputLabel>
                                <Select
                                    value={assignmentData.submissionType}
                                    onChange={(e) => setAssignmentData(prev => ({ ...prev, submissionType: e.target.value }))}
                                >
                                    <MenuItem value="file">Только файлы</MenuItem>
                                    <MenuItem value="text">Только текст</MenuItem>
                                    <MenuItem value="both">Файлы и текст</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Инструкции"
                                multiline
                                rows={4}
                                value={assignmentData.instructions}
                                onChange={(e) => setAssignmentData(prev => ({ ...prev, instructions: e.target.value }))}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
                    <Button onClick={handleSaveAssignment} variant="contained">
                        {selectedAssignment ? 'Сохранить' : 'Создать'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AssignmentManager; 