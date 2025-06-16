    import React, { useEffect, useState } from 'react';
    import { useDispatch, useSelector } from 'react-redux';
    import { useNavigate } from "react-router-dom";
    import {
        Paper, 
        Box, 
        IconButton,
        Container,
        Typography,
        Grid,
        Card,
        CardContent,
        Button,
        Chip,
        Avatar,
        Table,
        TableBody,
        TableCell,
        TableContainer,
        TableHead,
        TableRow,
        TablePagination,
        Fab,
        Alert,
        Tooltip
    } from '@mui/material';
    import {
        NoteAdd as NoteAddIcon,
        Delete as DeleteIcon,
        Notifications as NotificationsIcon,
        CalendarToday as CalendarTodayIcon,
        Visibility as VisibilityIcon,
        TrendingUp as TrendingUpIcon
    } from '@mui/icons-material';
    import { getAllNotices } from '../../../redux/noticeRelated/noticeHandle';
    import { deleteUser } from '../../../redux/userRelated/userHandle';

    const ShowNotices = () => {
        const navigate = useNavigate()
        const dispatch = useDispatch();
        const { noticesList, loading, error, response } = useSelector((state) => state.notice);
        const { currentUser } = useSelector(state => state.user)

        const [page, setPage] = useState(0);
        const [rowsPerPage, setRowsPerPage] = useState(10);

        useEffect(() => {
            dispatch(getAllNotices(currentUser._id, "Notice"));
        }, [currentUser._id, dispatch]);

        if (loading) {
            return (
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <Typography variant="h6">Загрузка объявлений...</Typography>
                    </Box>
                </Container>
            );
        }

        if (response) {
            return (
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Управление объявлениями
                    </Typography>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Пока нет объявлений в системе. Добавьте первое объявление!
                    </Alert>
                    <Card sx={{ textAlign: 'center', py: 4 }}>
                        <CardContent>
                            <NotificationsIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h5" gutterBottom>
                                Добавить объявление
                            </Typography>
                            <Typography variant="body1" color="textSecondary" paragraph>
                                Начните с создания объявлений для вашей школы
                            </Typography>
                            <Button 
                                variant="contained" 
                                size="large"
                                startIcon={<NoteAddIcon />}
                                onClick={() => navigate("/Admin/addnotice")}
                            >
                                Добавить объявление
                            </Button>
                        </CardContent>
                    </Card>
                </Container>
            );
        }

        if (error) {
            return (
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Alert severity="error">
                        Ошибка при загрузке объявлений: {typeof error === 'string' ? error : error.message || 'Неизвестная ошибка'}
                    </Alert>
                </Container>
            );
        }

        const deleteHandler = (deleteID, address) => {
            dispatch(deleteUser(deleteID, address))
                .then(() => {
                    dispatch(getAllNotices(currentUser._id, "Notice"));
                })
        }

        // Статистика
        const totalNotices = noticesList?.length || 0;
        const recentNotices = noticesList?.filter(notice => {
            const noticeDate = new Date(notice.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return noticeDate >= weekAgo;
        }).length || 0;

        const thisMonthNotices = noticesList?.filter(notice => {
            const noticeDate = new Date(notice.date);
            const now = new Date();
            return noticeDate.getMonth() === now.getMonth() && noticeDate.getFullYear() === now.getFullYear();
        }).length || 0;

        const noticeRows = noticesList && noticesList.length > 0 && noticesList.map((notice) => {
            const date = new Date(notice.date);
            const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
            const isRecent = date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            return {
                title: notice.title,
                details: notice.details,
                date: dateString,
                id: notice._id,
                isRecent
            };
        });

        const getPriorityColor = (isRecent) => {
            return isRecent ? 'error' : 'default';
        };

        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Управление объявлениями
                </Typography>

                {/* Статистика */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <NotificationsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h4" color="primary">
                                    {totalNotices}
                                </Typography>
                                <Typography variant="body2">Всего объявлений</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                <Typography variant="h4" color="success.main">
                                    {recentNotices}
                                </Typography>
                                <Typography variant="body2">За последнюю неделю</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <CalendarTodayIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                                <Typography variant="h4" color="info.main">
                                    {thisMonthNotices}
                                </Typography>
                                <Typography variant="body2">В этом месяце</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <NotificationsIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                                <Typography variant="h4" color="warning.main">
                                    {totalNotices}
                                </Typography>
                                <Typography variant="body2">Активных объявлений</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Таблица объявлений */}
                {Array.isArray(noticesList) && noticesList.length > 0 && (
                    <Paper elevation={3}>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="h6">Список объявлений</Typography>
                        </Box>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Заголовок</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Описание</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Дата</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Действия</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {noticeRows
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row) => (
                                            <TableRow hover key={row.id}>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                            {row.title.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {row.title}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            maxWidth: 300,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {row.details}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {new Date(row.date).toLocaleDateString('ru-RU')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={row.isRecent ? 'Новое' : 'Обычное'} 
                                                        color={getPriorityColor(row.isRecent)}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Просмотр объявления">
                                                        <IconButton color="primary">
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Удалить объявление">
                                                        <IconButton 
                                                            color="error"
                                                            onClick={() => deleteHandler(row.id, "Notice")}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        
                        <TablePagination
                            component="div"
                            count={noticeRows.length}
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(0);
                            }}
                            labelRowsPerPage="Строк на странице:"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
                        />
                    </Paper>
                )}

                {/* Floating Action Button */}
                <Fab 
                    color="primary" 
                    aria-label="add notice"
                    sx={{ position: 'fixed', bottom: 16, right: 16 }}
                    onClick={() => navigate("/Admin/addnotice")}
                >
                    <NoteAddIcon />
                </Fab>
            </Container>
        );
    };

    export default ShowNotices;