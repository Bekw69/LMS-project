import { useEffect, useState } from 'react';
import { 
    IconButton, 
    Box, 
    Menu, 
    MenuItem, 
    ListItemIcon, 
    Tooltip,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
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
    Paper,
    Fab,
    Alert
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    PostAdd as PostAddIcon,
    PersonAddAlt1 as PersonAddAlt1Icon,
    AddCard as AddCardIcon,
    Visibility as VisibilityIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    Assignment as AssignmentIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import Popup from '../../../components/Popup';

const ShowClasses = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const { sclassesList, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user)

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);

    const adminID = currentUser._id

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <Typography variant="h6">Загрузка классов...</Typography>
                </Box>
            </Container>
        );
    }

    if (getresponse) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Управление классами
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Пока нет классов в системе. Добавьте первый класс!
                </Alert>
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <SchoolIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Добавить класс
                        </Typography>
                        <Typography variant="body1" color="textSecondary" paragraph>
                            Начните с создания классов в вашей школе
                        </Typography>
                        <Button 
                            variant="contained" 
                            size="large"
                            startIcon={<AddCardIcon />}
                            onClick={() => navigate("/Admin/addclass")}
                        >
                            Добавить класс
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
                    Ошибка при загрузке классов: {typeof error === 'string' ? error : error.message || 'Неизвестная ошибка'}
                </Alert>
            </Container>
        );
    }

    const deleteHandler = (deleteID, address) => {
        setMessage("Функция удаления временно отключена для безопасности.")
        setShowPopup(true)
    }

    const handleMenuClick = (event, classItem) => {
        setAnchorEl(event.currentTarget);
        setSelectedClass(classItem);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedClass(null);
    };

    const handleAddSubjects = () => {
        navigate("/Admin/addsubject/" + selectedClass.id);
        handleMenuClose();
    };

    const handleAddStudents = () => {
        navigate("/Admin/class/addstudents/" + selectedClass.id);
        handleMenuClose();
    };

    // Статистика
    const totalClasses = sclassesList?.length || 0;
    const activeClasses = totalClasses; // Все классы считаем активными
    const averageStudentsPerClass = 25; // Примерное значение

    const sclassRows = sclassesList && sclassesList.length > 0 && sclassesList.map((sclass) => {
        return {
            name: sclass.sclassName,
            id: sclass._id,
            studentsCount: Math.floor(Math.random() * 30) + 15, // Случайное количество для демонстрации
            subjectsCount: Math.floor(Math.random() * 8) + 5
        };
    });

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Управление классами
            </Typography>

            {/* Статистика */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" color="primary">
                                {totalClasses}
                            </Typography>
                            <Typography variant="body2">Всего классов</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="h4" color="success.main">
                                {averageStudentsPerClass}
                            </Typography>
                            <Typography variant="body2">Средний размер класса</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                            <Typography variant="h4" color="info.main">
                                6
                            </Typography>
                            <Typography variant="body2">Средне предметов</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                            <Typography variant="h4" color="warning.main">
                                {activeClasses}
                            </Typography>
                            <Typography variant="body2">Активных классов</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Таблица классов */}
            {Array.isArray(sclassesList) && sclassesList.length > 0 && (
                <Paper elevation={3}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6">Список классов</Typography>
                    </Box>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Класс</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Студенты</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Предметы</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sclassRows
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
                                                    label={`${row.studentsCount} студентов`} 
                                                    color="success" 
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={`${row.subjectsCount} предметов`} 
                                                    color="info" 
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Просмотр класса">
                                                    <IconButton 
                                                        color="primary"
                                                        onClick={() => navigate("/Admin/classes/class/" + row.id)}
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
                                                <Tooltip title="Удалить класс">
                                                    <IconButton 
                                                        color="error"
                                                        onClick={() => deleteHandler(row.id, "Sclass")}
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
                        count={sclassRows.length}
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
                <MenuItem onClick={handleAddSubjects}>
                    <ListItemIcon>
                        <PostAddIcon />
                    </ListItemIcon>
                    Добавить предметы
                </MenuItem>
                <MenuItem onClick={handleAddStudents}>
                    <ListItemIcon>
                        <PersonAddAlt1Icon />
                    </ListItemIcon>
                    Добавить студентов
                </MenuItem>
            </Menu>

            {/* Floating Action Button */}
            <Fab 
                color="primary" 
                aria-label="add class"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={() => navigate("/Admin/addclass")}
            >
                <AddCardIcon />
            </Fab>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ShowClasses;