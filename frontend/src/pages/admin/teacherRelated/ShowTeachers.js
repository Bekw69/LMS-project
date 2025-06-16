import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import {
    Paper, 
    Table, 
    TableBody, 
    TableContainer,
    TableHead, 
    TablePagination, 
    Button, 
    Box, 
    IconButton,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    Tooltip,
    Avatar,
    TableCell,
    TableRow,
    Fab,
    Alert
} from '@mui/material';
import {
    PersonRemove as PersonRemoveIcon,
    PersonAddAlt1 as PersonAddAlt1Icon,
    Visibility as VisibilityIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    MenuBook as MenuBookIcon,
    Add as AddIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';

const ShowTeachers = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { teachersList, loading, error, response } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <Typography variant="h6">Загрузка учителей...</Typography>
                </Box>
            </Container>
        );
    }

    if (response) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Управление учителями
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Пока нет учителей в системе. Добавьте первого учителя!
                </Alert>
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <SchoolIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Добавить учителя
                        </Typography>
                        <Typography variant="body1" color="textSecondary" paragraph>
                            Начните с добавления учителей в вашу школу
                        </Typography>
                        <Button 
                            variant="contained" 
                            size="large"
                            startIcon={<PersonAddAlt1Icon />}
                            onClick={() => navigate("/Admin/teachers/chooseclass")}
                        >
                            Добавить учителя
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
                    Ошибка при загрузке учителей: {typeof error === 'string' ? error : error.message || 'Неизвестная ошибка'}
                </Alert>
            </Container>
        );
    }

    const deleteHandler = (deleteID, address) => {
        setMessage("Функция удаления временно отключена для безопасности.")
        setShowPopup(true)
    };

    // Статистика
    const totalTeachers = teachersList.length;
    const teachersWithSubjects = teachersList.filter(teacher => teacher.teachSubject).length;
    const teachersWithoutSubjects = totalTeachers - teachersWithSubjects;
    const uniqueClasses = [...new Set(teachersList.map(teacher => teacher.teachSclass.sclassName))].length;

    const rows = teachersList.map((teacher) => {
        return {
            name: teacher.name,
            teachSubject: teacher.teachSubject?.subName || null,
            teachSclass: teacher.teachSclass.sclassName,
            teachSclassID: teacher.teachSclass._id,
            id: teacher._id,
        };
    });

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Управление учителями
            </Typography>

            {/* Статистика */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" color="primary">
                                {totalTeachers}
                            </Typography>
                            <Typography variant="body2">Всего учителей</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <MenuBookIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="h4" color="success.main">
                                {teachersWithSubjects}
                            </Typography>
                            <Typography variant="body2">С предметами</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                            <Typography variant="h4" color="warning.main">
                                {teachersWithoutSubjects}
                            </Typography>
                            <Typography variant="body2">Без предметов</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                            <Typography variant="h4" color="info.main">
                                {uniqueClasses}
                            </Typography>
                            <Typography variant="body2">Классов</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Таблица учителей */}
            <Paper elevation={3}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6">Список учителей</Typography>
                </Box>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Учитель</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Предмет</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Класс</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => (
                                    <TableRow hover key={row.id}>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                                    {row.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {row.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {row.teachSubject ? (
                                                <Chip 
                                                    label={row.teachSubject} 
                                                    color="success" 
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    startIcon={<AddIcon />}
                                                    onClick={() => {
                                                        navigate(`/Admin/teachers/choosesubject/${row.teachSclassID}/${row.id}`)
                                                    }}
                                                >
                                                    Добавить предмет
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={row.teachSclass} 
                                                color="primary" 
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Просмотр профиля">
                                                <IconButton 
                                                    color="primary"
                                                    onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Удалить учителя">
                                                <IconButton 
                                                    color="error"
                                                    onClick={() => deleteHandler(row.id, "Teacher")}
                                                >
                                                    <PersonRemoveIcon />
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
                    count={rows.length}
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

            {/* Floating Action Button */}
            <Fab 
                color="primary" 
                aria-label="add teacher"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={() => navigate("/Admin/teachers/chooseclass")}
            >
                <PersonAddAlt1Icon />
            </Fab>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ShowTeachers