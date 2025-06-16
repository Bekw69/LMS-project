import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Paper, 
    Box, 
    Checkbox,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Alert,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    Report as ReportIcon,
    Person as PersonIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Warning as WarningIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { getAllComplains } from '../../../redux/complainRelated/complainHandle';

const SeeComplains = () => {
    const dispatch = useDispatch();
    const { complainsList, loading, error, response } = useSelector((state) => state.complain);
    const { currentUser } = useSelector(state => state.user)

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [resolvedComplaints, setResolvedComplaints] = useState(new Set());

    useEffect(() => {
        dispatch(getAllComplains(currentUser._id, "Complain"));
    }, [currentUser._id, dispatch]);

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <Typography variant="h6">Загрузка жалоб...</Typography>
                </Box>
            </Container>
        );
    }

    if (response) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Управление жалобами
                </Typography>
                <Alert severity="success" sx={{ mb: 3 }}>
                    Отлично! На данный момент нет активных жалоб.
                </Alert>
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Нет жалоб
                        </Typography>
                        <Typography variant="body1" color="textSecondary" paragraph>
                            В системе нет активных жалоб для рассмотрения
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Alert severity="error">
                    Ошибка при загрузке жалоб: {typeof error === 'string' ? error : error.message || 'Неизвестная ошибка'}
                </Alert>
            </Container>
        );
    }

    const handleResolveComplaint = (complainId) => {
        const newResolved = new Set(resolvedComplaints);
        if (newResolved.has(complainId)) {
            newResolved.delete(complainId);
        } else {
            newResolved.add(complainId);
        }
        setResolvedComplaints(newResolved);
    };

    // Статистика
    const totalComplaints = complainsList?.length || 0;
    const resolvedCount = resolvedComplaints.size;
    const pendingCount = totalComplaints - resolvedCount;
    const recentComplaints = complainsList?.filter(complain => {
        const complainDate = new Date(complain.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return complainDate >= weekAgo;
    }).length || 0;

    const complainRows = complainsList && complainsList.length > 0 && complainsList.map((complain) => {
        const date = new Date(complain.date);
        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
        const isResolved = resolvedComplaints.has(complain._id);
        const isRecent = date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        return {
            user: complain.user?.name || 'Неизвестный пользователь',
            complaint: complain.complaint,
            date: dateString,
            id: complain._id,
            isResolved,
            isRecent
        };
    });

    const getStatusColor = (isResolved, isRecent) => {
        if (isResolved) return 'success';
        if (isRecent) return 'error';
        return 'warning';
    };

    const getStatusLabel = (isResolved, isRecent) => {
        if (isResolved) return 'Решено';
        if (isRecent) return 'Новая';
        return 'В ожидании';
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Управление жалобами
            </Typography>

            {/* Статистика */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <ReportIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" color="primary">
                                {totalComplaints}
                            </Typography>
                            <Typography variant="body2">Всего жалоб</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="h4" color="success.main">
                                {resolvedCount}
                            </Typography>
                            <Typography variant="body2">Решенных</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                            <Typography variant="h4" color="warning.main">
                                {pendingCount}
                            </Typography>
                            <Typography variant="body2">В ожидании</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <WarningIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                            <Typography variant="h4" color="error.main">
                                {recentComplaints}
                            </Typography>
                            <Typography variant="body2">За неделю</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Таблица жалоб */}
            {Array.isArray(complainsList) && complainsList.length > 0 && (
                <Paper elevation={3}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6">Список жалоб</Typography>
                    </Box>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Пользователь</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Жалоба</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Дата</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {complainRows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => (
                                        <TableRow hover key={row.id}>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                        <PersonIcon />
                                                    </Avatar>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {row.user}
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
                                                    {row.complaint}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(row.date).toLocaleDateString('ru-RU')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={getStatusLabel(row.isResolved, row.isRecent)} 
                                                    color={getStatusColor(row.isResolved, row.isRecent)}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Просмотр жалобы">
                                                    <IconButton color="primary">
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={row.isResolved ? "Отметить как нерешенную" : "Отметить как решенную"}>
                                                    <Checkbox
                                                        checked={row.isResolved}
                                                        onChange={() => handleResolveComplaint(row.id)}
                                                        color="success"
                                                    />
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    <TablePagination
                        component="div"
                        count={complainRows.length}
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
        </Container>
    );
};

export default SeeComplains;