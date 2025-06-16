import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    Avatar,
    Chip,
    IconButton,
    Fade,
    Paper
} from '@mui/material';
import {
    Book,
    Group,
    Assignment,
    LibraryBooks,
    TrendingUp,
    ChevronRight,
    School
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const TeacherCoursesPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const [courses, setCourses] = useState([]);

    // Симуляция данных курсов (позже заменим на реальные данные из API)
    useEffect(() => {
        const mockCourses = [
            {
                id: 1,
                name: 'Frontend Development',
                code: 'FE-101',
                groups: [
                    { id: 1, name: 'Группа А', studentsCount: 25, color: '#4CAF50' },
                    { id: 2, name: 'Группа Б', studentsCount: 22, color: '#2196F3' }
                ],
                totalStudents: 47,
                assignments: 8,
                materials: 12,
                averageGrade: 4.2,
                nextClass: '2024-01-15 10:00'
            },
            {
                id: 2,
                name: 'JavaScript Advanced',
                code: 'JS-201',
                groups: [
                    { id: 3, name: 'Группа В', studentsCount: 18, color: '#FF9800' }
                ],
                totalStudents: 18,
                assignments: 6,
                materials: 9,
                averageGrade: 3.8,
                nextClass: '2024-01-16 14:00'
            },
            {
                id: 3,
                name: 'React Development',
                code: 'RC-301',
                groups: [
                    { id: 4, name: 'Группа Г', studentsCount: 20, color: '#9C27B0' },
                    { id: 5, name: 'Группа Д', studentsCount: 23, color: '#E91E63' }
                ],
                totalStudents: 43,
                assignments: 10,
                materials: 15,
                averageGrade: 4.5,
                nextClass: '2024-01-17 09:00'
            }
        ];
        setCourses(mockCourses);
    }, []);

    const handleGroupClick = (courseId, groupId) => {
        navigate(`/Teacher/course/${courseId}/group/${groupId}`);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>
                Мои курсы
            </Typography>

            <Grid container spacing={4}>
                {courses.map((course, index) => (
                    <Fade in={true} timeout={500 + index * 200} key={course.id}>
                        <Grid item xs={12} lg={6} xl={4}>
                            <StyledCourseCard elevation={6}>
                                <CourseHeader>
                                    <CourseAvatar>
                                        <School sx={{ fontSize: 40 }} />
                                    </CourseAvatar>
                                    <Box sx={{ ml: 2, flex: 1 }}>
                                        <Typography variant="h5" fontWeight="bold" color="white">
                                            {course.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                            Код: {course.code}
                                        </Typography>
                                    </Box>
                                </CourseHeader>

                                <CardContent sx={{ pt: 3 }}>
                                    <StatsContainer>
                                        <StatItem>
                                            <Group color="primary" />
                                            <Typography variant="h6">{course.totalStudents}</Typography>
                                            <Typography variant="caption">студентов</Typography>
                                        </StatItem>
                                        <StatItem>
                                            <Assignment color="secondary" />
                                            <Typography variant="h6">{course.assignments}</Typography>
                                            <Typography variant="caption">заданий</Typography>
                                        </StatItem>
                                        <StatItem>
                                            <LibraryBooks color="success" />
                                            <Typography variant="h6">{course.materials}</Typography>
                                            <Typography variant="caption">материалов</Typography>
                                        </StatItem>
                                        <StatItem>
                                            <TrendingUp color="warning" />
                                            <Typography variant="h6">{course.averageGrade}</Typography>
                                            <Typography variant="caption">средний балл</Typography>
                                        </StatItem>
                                    </StatsContainer>

                                    <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
                                        Группы:
                                    </Typography>

                                    <Grid container spacing={2}>
                                        {course.groups.map((group) => (
                                            <Grid item xs={12} sm={6} key={group.id}>
                                                <GroupCard
                                                    onClick={() => handleGroupClick(course.id, group.id)}
                                                    sx={{ 
                                                        borderLeft: `4px solid ${group.color}`,
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            transform: 'translateX(4px)',
                                                            boxShadow: 4
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight="bold">
                                                                {group.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {group.studentsCount} студентов
                                                            </Typography>
                                                        </Box>
                                                        <ChevronRight />
                                                    </Box>
                                                </GroupCard>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>

                                <CardActions sx={{ px: 3, pb: 3 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                                        Следующее занятие: {new Date(course.nextClass).toLocaleString('ru-RU')}
                                    </Typography>
                                </CardActions>
                            </StyledCourseCard>
                        </Grid>
                    </Fade>
                ))}
            </Grid>
        </Container>
    );
};

const StyledCourseCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[20],
    },
}));

const CourseHeader = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
}));

const CourseAvatar = styled(Avatar)(({ theme }) => ({
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
}));

const StatsContainer = styled(Box)({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginTop: '16px',
});

const StatItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(1),
    '& .MuiSvgIcon-root': {
        marginBottom: theme.spacing(1),
    },
    '& .MuiTypography-h6': {
        fontWeight: 'bold',
        margin: 0,
    },
    '& .MuiTypography-caption': {
        color: theme.palette.text.secondary,
    },
}));

const GroupCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    transition: 'all 0.2s ease-in-out',
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

export default TeacherCoursesPage; 