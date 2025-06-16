import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    Tab,
    Tabs,
    LinearProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    IconButton
} from '@mui/material';
import {
    Assignment,
    Schedule,
    CheckCircle,
    Warning,
    PlayArrow,
    Visibility,
    AccessTime,
    Grade,
    Description,
    AttachFile
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`assignments-tabpanel-${index}`}
            aria-labelledby={`assignments-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const StudentAssignments = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [tabValue, setTabValue] = useState(0);
    const [assignments, setAssignments] = useState([]);
    const [submittedAssignments, setSubmittedAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [assignmentStarted, setAssignmentStarted] = useState(false);

    useEffect(() => {
        // Симуляция загрузки заданий
        const mockActiveAssignments = [
            {
                id: 1,
                title: 'ВСК 1 - HTML/CSS Основы',
                description: 'Тестирование знаний по основам HTML и CSS',
                type: 'VSK1',
                subject: 'Frontend Development',
                startDate: '2024-01-10T09:00:00',
                endDate: '2024-01-25T23:59:00',
                duration: 60, // минуты
                totalPoints: 100,
                status: 'active',
                isSubmitted: false,
                questions: [
                    {
                        id: 1,
                        question: 'Что означает HTML?',
                        type: 'multiple_choice',
                        options: [
                            { id: 'a', text: 'HyperText Markup Language', isCorrect: true },
                            { id: 'b', text: 'High Tech Modern Language', isCorrect: false },
                            { id: 'c', text: 'Home Tool Markup Language', isCorrect: false },
                            { id: 'd', text: 'Hyperlink and Text Markup Language', isCorrect: false }
                        ],
                        points: 10
                    },
                    {
                        id: 2,
                        question: 'Какой тег используется для создания заголовка первого уровня?',
                        type: 'multiple_choice',
                        options: [
                            { id: 'a', text: '<header>', isCorrect: false },
                            { id: 'b', text: '<h1>', isCorrect: true },
                            { id: 'c', text: '<title>', isCorrect: false },
                            { id: 'd', text: '<head>', isCorrect: false }
                        ],
                        points: 10
                    }
                ],
                attachments: []
            },
            {
                id: 2,
                title: 'Домашнее задание - Создание макета',
                description: 'Создайте адаптивный макет веб-страницы согласно техническому заданию',
                type: 'HOMEWORK',
                subject: 'Frontend Development',
                startDate: '2024-01-15T00:00:00',
                endDate: '2024-01-30T23:59:00',
                duration: null,
                totalPoints: 50,
                status: 'active',
                isSubmitted: false,
                questions: [],
                attachments: [
                    { name: 'Техническое задание.pdf', size: '2.1 MB' },
                    { name: 'Макеты.zip', size: '5.8 MB' }
                ]
            }
        ];

        const mockSubmittedAssignments = [
            {
                id: 3,
                title: 'ВСК 1 - JavaScript Basics',
                type: 'VSK1',
                subject: 'JavaScript Advanced',
                submissionDate: '2024-01-08T14:30:00',
                score: 85,
                maxScore: 100,
                feedback: 'Хорошая работа! Обратите внимание на асинхронное программирование.',
                status: 'graded'
            }
        ];

        setAssignments(mockActiveAssignments);
        setSubmittedAssignments(mockSubmittedAssignments);
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getStatusColor = (status, isSubmitted) => {
        if (isSubmitted) return 'success';
        if (status === 'active') return 'warning';
        return 'default';
    };

    const getStatusText = (assignment) => {
        if (assignment.isSubmitted) return 'Отправлено';
        const now = new Date();
        const endDate = new Date(assignment.endDate);
        if (now > endDate) return 'Просрочено';
        return 'Активно';
    };

    const formatTimeLeft = (assignment) => {
        const now = new Date();
        const endDate = new Date(assignment.endDate);
        const diff = endDate - now;
        
        if (diff <= 0) return 'Просрочено';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days} дн. ${hours} ч.`;
        return `${hours} ч.`;
    };

    const handleStartAssignment = (assignment) => {
        setSelectedAssignment(assignment);
        setUserAnswers({});
        setOpenAssignmentDialog(true);
        
        if (assignment.duration) {
            setTimeLeft(assignment.duration * 60); // конвертируем в секунды
            setAssignmentStarted(true);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmitAssignment = () => {
        // Здесь будет логика отправки задания
        console.log('Submitting assignment:', selectedAssignment.id, userAnswers);
        setOpenAssignmentDialog(false);
        setAssignmentStarted(false);
        // Обновляем статус задания
        setAssignments(prev => prev.map(a => 
            a.id === selectedAssignment.id ? { ...a, isSubmitted: true } : a
        ));
    };

    // Таймер для заданий с ограничением времени
    useEffect(() => {
        let timer;
        if (assignmentStarted && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmitAssignment(); // Автоматическая отправка при истечении времени
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [assignmentStarted, timeLeft]);

    const formatTimer = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>
                Мои задания
            </Typography>

            <Paper elevation={2}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="assignments tabs"
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab icon={<Assignment />} label="Активные задания" />
                    <Tab icon={<CheckCircle />} label="Выполненные" />
                </Tabs>

                {/* Активные задания */}
                <TabPanel value={tabValue} index={0}>
                    {assignments.length === 0 ? (
                        <Alert severity="info">У вас нет активных заданий</Alert>
                    ) : (
                        <Grid container spacing={3}>
                            {assignments.map((assignment) => (
                                <Grid item xs={12} md={6} key={assignment.id}>
                                    <StyledAssignmentCard elevation={3}>
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                <Typography variant="h6" component="div">
                                                    {assignment.title}
                                                </Typography>
                                                <Chip
                                                    label={getStatusText(assignment)}
                                                    color={getStatusColor(assignment.status, assignment.isSubmitted)}
                                                    size="small"
                                                />
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {assignment.description}
                                            </Typography>

                                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                                <Chip 
                                                    label={assignment.type} 
                                                    size="small" 
                                                    variant="outlined" 
                                                />
                                                <Typography variant="body2" color="text.secondary">
                                                    {assignment.subject}
                                                </Typography>
                                            </Box>

                                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                                <AccessTime fontSize="small" />
                                                <Typography variant="body2">
                                                    Осталось: {formatTimeLeft(assignment)}
                                                </Typography>
                                            </Box>

                                            <Box display="flex" alignItems="center" gap={1} mb={3}>
                                                <Grade fontSize="small" />
                                                <Typography variant="body2">
                                                    Максимальный балл: {assignment.totalPoints}
                                                </Typography>
                                            </Box>

                                            <Box display="flex" gap={1}>
                                                <Button
                                                    size="small"
                                                    startIcon={assignment.isSubmitted ? <Visibility /> : <PlayArrow />}
                                                    variant={assignment.isSubmitted ? "outlined" : "contained"}
                                                    onClick={() => handleStartAssignment(assignment)}
                                                    disabled={assignment.isSubmitted}
                                                >
                                                    {assignment.isSubmitted ? 'Просмотр' : 'Начать'}
                                                </Button>
                                                {assignment.attachments.length > 0 && (
                                                    <Button
                                                        size="small"
                                                        startIcon={<AttachFile />}
                                                        variant="outlined"
                                                    >
                                                        Файлы ({assignment.attachments.length})
                                                    </Button>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </StyledAssignmentCard>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </TabPanel>

                {/* Выполненные задания */}
                <TabPanel value={tabValue} index={1}>
                    {submittedAssignments.length === 0 ? (
                        <Alert severity="info">У вас нет выполненных заданий</Alert>
                    ) : (
                        <List>
                            {submittedAssignments.map((assignment, index) => (
                                <React.Fragment key={assignment.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Typography variant="h6">{assignment.title}</Typography>
                                                    <Chip label={assignment.type} size="small" />
                                                    <Chip 
                                                        label={`${assignment.score}/${assignment.maxScore}`}
                                                        color={assignment.score >= assignment.maxScore * 0.8 ? 'success' : 'warning'}
                                                        size="small"
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {assignment.subject} • Отправлено: {new Date(assignment.submissionDate).toLocaleString('ru-RU')}
                                                    </Typography>
                                                    {assignment.feedback && (
                                                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                                            Отзыв: {assignment.feedback}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < submittedAssignments.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </TabPanel>
            </Paper>

            {/* Диалог выполнения задания */}
            <Dialog 
                open={openAssignmentDialog} 
                onClose={() => setOpenAssignmentDialog(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedAssignment && (
                    <>
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">{selectedAssignment.title}</Typography>
                                {timeLeft > 0 && (
                                    <Chip 
                                        label={`Осталось: ${formatTimer(timeLeft)}`}
                                        color="warning"
                                        icon={<AccessTime />}
                                    />
                                )}
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                {selectedAssignment.description}
                            </Typography>

                            {selectedAssignment.questions.map((question, index) => (
                                <Paper key={question.id} sx={{ p: 3, mb: 2 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        {index + 1}. {question.question} ({question.points} баллов)
                                    </Typography>
                                    
                                    <FormControl component="fieldset">
                                        <RadioGroup
                                            value={userAnswers[question.id] || ''}
                                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                        >
                                            {question.options.map((option) => (
                                                <FormControlLabel
                                                    key={option.id}
                                                    value={option.id}
                                                    control={<Radio />}
                                                    label={option.text}
                                                />
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                </Paper>
                            ))}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenAssignmentDialog(false)}>
                                Отмена
                            </Button>
                            <Button 
                                onClick={handleSubmitAssignment}
                                variant="contained"
                                disabled={Object.keys(userAnswers).length !== selectedAssignment.questions.length}
                            >
                                Отправить
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Container>
    );
};

const StyledAssignmentCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
}));

export default StudentAssignments; 