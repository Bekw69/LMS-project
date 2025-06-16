import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Grid, Button, IconButton, Tooltip,
    TextField, MenuItem, Table, TableHead, TableBody, TableCell, TableRow,
    Paper, Select, InputLabel, FormControl, Accordion, AccordionSummary,
    AccordionDetails, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import {
    Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGrades, createGrade, updateGrade, deleteGrade } from '../../redux/gradeRelated/gradeHandle';
import { getClassStudents } from '../../redux/sclassRelated/sclassHandle';

// Скелет TeacherGradeBook – добавление/редактирование оценок
const TeacherGradeBook = () => {
    const dispatch = useDispatch();
    const { gradesList, loading } = useSelector(state => state.grade);
    const { currentUser } = useSelector(state => state.user);
    const { sclassStudents } = useSelector(state => state.sclass);

    const [filters, setFilters] = useState({
        classId: currentUser?.teachSclass?._id || '',
        subjectId: currentUser?.teachSubject?._id || '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState(null); // null – новая, object – редактируемая

    useEffect(() => {
        if (filters.classId) {
            dispatch(getClassStudents(filters.classId));
        }
    }, [dispatch, filters.classId]);

    useEffect(() => {
        if (filters.classId && filters.subjectId) {
            dispatch(fetchGrades({ classId: filters.classId, subjectId: filters.subjectId }));
        }
    }, [filters, dispatch]);

    const handleOpenModal = (grade = null, studentId = null) => {
        if (grade) {
            setEditingGrade(grade);
        } else {
            setEditingGrade({
                student: studentId,
                gradeValue: '',
                gradeType: 'classwork',
                assignmentTitle: '',
                gradedDate: new Date().toISOString().split('T')[0]
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGrade(null);
    };

    const handleSave = () => {
        if (!editingGrade) return;

        const gradeData = {
            ...editingGrade,
            school: currentUser.school,
            class: filters.classId,
            subject: filters.subjectId,
            teacher: currentUser._id,
        };
        
        if (editingGrade._id) {
            dispatch(updateGrade(editingGrade._id, gradeData));
        } else {
            dispatch(createGrade(gradeData));
        }
        handleCloseModal();
    };

    const handleDelete = (id) => {
        dispatch(deleteGrade(id, { classId: filters.classId, subjectId: filters.subjectId }));
    };

    const gradesByStudent = gradesList.reduce((acc, grade) => {
        const studentId = grade.student?._id;
        if (!studentId) return acc;
        if (!acc[studentId]) {
            acc[studentId] = [];
        }
        acc[studentId].push(grade);
        return acc;
    }, {});
    
    const gradeTypes = ['homework', 'classwork', 'test', 'exam', 'project', 'participation', 'quiz'];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Журнал: {currentUser?.teachSclass?.sclassName} - {currentUser?.teachSubject?.subName}
                </Typography>
            </Box>

            <Paper elevation={3} sx={{ p: 2 }}>
                {sclassStudents.length > 0 ? (
                    sclassStudents.map(student => (
                        <Accordion key={student._id} sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="h6">{student.name}</Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenModal(null, student._id);
                                        }}
                                    >
                                        Оценка
                                    </Button>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                {gradesByStudent[student._id] && gradesByStudent[student._id].length > 0 ? (
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Дата</TableCell>
                                                <TableCell>Работа</TableCell>
                                                <TableCell>Тип</TableCell>
                                                <TableCell align="center">Оценка</TableCell>
                                                <TableCell align="right">Действия</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {gradesByStudent[student._id].map(g => (
                                                <TableRow hover key={g._id}>
                                                    <TableCell>{new Date(g.gradedDate).toLocaleDateString()}</TableCell>
                                                    <TableCell>{g.assignmentTitle}</TableCell>
                                                    <TableCell>{g.gradeType}</TableCell>
                                                    <TableCell align="center">{g.gradeValue}</TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Редактировать">
                                                            <IconButton size="small" onClick={() => handleOpenModal(g)}>
                                                                <EditIcon fontSize="small"/>
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Удалить">
                                                            <IconButton size="small" color="error" onClick={() => handleDelete(g._id)}>
                                                                <DeleteIcon fontSize="small"/>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                        Оценок по этому предмету пока нет.
                                    </Typography>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    ))
                ) : (
                    <Typography>В этом классе нет студентов.</Typography>
                )}
            </Paper>

            {/* Модальное окно для добавления/редактирования */}
            <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
                <DialogTitle>{editingGrade?._id ? 'Редактировать оценку' : 'Новая оценка'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Название работы"
                        fullWidth
                        variant="outlined"
                        value={editingGrade?.assignmentTitle || ''}
                        onChange={(e) => setEditingGrade(prev => ({ ...prev, assignmentTitle: e.target.value }))}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Оценка (1-5)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editingGrade?.gradeValue || ''}
                        onChange={(e) => setEditingGrade(prev => ({ ...prev, gradeValue: e.target.value }))}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Тип работы</InputLabel>
                        <Select
                            label="Тип работы"
                            value={editingGrade?.gradeType || 'classwork'}
                            onChange={(e) => setEditingGrade(prev => ({ ...prev, gradeType: e.target.value }))}
                        >
                            {gradeTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseModal}>Отмена</Button>
                    <Button onClick={handleSave} variant="contained">Сохранить</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TeacherGradeBook; 