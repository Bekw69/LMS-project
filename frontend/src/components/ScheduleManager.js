import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Alert,
    Tabs,
    Tab,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Schedule as ScheduleIcon,
    AccessTime as AccessTimeIcon,
    Event as EventIcon,
    CalendarToday as CalendarTodayIcon,
    Repeat as RepeatIcon
} from '@mui/icons-material';

const daysOfWeek = [
    'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'
];

const timeSlots = [
    '08:00-08:45', '08:55-09:40', '09:50-10:35', '10:45-11:30',
    '11:40-12:25', '12:35-13:20', '13:30-14:15', '14:25-15:10',
    '15:20-16:05', '16:15-17:00'
];

const ScheduleManager = ({ 
    userRole = 'admin', // admin, teacher, student
    classId = null,
    teacherId = null,
    studentId = null,
    editable = true 
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [schedule, setSchedule] = useState({});
    const [templates, setTemplates] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [lessonData, setLessonData] = useState({
        subject: '',
        teacher: '',
        room: '',
        type: 'lecture', // lecture, practice, lab, exam
        recurring: true,
        notes: ''
    });

    // Модульные настройки расписания
    const [scheduleSettings, setScheduleSettings] = useState({
        maxLessonsPerDay: 8,
        breakDuration: 10,
        lunchBreakDuration: 30,
        startTime: '08:00',
        lessonDuration: 45,
        allowOverlap: false,
        autoBreaks: true,
        weekendClasses: false
    });

    useEffect(() => {
        loadSchedule();
        loadTemplates();
    }, [classId, teacherId, studentId]);

    const loadSchedule = async () => {
        // Загрузка расписания в зависимости от роли
        try {
            let endpoint = '';
            if (userRole === 'admin' && classId) {
                endpoint = `/schedule/class/${classId}`;
            } else if (userRole === 'teacher' && teacherId) {
                endpoint = `/schedule/teacher/${teacherId}`;
            } else if (userRole === 'student' && studentId) {
                endpoint = `/schedule/student/${studentId}`;
            }
            
            // const response = await axios.get(endpoint);
            // setSchedule(response.data);
            
            // Заглушка для демонстрации
            setSchedule(generateSampleSchedule());
        } catch (error) {
            console.error('Ошибка загрузки расписания:', error);
        }
    };

    const loadTemplates = async () => {
        // Загрузка шаблонов расписания
        setTemplates([
            { id: 1, name: 'Стандартное расписание', type: 'standard' },
            { id: 2, name: 'Интенсивное расписание', type: 'intensive' },
            { id: 3, name: 'Гибкое расписание', type: 'flexible' }
        ]);
    };

    const generateSampleSchedule = () => {
        const sampleSchedule = {};
        daysOfWeek.forEach((day, dayIndex) => {
            sampleSchedule[day] = [];
            for (let i = 0; i < 6; i++) {
                if (Math.random() > 0.3) { // 70% вероятность урока
                    sampleSchedule[day].push({
                        id: `${dayIndex}-${i}`,
                        time: timeSlots[i],
                        subject: ['Математика', 'Физика', 'Химия', 'История', 'Литература'][Math.floor(Math.random() * 5)],
                        teacher: ['Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.'][Math.floor(Math.random() * 3)],
                        room: `${Math.floor(Math.random() * 20) + 101}`,
                        type: ['lecture', 'practice', 'lab'][Math.floor(Math.random() * 3)]
                    });
                }
            }
        });
        return sampleSchedule;
    };

    const handleAddLesson = (day, timeSlot) => {
        setSelectedSlot({ day, timeSlot });
        setLessonData({
            subject: '',
            teacher: '',
            room: '',
            type: 'lecture',
            recurring: true,
            notes: ''
        });
        setOpenDialog(true);
    };

    const handleSaveLesson = () => {
        if (!selectedSlot) return;

        const newSchedule = { ...schedule };
        if (!newSchedule[selectedSlot.day]) {
            newSchedule[selectedSlot.day] = [];
        }

        const newLesson = {
            id: Date.now().toString(),
            time: selectedSlot.timeSlot,
            ...lessonData
        };

        newSchedule[selectedSlot.day].push(newLesson);
        newSchedule[selectedSlot.day].sort((a, b) => a.time.localeCompare(b.time));

        setSchedule(newSchedule);
        setOpenDialog(false);
    };

    const handleDeleteLesson = (day, lessonId) => {
        const newSchedule = { ...schedule };
        newSchedule[day] = newSchedule[day].filter(lesson => lesson.id !== lessonId);
        setSchedule(newSchedule);
    };

    const applyTemplate = (templateId) => {
        // Применение шаблона расписания
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSchedule(generateSampleSchedule());
        }
    };

    const exportSchedule = () => {
        // Экспорт расписания в различные форматы
        const scheduleData = JSON.stringify(schedule, null, 2);
        const blob = new Blob([scheduleData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'schedule.json';
        a.click();
    };

    const renderScheduleGrid = () => (
        <TableContainer component={Paper} elevation={2}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Время</TableCell>
                        {daysOfWeek.map(day => (
                            <TableCell key={day} sx={{ fontWeight: 'bold', minWidth: 200 }}>
                                {day}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {timeSlots.map(timeSlot => (
                        <TableRow key={timeSlot} hover>
                            <TableCell sx={{ fontWeight: 'medium', bgcolor: 'grey.50' }}>
                                {timeSlot}
                            </TableCell>
                            {daysOfWeek.map(day => {
                                const lesson = schedule[day]?.find(l => l.time === timeSlot);
                                return (
                                    <TableCell key={`${day}-${timeSlot}`} sx={{ p: 1 }}>
                                        {lesson ? (
                                            <Card variant="outlined" sx={{ 
                                                bgcolor: lesson.type === 'exam' ? 'error.light' : 
                                                        lesson.type === 'lab' ? 'warning.light' : 'primary.light',
                                                color: 'white'
                                            }}>
                                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {lesson.subject}
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        {lesson.teacher}
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        Каб. {lesson.room}
                                                    </Typography>
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <Chip 
                                                            label={lesson.type} 
                                                            size="small" 
                                                            variant="outlined"
                                                            sx={{ color: 'white', borderColor: 'white' }}
                                                        />
                                                    </Box>
                                                </CardContent>
                                                {editable && (
                                                    <CardActions sx={{ p: 0.5, justifyContent: 'flex-end' }}>
                                                        <IconButton 
                                                            size="small" 
                                                            sx={{ color: 'white' }}
                                                            onClick={() => handleDeleteLesson(day, lesson.id)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </CardActions>
                                                )}
                                            </Card>
                                        ) : editable ? (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                startIcon={<AddIcon />}
                                                onClick={() => handleAddLesson(day, timeSlot)}
                                                sx={{ minHeight: 80, borderStyle: 'dashed' }}
                                            >
                                                Добавить
                                            </Button>
                                        ) : null}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderTemplates = () => (
        <Grid container spacing={3}>
            {templates.map(template => (
                <Grid item xs={12} md={4} key={template.id}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {template.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Тип: {template.type}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button 
                                size="small" 
                                onClick={() => applyTemplate(template.id)}
                                startIcon={<RepeatIcon />}
                            >
                                Применить
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderSettings = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Основные настройки
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Максимум уроков в день"
                                    type="number"
                                    value={scheduleSettings.maxLessonsPerDay}
                                    onChange={(e) => setScheduleSettings(prev => ({
                                        ...prev,
                                        maxLessonsPerDay: parseInt(e.target.value)
                                    }))}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Время начала занятий"
                                    type="time"
                                    value={scheduleSettings.startTime}
                                    onChange={(e) => setScheduleSettings(prev => ({
                                        ...prev,
                                        startTime: e.target.value
                                    }))}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Длительность урока (мин)"
                                    type="number"
                                    value={scheduleSettings.lessonDuration}
                                    onChange={(e) => setScheduleSettings(prev => ({
                                        ...prev,
                                        lessonDuration: parseInt(e.target.value)
                                    }))}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Дополнительные настройки
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={scheduleSettings.autoBreaks}
                                            onChange={(e) => setScheduleSettings(prev => ({
                                                ...prev,
                                                autoBreaks: e.target.checked
                                            }))}
                                        />
                                    }
                                    label="Автоматические перемены"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={scheduleSettings.weekendClasses}
                                            onChange={(e) => setScheduleSettings(prev => ({
                                                ...prev,
                                                weekendClasses: e.target.checked
                                            }))}
                                        />
                                    }
                                    label="Занятия по выходным"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={scheduleSettings.allowOverlap}
                                            onChange={(e) => setScheduleSettings(prev => ({
                                                ...prev,
                                                allowOverlap: e.target.checked
                                            }))}
                                        />
                                    }
                                    label="Разрешить пересечения"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Управление расписанием
                </Typography>
                <Box>
                    <Button 
                        variant="outlined" 
                        onClick={exportSchedule}
                        sx={{ mr: 1 }}
                    >
                        Экспорт
                    </Button>
                    {editable && (
                        <Button variant="contained" startIcon={<AddIcon />}>
                            Создать новое
                        </Button>
                    )}
                </Box>
            </Box>

            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                <Tab label="Расписание" icon={<CalendarTodayIcon />} />
                <Tab label="Шаблоны" icon={<EventIcon />} />
                <Tab label="Настройки" icon={<AccessTimeIcon />} />
            </Tabs>

            {activeTab === 0 && renderScheduleGrid()}
            {activeTab === 1 && renderTemplates()}
            {activeTab === 2 && renderSettings()}

            {/* Диалог добавления урока */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Добавить урок</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Предмет"
                                value={lessonData.subject}
                                onChange={(e) => setLessonData(prev => ({ ...prev, subject: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Учитель"
                                value={lessonData.teacher}
                                onChange={(e) => setLessonData(prev => ({ ...prev, teacher: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Кабинет"
                                value={lessonData.room}
                                onChange={(e) => setLessonData(prev => ({ ...prev, room: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Тип урока</InputLabel>
                                <Select
                                    value={lessonData.type}
                                    onChange={(e) => setLessonData(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    <MenuItem value="lecture">Лекция</MenuItem>
                                    <MenuItem value="practice">Практика</MenuItem>
                                    <MenuItem value="lab">Лабораторная</MenuItem>
                                    <MenuItem value="exam">Экзамен</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={lessonData.recurring}
                                        onChange={(e) => setLessonData(prev => ({ ...prev, recurring: e.target.checked }))}
                                    />
                                }
                                label="Повторяющийся урок"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Заметки"
                                multiline
                                rows={2}
                                value={lessonData.notes}
                                onChange={(e) => setLessonData(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
                    <Button onClick={handleSaveLesson} variant="contained">Сохранить</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ScheduleManager; 