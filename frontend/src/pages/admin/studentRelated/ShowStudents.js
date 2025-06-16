import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
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
    Chip,
    Tooltip,
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
    Menu,
    MenuItem,
    Button
} from '@mui/material';
import {
    PersonRemove as PersonRemoveIcon,
    PersonAddAlt1 as PersonAddAlt1Icon,
    Visibility as VisibilityIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    MoreVert as MoreVertIcon,
    EventNote as EventNoteIcon,
    Grade as GradeIcon
} from '@mui/icons-material';
import Popup from '../../../components/Popup';
import * as React from 'react';

const ShowStudents = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user)

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [showPopup, setShowPopup] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedStudent, setSelectedStudent] = React.useState(null);

    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
    }, [currentUser._id, dispatch]);

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <Typography variant="h6">Загрузка студентов...</Typography>
                </Box>
            </Container>
        );
    }

    if (response) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Управление студентами
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Пока нет студентов в системе. Добавьте первого студента!
                </Alert>
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <PersonIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Добавить студента
                        </Typography>
                        <Typography variant="body1" color="textSecondary" paragraph>
                            Начните с добавления студентов в вашу школу
                        </Typography>
                        <Button 
                            variant="contained" 
                            size="large"
                            startIcon={<PersonAddAlt1Icon />}
                            onClick={() => navigate("/Admin/addstudents")}
                        >
                            Добавить студента
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
                    Ошибка при загрузке студентов: {typeof error === 'string' ? error : error.message || 'Неизвестная ошибка'}
                </Alert>
            </Container>
        );
    }

    const deleteHandler = (deleteID, address) => {
        setMessage("Функция удаления временно отключена для безопасности.")
        setShowPopup(true)
    }

    const handleMenuClick = (event, student) => {
        setAnchorEl(event.currentTarget);
        setSelectedStudent(student);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedStudent(null);
    };

    const handleAttendance = () => {
        navigate("/Admin/students/student/attendance/" + selectedStudent.id);
        handleMenuClose();
    };

    const handleMarks = () => {
        navigate("/Admin/students/student/marks/" + selectedStudent.id);
        handleMenuClose();
    };

    // Статистика
    const totalStudents = studentsList?.length || 0;
    const uniqueClasses = studentsList ? [...new Set(studentsList.map(student => student.sclassName.sclassName))].length : 0;
    const averageRollNum = studentsList?.length > 0 ? Math.round(studentsList.reduce((sum, student) => sum + student.rollNum, 0) / studentsList.length) : 0;

    const studentRows = studentsList && studentsList.length > 0 && studentsList.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            sclassName: student.sclassName.sclassName,
            id: student._id,
        };
    });

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Управление студентами
            </Typography>

            {/* Статистика */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" color="primary">
                                {totalStudents}
                            </Typography>
                            <Typography variant="body2">Всего студентов</Typography>
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
                            <Typography variant="body2">Классов</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                            <Typography variant="h4" color="info.main">
                                {averageRollNum}
                            </Typography>
                            <Typography variant="body2">Средний номер</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <CheckCircleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                            <Typography variant="h4" color="warning.main">
                                {totalStudents}
                            </Typography>
                            <Typography variant="body2">Активных</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Таблица студентов */}
            {Array.isArray(studentsList) && studentsList.length > 0 && (
                <Paper elevation={3}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6">Список студентов</Typography>
                    </Box>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Студент</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Номер</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Класс</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentRows
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
                                                <Chip 
                                                    label={`#${row.rollNum}`} 
                                                    color="primary" 
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
                                                <Tooltip title="Просмотр профиля">
                                                    <IconButton 
                                                        color="primary"
                                                        onClick={() => navigate("/Admin/students/student/" + row.id)}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Дополнительные действия">
                                                    <IconButton 
                                                        onClick={(e) => handleMenuClick(e, row)}
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Удалить студента">
                                                    <IconButton 
                                                        color="error"
                                                        onClick={() => deleteHandler(row.id, "Student")}
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
                        count={studentRows.length}
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

            {/* Меню действий */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleAttendance}>
                    <EventNoteIcon sx={{ mr: 1 }} />
                    Отметить посещаемость
                </MenuItem>
                <MenuItem onClick={handleMarks}>
                    <GradeIcon sx={{ mr: 1 }} />
                    Поставить оценки
                </MenuItem>
            </Menu>

            {/* Floating Action Button */}
            <Fab 
                color="primary" 
                aria-label="add student"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={() => navigate("/Admin/addstudents")}
            >
                <PersonAddAlt1Icon />
            </Fab>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ShowStudents;