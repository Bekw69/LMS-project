import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Avatar,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button
} from '@mui/material';
import {
    EmojiEvents,
    TrendingUp,
    TrendingDown,
    Assignment,
    School,
    Person,
    Visibility,
    Sort
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StudentRanking = ({ groupId }) => {
    const [students, setStudents] = useState([]);
    const [sortBy, setSortBy] = useState('overall');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        // Симуляция загрузки данных студентов с расширенными метриками
        const mockStudents = [
            {
                id: 1,
                name: 'Александр Петров',
                email: 'a.petrov@example.com',
                avatar: null,
                overallScore: 92.5,
                attendanceRate: 95,
                assignmentsCompleted: 8,
                assignmentsTotal: 10,
                vsk1Score: 95,
                vsk2Score: 90,
                finalScore: null,
                improvementRate: 5.2,
                lastActivity: '2024-01-20T14:30:00',
                strengths: ['HTML/CSS', 'JavaScript'],
                weaknesses: ['React Hooks']
            },
            {
                id: 2,
                name: 'Мария Сидорова',
                email: 'm.sidorova@example.com',
                avatar: null,
                overallScore: 88.3,
                attendanceRate: 92,
                assignmentsCompleted: 9,
                assignmentsTotal: 10,
                vsk1Score: 88,
                vsk2Score: 85,
                finalScore: null,
                improvementRate: 3.1,
                lastActivity: '2024-01-19T16:45:00',
                strengths: ['CSS Grid', 'Responsive Design'],
                weaknesses: ['JavaScript ES6']
            },
            {
                id: 3,
                name: 'Дмитрий Козлов',
                email: 'd.kozlov@example.com',
                avatar: null,
                overallScore: 85.7,
                attendanceRate: 88,
                assignmentsCompleted: 7,
                assignmentsTotal: 10,
                vsk1Score: 82,
                vsk2Score: 89,
                finalScore: null,
                improvementRate: 8.4,
                lastActivity: '2024-01-21T10:15:00',
                strengths: ['Problem Solving', 'Debugging'],
                weaknesses: ['CSS Flexbox']
            },
            {
                id: 4,
                name: 'Елена Иванова',
                email: 'e.ivanova@example.com',
                avatar: null,
                overallScore: 83.2,
                attendanceRate: 90,
                assignmentsCompleted: 8,
                assignmentsTotal: 10,
                vsk1Score: 80,
                vsk2Score: 86,
                finalScore: null,
                improvementRate: -1.2,
                lastActivity: '2024-01-18T13:20:00',
                strengths: ['HTML Semantics'],
                weaknesses: ['JavaScript Functions', 'CSS Animations']
            },
            {
                id: 5,
                name: 'Максим Волков',
                email: 'm.volkov@example.com',
                avatar: null,
                overallScore: 79.8,
                attendanceRate: 85,
                assignmentsCompleted: 6,
                assignmentsTotal: 10,
                vsk1Score: 75,
                vsk2Score: 84,
                finalScore: null,
                improvementRate: 12.1,
                lastActivity: '2024-01-20T11:30:00',
                strengths: ['Learning Motivation'],
                weaknesses: ['HTML Forms', 'CSS Positioning']
            }
        ];

        setStudents(mockStudents);
    }, [groupId]);

    const sortedStudents = [...students].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'overall':
                aValue = a.overallScore;
                bValue = b.overallScore;
                break;
            case 'attendance':
                aValue = a.attendanceRate;
                bValue = b.attendanceRate;
                break;
            case 'assignments':
                aValue = (a.assignmentsCompleted / a.assignmentsTotal) * 100;
                bValue = (b.assignmentsCompleted / b.assignmentsTotal) * 100;
                break;
            case 'improvement':
                aValue = a.improvementRate;
                bValue = b.improvementRate;
                break;
            default:
                aValue = a.overallScore;
                bValue = b.overallScore;
        }

        if (sortOrder === 'desc') {
            return bValue - aValue;
        } else {
            return aValue - bValue;
        }
    });

    const getRankIcon = (index) => {
        switch (index) {
            case 0:
                return <EmojiEvents sx={{ color: '#FFD700' }} />;
            case 1:
                return <EmojiEvents sx={{ color: '#C0C0C0' }} />;
            case 2:
                return <EmojiEvents sx={{ color: '#CD7F32' }} />;
            default:
                return <Person />;
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'success';
        if (score >= 80) return 'info';
        if (score >= 70) return 'warning';
        return 'error';
    };

    const getImprovementTrend = (rate) => {
        if (rate > 0) {
            return <TrendingUp sx={{ color: '#4caf50' }} />;
        } else if (rate < 0) {
            return <TrendingDown sx={{ color: '#f44336' }} />;
        } else {
            return null;
        }
    };

    const topPerformers = sortedStudents.slice(0, 3);
    const averageScore = students.reduce((acc, student) => acc + student.overallScore, 0) / students.length;
    const averageAttendance = students.reduce((acc, student) => acc + student.attendanceRate, 0) / students.length;
    const completionRate = students.reduce((acc, student) => acc + (student.assignmentsCompleted / student.assignmentsTotal), 0) / students.length * 100;

    return (
        <Box>
            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <StatCard>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" color="primary">
                                        {averageScore.toFixed(1)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Средний балл группы
                                    </Typography>
                                </Box>
                                <School sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
                            </Box>
                        </CardContent>
                    </StatCard>
                </Grid>
                
                <Grid item xs={12} md={3}>
                    <StatCard>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" color="info.main">
                                        {averageAttendance.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Средняя посещаемость
                                    </Typography>
                                </Box>
                                <Person sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
                            </Box>
                        </CardContent>
                    </StatCard>
                </Grid>

                <Grid item xs={12} md={3}>
                    <StatCard>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" color="success.main">
                                        {completionRate.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Выполнение заданий
                                    </Typography>
                                </Box>
                                <Assignment sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
                            </Box>
                        </CardContent>
                    </StatCard>
                </Grid>

                <Grid item xs={12} md={3}>
                    <StatCard>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                                        {topPerformers.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Лидеров (≥90%)
                                    </Typography>
                                </Box>
                                <EmojiEvents sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
                            </Box>
                        </CardContent>
                    </StatCard>
                </Grid>
            </Grid>

            {/* Top Performers */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmojiEvents sx={{ color: '#FFD700' }} />
                        Топ-3 студента
                    </Typography>
                    <Grid container spacing={2}>
                        {topPerformers.map((student, index) => (
                            <Grid item xs={12} md={4} key={student.id}>
                                <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                                    <Box display="flex" justifyContent="center" mb={1}>
                                        {getRankIcon(index)}
                                    </Box>
                                    <Avatar sx={{ width: 50, height: 50, mx: 'auto', mb: 1 }}>
                                        {student.name.charAt(0)}
                                    </Avatar>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {student.name}
                                    </Typography>
                                    <Chip
                                        label={`${student.overallScore.toFixed(1)}%`}
                                        color={getScoreColor(student.overallScore)}
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* Controls */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                    Полный рейтинг ({students.length} студентов)
                </Typography>
                <Box display="flex" gap={2}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Сортировать по</InputLabel>
                        <Select
                            value={sortBy}
                            label="Сортировать по"
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <MenuItem value="overall">Общий балл</MenuItem>
                            <MenuItem value="attendance">Посещаемость</MenuItem>
                            <MenuItem value="assignments">Выполнение заданий</MenuItem>
                            <MenuItem value="improvement">Улучшение</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        startIcon={<Sort />}
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    >
                        {sortOrder === 'desc' ? 'По убыванию' : 'По возрастанию'}
                    </Button>
                </Box>
            </Box>

            {/* Ranking Table */}
            <TableContainer component={Paper} variant="outlined">
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Место</TableCell>
                            <TableCell>Студент</TableCell>
                            <TableCell align="center">Общий балл</TableCell>
                            <TableCell align="center">Посещаемость</TableCell>
                            <TableCell align="center">Задания</TableCell>
                            <TableCell align="center">ВСК1</TableCell>
                            <TableCell align="center">ВСК2</TableCell>
                            <TableCell align="center">Тенденция</TableCell>
                            <TableCell align="center">Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedStudents.map((student, index) => (
                            <StyledTableRow key={student.id} hover>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        {getRankIcon(index)}
                                        <Typography variant="h6" fontWeight="bold">
                                            {index + 1}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar>{student.name.charAt(0)}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {student.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {student.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>

                                <TableCell align="center">
                                    <Chip
                                        label={`${student.overallScore.toFixed(1)}%`}
                                        color={getScoreColor(student.overallScore)}
                                        variant="filled"
                                    />
                                </TableCell>

                                <TableCell align="center">
                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            {student.attendanceRate}%
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={student.attendanceRate}
                                            color={student.attendanceRate >= 85 ? 'success' : student.attendanceRate >= 70 ? 'warning' : 'error'}
                                            sx={{ height: 6, borderRadius: 3 }}
                                        />
                                    </Box>
                                </TableCell>

                                <TableCell align="center">
                                    <Typography variant="body2">
                                        {student.assignmentsCompleted}/{student.assignmentsTotal}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ({((student.assignmentsCompleted / student.assignmentsTotal) * 100).toFixed(0)}%)
                                    </Typography>
                                </TableCell>

                                <TableCell align="center">
                                    <Chip
                                        label={student.vsk1Score || 'Не сдано'}
                                        color={student.vsk1Score ? getScoreColor(student.vsk1Score) : 'default'}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>

                                <TableCell align="center">
                                    <Chip
                                        label={student.vsk2Score || 'Не сдано'}
                                        color={student.vsk2Score ? getScoreColor(student.vsk2Score) : 'default'}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>

                                <TableCell align="center">
                                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                        {getImprovementTrend(student.improvementRate)}
                                        <Typography variant="body2" color={student.improvementRate > 0 ? 'success.main' : student.improvementRate < 0 ? 'error.main' : 'text.secondary'}>
                                            {student.improvementRate > 0 ? '+' : ''}{student.improvementRate.toFixed(1)}%
                                        </Typography>
                                    </Box>
                                </TableCell>

                                <TableCell align="center">
                                    <Tooltip title="Просмотр профиля">
                                        <IconButton size="small" color="primary">
                                            <Visibility />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

const StatCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

export default StudentRanking; 