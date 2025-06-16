import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
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
    Delete as DeleteIcon,
    PostAdd as PostAddIcon,
    Visibility as VisibilityIcon,
    Assignment as AssignmentIcon,
    School as SchoolIcon,
    AccessTime as AccessTimeIcon,
    Add as AddIcon
} from '@mui/icons-material';
import Popup from '../../../components/Popup';

const ShowSubjects = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user)

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    }, [currentUser._id, dispatch]);

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <Typography variant="h6">Загрузка предметов...</Typography>
                </Box>
            </Container>
        );
    }

    if (response) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Управление предметами
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Пока нет предметов в системе. Добавьте первый предмет!
                </Alert>
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <AssignmentIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Добавить предмет
                        </Typography>
                        <Typography variant="body1" color="textSecondary" paragraph>
                            Начните с добавления предметов в вашу школу
                        </Typography>
                        <Button 
                            variant="contained" 
                            size="large"
                            startIcon={<PostAddIcon />}
                            onClick={() => navigate("/Admin/subjects/chooseclass")}
                        >
                            Добавить предмет
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
                    Ошибка при загрузке предметов: {typeof error === 'string' ? error : error.message || 'Неизвестная ошибка'}
                </Alert>
            </Container>
        );
    }

    const deleteHandler = (deleteID, address) => {
        setMessage("Функция удаления временно отключена для безопасности.")
        setShowPopup(true)
    }

    // Статистика
    const totalSubjects = subjectsList?.length || 0;
    const uniqueClasses = [...new Set(subjectsList?.map(subject => subject.sclassName?.sclassName))].length;
    const averageSessions = subjectsList?.length > 0 
        ? Math.round(subjectsList.reduce((sum, subject) => sum + (subject.sessions || 0), 0) / subjectsList.length)
        : 0;

    const subjectRows = subjectsList?.map((subject) => {
        return {
            subName: subject.subName,
            sessions: subject.sessions,
            sclassName: subject.sclassName?.sclassName || 'Не указан',
            sclassID: subject.sclassName?._id,
            id: subject._id,
        };
    }) || [];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Управление предметами
            </Typography>

            {/* Статистика */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" color="primary">
                                {totalSubjects}
                            </Typography>
                            <Typography variant="body2">Всего предметов</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="h4" color="success.main">
                                {uniqueClasses}
                            </Typography>
                            <Typography variant="body2">Классов с предметами</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AccessTimeIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                            <Typography variant="h4" color="info.main">
                                {averageSessions}
                            </Typography>
                            <Typography variant="body2">Среднее кол-во занятий</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                            <Typography variant="h4" color="warning.main">
                                {totalSubjects}
                            </Typography>
                            <Typography variant="body2">Активных предметов</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Таблица предметов */}
            {Array.isArray(subjectsList) && subjectsList.length > 0 && (
                <Paper elevation={3}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6">Список предметов</Typography>
                    </Box>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Предмет</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Занятий</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Класс</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subjectRows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => (
                                        <TableRow hover key={row.id}>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                        {row.subName.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {row.subName}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={`${row.sessions || 0} занятий`} 
                                                    color="info" 
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.sclassName} 
                                                    color="success" 
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Просмотр предмета">
                                                    <IconButton 
                                                        color="primary"
                                                        onClick={() => navigate(`/Admin/subjects/subject/${row.sclassID}/${row.id}`)}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Удалить предмет">
                                                    <IconButton 
                                                        color="error"
                                                        onClick={() => deleteHandler(row.id, "Subject")}
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
                        count={subjectRows.length}
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
                aria-label="add subject"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={() => navigate("/Admin/subjects/chooseclass")}
            >
                <PostAddIcon />
            </Fab>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ShowSubjects;