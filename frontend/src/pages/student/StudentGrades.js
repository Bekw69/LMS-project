import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Chip,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    TablePagination,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Tooltip
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGrades } from '../../redux/gradeRelated/gradeHandle';

const StudentGrades = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { gradesList, loading } = useSelector(state => state.grade);

    const [filters, setFilters] = useState({
        studentId: currentUser?._id,
        year: new Date().getFullYear(), // по умолчанию текущий год
        quarter: '' // по умолчанию все четверти
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchGrades(filters));
        }
    }, [dispatch, filters, currentUser]);

    // Группируем оценки по предметам
    const gradesBySubject = gradesList.reduce((acc, grade) => {
        const subjectName = grade.subject?.subName || 'Неизвестный предмет';
        if (!acc[subjectName]) {
            acc[subjectName] = {
                grades: [],
                sum: 0,
                count: 0
            };
        }
        acc[subjectName].grades.push(grade);
        acc[subjectName].sum += grade.gradeValue;
        acc[subjectName].count += 1;
        return acc;
    }, {});

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Мои оценки
                </Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Четверть</InputLabel>
                    <Select
                        value={filters.quarter}
                        label="Четверть"
                        onChange={(e) => setFilters(prev => ({ ...prev, quarter: e.target.value }))}
                    >
                        <MenuItem value="">Все четверти</MenuItem>
                        {[1, 2, 3, 4].map(q => <MenuItem key={q} value={q}>{q}-я четверть</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                {Object.entries(gradesBySubject).map(([subject, data]) => {
                    const average = data.count > 0 ? (data.sum / data.count).toFixed(2) : 'N/A';
                    return (
                        <Grid item xs={12} md={6} lg={4} key={subject}>
                            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
                                        <Typography variant="h6" component="h2">{subject}</Typography>
                                        <Box textAlign="right">
                                            <Typography variant="caption" display="block">Средний балл</Typography>
                                            <Typography variant="h5" color="primary">{average}</Typography>
                                        </Box>
                                    </Box>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Работа</TableCell>
                                                    <TableCell>Тип</TableCell>
                                                    <TableCell align="center">Оценка</TableCell>
                                                    <TableCell>Дата</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.grades.map(g => (
                                                    <TableRow key={g._id} hover>
                                                        <TableCell sx={{
                                                             whiteSpace: 'nowrap',
                                                             overflow: 'hidden',
                                                             textOverflow: 'ellipsis',
                                                             maxWidth: '120px'
                                                        }}>
                                                            <Tooltip title={g.assignmentTitle}>
                                                                <span>{g.assignmentTitle}</span>
                                                            </Tooltip>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip label={g.gradeType} size="small" />
                                                        </TableCell>
                                                        <TableCell align="center">{g.gradeValue}</TableCell>
                                                        <TableCell>{new Date(g.gradedDate).toLocaleDateString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                })}
                 {Object.keys(gradesBySubject).length === 0 && !loading && (
                    <Grid item xs={12}>
                        <Paper sx={{p: 3, textAlign: 'center'}}>
                            <Typography variant="h6">Оценок не найдено</Typography>
                            <Typography color="text.secondary">Попробуйте изменить фильтры или ожидайте, пока учитель выставит оценки.</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default StudentGrades; 