import React, { useEffect } from 'react';
import { 
    Container, 
    Grid, 
    Paper, 
    Typography, 
    Box, 
    Card, 
    CardContent,
    LinearProgress,
    Chip,
    Avatar
} from '@mui/material';
import {
    Person as PersonIcon,
    School as SchoolIcon,
    SupervisorAccount as TeacherIcon,
    AttachMoney as MoneyIcon,
    TrendingUp as TrendingUpIcon,
    Notifications as NotificationsIcon,
    Assignment as AssignmentIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector(state => state.user);

    const adminID = currentUser?._id;

    useEffect(() => {
        if (adminID) {
            dispatch(getAllStudents(adminID));
            dispatch(getAllSclasses(adminID, "Sclass"));
            dispatch(getAllTeachers(adminID));
        }
    }, [adminID, dispatch]);

    const numberOfStudents = studentsList?.length || 0;
    const numberOfClasses = sclassesList?.length || 0;
    const numberOfTeachers = teachersList?.length || 0;

    const statsCards = [
        {
            title: 'Всего студентов',
            value: numberOfStudents,
            icon: PersonIcon,
            color: 'primary',
            bgColor: 'rgba(25, 118, 210, 0.1)',
            trend: '+12%',
            subtitle: 'За этот месяц'
        },
        {
            title: 'Всего классов',
            value: numberOfClasses,
            icon: SchoolIcon,
            color: 'success',
            bgColor: 'rgba(46, 125, 50, 0.1)',
            trend: '+3%',
            subtitle: 'Активных классов'
        },
        {
            title: 'Всего учителей',
            value: numberOfTeachers,
            icon: TeacherIcon,
            color: 'info',
            bgColor: 'rgba(2, 136, 209, 0.1)',
            trend: '+8%',
            subtitle: 'Преподавательский состав'
        },
        {
            title: 'Сбор средств',
            value: 23000,
            icon: MoneyIcon,
            color: 'warning',
            bgColor: 'rgba(237, 108, 2, 0.1)',
            trend: '+15%',
            subtitle: 'В этом месяце',
            prefix: '$'
        }
    ];

    const quickActions = [
        {
            title: 'Управление расписанием',
            description: 'Создать и редактировать расписание',
            icon: ScheduleIcon,
            color: 'primary',
            path: '/Admin/schedule'
        },
        {
            title: 'Добавить объявление',
            description: 'Создать новое объявление',
            icon: NotificationsIcon,
            color: 'success',
            path: '/Admin/addnotice'
        },
        {
            title: 'Управление заданиями',
            description: 'Просмотр всех заданий',
            icon: AssignmentIcon,
            color: 'info',
            path: '/Admin/assignments'
        }
    ];

    const renderStatsCard = (card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
                elevation={0}
                sx={{ 
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                        borderColor: `${card.color}.main`
                    }
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Avatar 
                            sx={{ 
                                bgcolor: card.bgColor,
                                color: `${card.color}.main`,
                                width: 56,
                                height: 56
                            }}
                        >
                            <card.icon fontSize="large" />
                        </Avatar>
                        <Chip 
                            label={card.trend}
                            size="small"
                            color={card.color}
                            icon={<TrendingUpIcon />}
                            variant="outlined"
                        />
                    </Box>
                    
                    <Typography variant="h3" fontWeight="bold" color={`${card.color}.main`} mb={1}>
                        <CountUp 
                            start={0} 
                            end={card.value} 
                            duration={2.5} 
                            prefix={card.prefix || ''}
                        />
                    </Typography>
                    
                    <Typography variant="h6" fontWeight="medium" color="text.primary" mb={0.5}>
                        {card.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                        {card.subtitle}
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
    );

    const renderQuickAction = (action, index) => (
        <Grid item xs={12} md={4} key={index}>
            <Card 
                elevation={0}
                sx={{ 
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                        borderColor: `${action.color}.main`
                    }
                }}
            >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Avatar 
                        sx={{ 
                            bgcolor: `${action.color}.main`,
                            color: 'white',
                            width: 64,
                            height: 64,
                            mx: 'auto',
                            mb: 2
                        }}
                    >
                        <action.icon fontSize="large" />
                    </Avatar>
                    
                    <Typography variant="h6" fontWeight="bold" mb={1}>
                        {action.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                        {action.description}
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    Добро пожаловать, {currentUser?.name}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Обзор системы управления школой
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
                {statsCards.map((card, index) => renderStatsCard(card, index))}
            </Grid>

            {/* Quick Actions */}
            <Box mb={4}>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                    Быстрые действия
                </Typography>
                <Grid container spacing={3}>
                    {quickActions.map((action, index) => renderQuickAction(action, index))}
                </Grid>
            </Box>

            {/* Recent Activity & Notices */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" mb={3}>
                                <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Последние объявления
                                </Typography>
                            </Box>
                            <SeeNotice />
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} lg={4}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                Активность системы
                            </Typography>
                            <Box mb={2}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2">Посещаемость</Typography>
                                    <Typography variant="body2" fontWeight="bold">85%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4 }} />
                            </Box>
                            <Box mb={2}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2">Выполнение заданий</Typography>
                                    <Typography variant="body2" fontWeight="bold">92%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={92} color="success" sx={{ height: 8, borderRadius: 4 }} />
                            </Box>
                            <Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2">Активность учителей</Typography>
                                    <Typography variant="body2" fontWeight="bold">78%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={78} color="warning" sx={{ height: 8, borderRadius: 4 }} />
                            </Box>
                        </CardContent>
                    </Card>

                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                Быстрая статистика
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="body2">Новые студенты</Typography>
                                <Chip label="+5" size="small" color="success" />
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="body2">Активные задания</Typography>
                                <Chip label="12" size="small" color="primary" />
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Ожидающие заявки</Typography>
                                <Chip label="3" size="small" color="warning" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminHomePage;
