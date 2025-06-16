import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Schedule,
    Assignment,
    CheckCircle,
    PlayArrow
} from '@mui/icons-material';

const VSKScheduler = ({ open, onClose, courseId, groupId }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [schedule, setSchedule] = useState({
        courseName: '',
        groupName: '',
        vsk1: {
            startDate: '',
            endDate: '',
            duration: 90,
            description: ''
        },
        vsk2: {
            startDate: '',
            endDate: '',
            duration: 90,
            description: ''
        },
        final: {
            startDate: '',
            endDate: '',
            duration: 120,
            description: ''
        }
    });
    const [baseAssignments, setBaseAssignments] = useState([]);
    const [selectedBaseAssignment, setSelectedBaseAssignment] = useState('');

    const steps = [
        'Выбор базового задания',
        'Настройка расписания',
        'Подтверждение'
    ];

    useEffect(() => {
        if (open) {
            // Загружаем базовые задания для копирования
            const mockBaseAssignments = [
                {
                    id: 1,
                    title: 'ВСК 1 - HTML/CSS Основы (Шаблон)',
                    description: 'Базовый тест по HTML и CSS',
                    questionsCount: 20,
                    duration: 90,
                    points: 100
                },
                {
                    id: 2,
                    title: 'ВСК 1 - JavaScript Basics (Шаблон)',
                    description: 'Базовый тест по основам JavaScript',
                    questionsCount: 15,
                    duration: 60,
                    points: 75
                }
            ];
            setBaseAssignments(mockBaseAssignments);
            
            // Устанавливаем информацию о курсе и группе
            setSchedule(prev => ({
                ...prev,
                courseName: 'Frontend Development',
                groupName: 'Группа А'
            }));
        }
    }, [open, courseId, groupId]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleDateChange = (type, field, value) => {
        setSchedule(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };

    const handleFieldChange = (type, field, value) => {
        setSchedule(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };

    const validateSchedule = () => {
        // Проверяем что все даты заполнены и корректны
        const { vsk1, vsk2, final } = schedule;
        
        if (!vsk1.startDate || !vsk1.endDate || !vsk2.startDate || !vsk2.endDate || !final.startDate || !final.endDate) {
            return false;
        }

        // Проверяем что ВСК2 после ВСК1, а финал после ВСК2
        if (new Date(vsk2.startDate) <= new Date(vsk1.endDate) || new Date(final.startDate) <= new Date(vsk2.endDate)) {
            return false;
        }

        return true;
    };

    const handleCreateSchedule = () => {
        if (!selectedBaseAssignment || !validateSchedule()) return;

        // Здесь будет логика создания автоматического расписания
        console.log('Creating VSK schedule:', {
            baseAssignment: selectedBaseAssignment,
            schedule,
            courseId,
            groupId
        });

        onClose();
        setActiveStep(0);
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Выберите базовое задание для копирования
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Выбранное задание будет использовано как шаблон для создания ВСК 1, ВСК 2 и финального теста
                        </Typography>

                        <Grid container spacing={2}>
                            {baseAssignments.map((assignment) => (
                                <Grid item xs={12} key={assignment.id}>
                                    <Card 
                                        variant={selectedBaseAssignment === assignment.id ? "outlined" : "elevation"}
                                        sx={{ 
                                            cursor: 'pointer',
                                            border: selectedBaseAssignment === assignment.id ? 2 : 1,
                                            borderColor: selectedBaseAssignment === assignment.id ? 'primary.main' : 'divider'
                                        }}
                                        onClick={() => setSelectedBaseAssignment(assignment.id)}
                                    >
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                <Box>
                                                    <Typography variant="h6" gutterBottom>
                                                        {assignment.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                        {assignment.description}
                                                    </Typography>
                                                    <Box display="flex" gap={1}>
                                                        <Chip label={`${assignment.questionsCount} вопросов`} size="small" />
                                                        <Chip label={`${assignment.duration} мин`} size="small" />
                                                        <Chip label={`${assignment.points} баллов`} size="small" />
                                                    </Box>
                                                </Box>
                                                {selectedBaseAssignment === assignment.id && (
                                                    <CheckCircle color="primary" />
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                );

            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Настройка расписания ВСК
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Настройте даты и время проведения всех контрольных работ
                        </Typography>

                        <Grid container spacing={3}>
                            {/* ВСК 1 */}
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="primary">
                                            ВСК 1
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Дата и время начала"
                                                    type="datetime-local"
                                                    value={schedule.vsk1.startDate}
                                                    onChange={(e) => handleDateChange('vsk1', 'startDate', e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Дата и время окончания"
                                                    type="datetime-local"
                                                    value={schedule.vsk1.endDate}
                                                    onChange={(e) => handleDateChange('vsk1', 'endDate', e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Продолжительность (минуты)"
                                                    type="number"
                                                    value={schedule.vsk1.duration}
                                                    onChange={(e) => handleFieldChange('vsk1', 'duration', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Описание"
                                                    multiline
                                                    rows={2}
                                                    value={schedule.vsk1.description}
                                                    onChange={(e) => handleFieldChange('vsk1', 'description', e.target.value)}
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* ВСК 2 */}
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="secondary">
                                            ВСК 2
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Дата и время начала"
                                                    type="datetime-local"
                                                    value={schedule.vsk2.startDate}
                                                    onChange={(e) => handleDateChange('vsk2', 'startDate', e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Дата и время окончания"
                                                    type="datetime-local"
                                                    value={schedule.vsk2.endDate}
                                                    onChange={(e) => handleDateChange('vsk2', 'endDate', e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Продолжительность (минуты)"
                                                    type="number"
                                                    value={schedule.vsk2.duration}
                                                    onChange={(e) => handleFieldChange('vsk2', 'duration', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Описание"
                                                    multiline
                                                    rows={2}
                                                    value={schedule.vsk2.description}
                                                    onChange={(e) => handleFieldChange('vsk2', 'description', e.target.value)}
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Финальный тест */}
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="error">
                                            Финальный тест
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Дата и время начала"
                                                    type="datetime-local"
                                                    value={schedule.final.startDate}
                                                    onChange={(e) => handleDateChange('final', 'startDate', e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Дата и время окончания"
                                                    type="datetime-local"
                                                    value={schedule.final.endDate}
                                                    onChange={(e) => handleDateChange('final', 'endDate', e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Продолжительность (минуты)"
                                                    type="number"
                                                    value={schedule.final.duration}
                                                    onChange={(e) => handleFieldChange('final', 'duration', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Описание"
                                                    multiline
                                                    rows={2}
                                                    value={schedule.final.description}
                                                    onChange={(e) => handleFieldChange('final', 'description', e.target.value)}
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Подтверждение создания расписания
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Проверьте правильность настроек перед созданием автоматического расписания
                        </Typography>

                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Тип контроля</TableCell>
                                        <TableCell>Начало</TableCell>
                                        <TableCell>Окончание</TableCell>
                                        <TableCell>Продолжительность</TableCell>
                                        <TableCell>Описание</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <Chip label="ВСК 1" color="primary" />
                                        </TableCell>
                                        <TableCell>
                                            {schedule.vsk1.startDate ? 
                                                new Date(schedule.vsk1.startDate).toLocaleString('ru-RU') : 
                                                'Не указано'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {schedule.vsk1.endDate ? 
                                                new Date(schedule.vsk1.endDate).toLocaleString('ru-RU') : 
                                                'Не указано'
                                            }
                                        </TableCell>
                                        <TableCell>{schedule.vsk1.duration} мин</TableCell>
                                        <TableCell>{schedule.vsk1.description || 'Без описания'}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <Chip label="ВСК 2" color="secondary" />
                                        </TableCell>
                                        <TableCell>
                                            {schedule.vsk2.startDate ? 
                                                new Date(schedule.vsk2.startDate).toLocaleString('ru-RU') : 
                                                'Не указано'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {schedule.vsk2.endDate ? 
                                                new Date(schedule.vsk2.endDate).toLocaleString('ru-RU') : 
                                                'Не указано'
                                            }
                                        </TableCell>
                                        <TableCell>{schedule.vsk2.duration} мин</TableCell>
                                        <TableCell>{schedule.vsk2.description || 'Без описания'}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <Chip label="Финальный тест" color="error" />
                                        </TableCell>
                                        <TableCell>
                                            {schedule.final.startDate ? 
                                                new Date(schedule.final.startDate).toLocaleString('ru-RU') : 
                                                'Не указано'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {schedule.final.endDate ? 
                                                new Date(schedule.final.endDate).toLocaleString('ru-RU') : 
                                                'Не указано'
                                            }
                                        </TableCell>
                                        <TableCell>{schedule.final.duration} мин</TableCell>
                                        <TableCell>{schedule.final.description || 'Без описания'}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {!validateSchedule() && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Пожалуйста, проверьте корректность дат. ВСК 2 должен проводиться после ВСК 1, 
                                а финальный тест - после ВСК 2.
                            </Alert>
                        )}
                    </Box>
                );

            default:
                return 'Неизвестный шаг';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <Schedule />
                    <Typography variant="h6">Планировщик ВСК</Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {renderStepContent(activeStep)}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Отмена
                </Button>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                >
                    Назад
                </Button>
                {activeStep === steps.length - 1 ? (
                    <Button
                        variant="contained"
                        onClick={handleCreateSchedule}
                        disabled={!selectedBaseAssignment || !validateSchedule()}
                        startIcon={<PlayArrow />}
                    >
                        Создать расписание
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={activeStep === 0 && !selectedBaseAssignment}
                    >
                        Далее
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default VSKScheduler; 