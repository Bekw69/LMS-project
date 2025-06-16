import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Tabs,
    Tab,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Avatar,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Badge,
    LinearProgress,
    Alert
} from '@mui/material';
import {
    Grade,
    EventAvailable,
    Assignment,
    LibraryBooks,
    TrendingUp,
    Add,
    Download,
    Upload,
    Visibility,
    Edit,
    Delete,
    CheckCircle,
    Cancel,
    Schedule,
    People,
    Assessment
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import VSKScheduler from './VSKScheduler';
import StudentRanking from './StudentRanking';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`group-tabpanel-${index}`}
            aria-labelledby={`group-tab-${index}`}
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

const TeacherGroupDetails = () => {
    const { courseId, groupId } = useParams();
    const [tabValue, setTabValue] = useState(0);
    const [groupData, setGroupData] = useState({});
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [openVSKScheduler, setOpenVSKScheduler] = useState(false);

    useEffect(() => {
        // Загрузка данных группы
        const mockGroupData = {
            id: groupId,
            name: 'Группа А',
            courseName: 'Frontend Development',
            teacherName: 'Иванов И.И.',
            studentsCount: 25,
            averageGrade: 4.2,
            attendanceRate: 87
        };

        const mockStudents = [
            { id: 1, name: 'Александр Петров', email: 'a.petrov@example.com', avgGrade: 4.8, attendance: 95, lastActivity: '2024-01-20T14:30:00' },
            { id: 2, name: 'Мария Сидорова', email: 'm.sidorova@example.com', avgGrade: 4.5, attendance: 92, lastActivity: '2024-01-19T16:45:00' },
            { id: 3, name: 'Дмитрий Козлов', email: 'd.kozlov@example.com', avgGrade: 4.2, attendance: 88, lastActivity: '2024-01-21T10:15:00' },
            { id: 4, name: 'Елена Иванова', email: 'e.ivanova@example.com', avgGrade: 4.0, attendance: 90, lastActivity: '2024-01-18T13:20:00' },
            { id: 5, name: 'Максим Волков', email: 'm.volkov@example.com', avgGrade: 3.8, attendance: 85, lastActivity: '2024-01-20T11:30:00' }
        ];

        const mockMaterials = [
            { id: 1, title: 'Лекция 1 - HTML Основы', type: 'pdf', size: '2.5MB', uploadDate: '2024-01-15T10:00:00', downloads: 23 },
            { id: 2, title: 'Практические примеры CSS', type: 'zip', size: '5.8MB', uploadDate: '2024-01-18T14:30:00', downloads: 18 },
            { id: 3, title: 'Видео урок - Flexbox', type: 'mp4', size: '45.2MB', uploadDate: '2024-01-20T09:15:00', downloads: 15 }
        ];

        setGroupData(mockGroupData);
        setStudents(mockStudents);
        setMaterials(mockMaterials);
    }, [courseId, groupId]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getGradeColor = (grade) => {
        if (grade >= 4.5) return 'success';
        if (grade >= 4.0) return 'info';
        if (grade >= 3.5) return 'warning';
        return 'error';
    };

    const getAttendanceColor = (attendance) => {
        if (attendance >= 85) return 'success';
        if (attendance >= 70) return 'warning';
        return 'error';
    };

    // Gradebook Tab Component
    function GradebookTab() {
        return (
            <TableContainer component={Paper} variant="outlined">
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Студент</TableCell>
                            <TableCell align="center">Средний балл</TableCell>
                            <TableCell align="center">ВСК1</TableCell>
                            <TableCell align="center">ВСК2</TableCell>
                            <TableCell align="center">Финал</TableCell>
                            <TableCell align="center">Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id} hover>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <Avatar sx={{ mr: 2 }}>{student.name.charAt(0)}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle1">{student.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {student.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={student.avgGrade}
                                        color={getGradeColor(student.avgGrade)}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="center">4.2</TableCell>
                                <TableCell align="center">-</TableCell>
                                <TableCell align="center">-</TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" color="primary">
                                        <Edit />
                                    </IconButton>
                                    <IconButton size="small" color="secondary">
                                        <Visibility />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    // Attendance Tab Component
    function AttendanceTab() {
        return (
            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Студент</TableCell>
                            <TableCell align="center">Посещаемость</TableCell>
                            <TableCell align="center">Последняя активность</TableCell>
                            <TableCell align="center">Статус</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id} hover>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <Avatar sx={{ mr: 2 }}>{student.name.charAt(0)}</Avatar>
                                        <Typography variant="subtitle1">{student.name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            {student.attendance}%
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={student.attendance}
                                            color={getAttendanceColor(student.attendance)}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    {new Date(student.lastActivity).toLocaleDateString('ru-RU')}
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        icon={student.attendance >= 85 ? <CheckCircle /> : <Cancel />}
                                        label={student.attendance >= 85 ? 'Активен' : 'Неактивен'}
                                        color={student.attendance >= 85 ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    // Enhanced Assignments Tab
    function AssignmentsTab() {
        const [assignments, setAssignments] = useState([]);
        const [openCreateDialog, setOpenCreateDialog] = useState(false);

        useEffect(() => {
            // Mock data with more detailed assignments
            const mockAssignments = [
                {
                    id: 1,
                    title: 'ВСК 1 - HTML/CSS Основы',
                    type: 'VSK1',
                    status: 'active',
                    startDate: '2024-01-10T09:00:00',
                    endDate: '2024-01-25T23:59:00',
                    submitted: 23,
                    total: 25,
                    graded: 18,
                    averageScore: 82.5
                },
                {
                    id: 2,
                    title: 'Домашнее задание - Верстка страницы',
                    type: 'HOMEWORK',
                    status: 'active',
                    startDate: '2024-01-15T00:00:00',
                    endDate: '2024-01-30T23:59:00',
                    submitted: 20,
                    total: 25,
                    graded: 15,
                    averageScore: 78.2
                },
                {
                    id: 3,
                    title: 'ВСК 2 - CSS Grid & Flexbox',
                    type: 'VSK2',
                    status: 'scheduled',
                    startDate: '2024-02-05T09:00:00',
                    endDate: '2024-02-20T23:59:00',
                    submitted: 0,
                    total: 25,
                    graded: 0,
                    averageScore: 0
                }
            ];
            setAssignments(mockAssignments);
        }, []);

        const getStatusColor = (status) => {
            switch (status) {
                case 'active': return 'success';
                case 'scheduled': return 'info';
                case 'completed': return 'default';
                default: return 'default';
            }
        };

        const getStatusText = (status) => {
            switch (status) {
                case 'active': return 'Активно';
                case 'scheduled': return 'Запланировано';
                case 'completed': return 'Завершено';
                default: return 'Неизвестно';
            }
        };

        const getProgressColor = (submitted, total) => {
            const percentage = (submitted / total) * 100;
            if (percentage >= 80) return 'success';
            if (percentage >= 50) return 'warning';
            return 'error';
        };

        return (
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">
                        Задания группы ({assignments.length})
                    </Typography>
                    <Box display="flex" gap={1}>
                        <Button
                            variant="outlined"
                            startIcon={<Schedule />}
                            onClick={() => setOpenVSKScheduler(true)}
                        >
                            Автоматизация ВСК
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setOpenCreateDialog(true)}
                        >
                            Создать задание
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {assignments.map((assignment) => (
                        <Grid item xs={12} md={6} key={assignment.id}>
                            <StyledAssignmentCard elevation={2}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Typography variant="h6" component="div">
                                            {assignment.title}
                                        </Typography>
                                        <Box display="flex" gap={1}>
                                            <Chip 
                                                label={assignment.type} 
                                                size="small" 
                                                variant="outlined"
                                                color={assignment.type.includes('VSK') ? 'primary' : 'default'}
                                            />
                                            <Chip
                                                label={getStatusText(assignment.status)}
                                                color={getStatusColor(assignment.status)}
                                                size="small"
                                            />
                                        </Box>
                                    </Box>

                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Начало:</strong><br />
                                                {new Date(assignment.startDate).toLocaleDateString('ru-RU')}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Окончание:</strong><br />
                                                {new Date(assignment.endDate).toLocaleDateString('ru-RU')}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    {/* Progress indicators */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="body2" color="text.secondary">
                                                Выполнение
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {assignment.submitted}/{assignment.total}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(assignment.submitted / assignment.total) * 100}
                                            color={getProgressColor(assignment.submitted, assignment.total)}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>

                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Проверено:</strong> {assignment.graded}/{assignment.submitted}
                                        </Typography>
                                        {assignment.averageScore > 0 && (
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Средний балл:</strong> {assignment.averageScore.toFixed(1)}%
                                            </Typography>
                                        )}
                                    </Box>

                                    <Box display="flex" gap={1}>
                                        <Button
                                            size="small"
                                            startIcon={<Visibility />}
                                            variant="outlined"
                                        >
                                            Просмотр
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<Edit />}
                                            variant="outlined"
                                        >
                                            Редактировать
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<Assessment />}
                                            variant="outlined"
                                        >
                                            Результаты
                                        </Button>
                                    </Box>
                                </CardContent>
                            </StyledAssignmentCard>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    // Library Tab Component
    function LibraryTab() {
        return (
            <Box>
                <Box mb={3}>
                    <Button variant="contained" startIcon={<Upload />}>
                        Загрузить материал
                    </Button>
                </Box>

                <List>
                    {materials.map((material, index) => (
                        <React.Fragment key={material.id}>
                            <ListItem
                                secondaryAction={
                                    <Box>
                                        <Badge badgeContent={material.downloads} color="primary" sx={{ mr: 2 }}>
                                            <IconButton color="primary">
                                                <Download />
                                            </IconButton>
                                        </Badge>
                                        <IconButton color="secondary">
                                            <Edit />
                                        </IconButton>
                                        <IconButton color="error">
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemIcon>
                                    <LibraryBooks />
                                </ListItemIcon>
                                <ListItemText
                                    primary={material.title}
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {material.type.toUpperCase()} • {material.size} • 
                                                Загружено: {new Date(material.uploadDate).toLocaleDateString('ru-RU')}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                            {index < materials.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Box>
        );
    }

    // Ranking Tab Component
    function RankingTab() {
        return <StudentRanking groupId={groupId} />;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header with VSK Scheduler button */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                        {groupData.courseName} - {groupData.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {groupData.studentsCount} студентов • Преподаватель: {groupData.teacherName}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Schedule />}
                    onClick={() => setOpenVSKScheduler(true)}
                    sx={{
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 3px 10px rgba(102, 126, 234, 0.4)',
                        '&:hover': {
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    Планировщик ВСК
                </Button>
            </Box>

            {/* Tabs */}
            <Paper elevation={2} sx={{ mb: 4 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="group details tabs"
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab icon={<Grade />} label="Журнал" />
                    <Tab icon={<People />} label="Посещаемость" />
                    <Tab icon={<Assignment />} label="Задания" />
                    <Tab icon={<LibraryBooks />} label="Библиотека" />
                    <Tab icon={<TrendingUp />} label="Рейтинг" />
                </Tabs>

                {/* Tab Panels */}
                <TabPanel value={tabValue} index={0}>
                    <GradebookTab />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <AttendanceTab />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <AssignmentsTab />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <LibraryTab />
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                    <RankingTab />
                </TabPanel>
            </Paper>

            {/* VSK Scheduler Dialog */}
            <VSKScheduler
                open={openVSKScheduler}
                onClose={() => setOpenVSKScheduler(false)}
                courseId={courseId}
                groupId={groupId}
            />
        </Container>
    );
};

const StyledAssignmentCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
}));

export default TeacherGroupDetails;