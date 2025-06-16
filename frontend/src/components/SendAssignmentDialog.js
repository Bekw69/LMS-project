import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    TextField,
    FormControlLabel,
    Switch,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    Avatar,
    Chip,
    Alert,
    CircularProgress,
    Divider,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import {
    Send,
    Person,
    Email,
    Notifications,
    Assignment,
    Class,
    Schedule
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
        boxShadow: theme.shadows[4]
    }
}));

const SendAssignmentDialog = ({ open, onClose, assignment, onSuccess }) => {
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectAll, setSelectAll] = useState(true);
    const [message, setMessage] = useState('');
    const [sendNotification, setSendNotification] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (open && assignment) {
            fetchStudents();
            setMessage(`Новое задание "${assignment.title}" готово к выполнению. Пожалуйста, ознакомьтесь с заданием и выполните его в указанные сроки.`);
        }
    }, [open, assignment]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/assignments/students/${assignment.sclass._id}`);
            setStudents(response.data.data);
            setSelectedStudents(response.data.data.map(student => student._id));
        } catch (error) {
            setError('Ошибка при загрузке списка студентов');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentToggle = (studentId) => {
        setSelectedStudents(prev => {
            const newSelected = prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId];
            
            setSelectAll(newSelected.length === students.length);
            return newSelected;
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(student => student._id));
        }
        setSelectAll(!selectAll);
    };

    const handleSend = async () => {
        if (selectedStudents.length === 0) {
            setError('Выберите хотя бы одного студента');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await axios.post(`${BASE_URL}/assignments/send`, {
                assignmentId: assignment._id,
                studentIds: selectedStudents,
                message,
                sendNotification
            });

            setSuccess(response.data.message);
            setTimeout(() => {
                onSuccess && onSuccess();
                onClose();
            }, 2000);

        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при отправке задания');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        setSuccess('');
        setSelectedStudents([]);
        setMessage('');
        onClose();
    };

    if (!assignment) return null;

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Send color="primary" />
                    <Typography variant="h6">Отправить задание студентам</Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {typeof error === 'string' ? error : error.message || 'Неизвестная ошибка'}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                {/* Информация о задании */}
                <StyledCard>
                    <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Assignment color="primary" />
                            <Typography variant="h6">{assignment.title}</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Class fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        {assignment.sclass?.sclassName}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Schedule fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        До: {new Date(assignment.endDate).toLocaleDateString('ru-RU')}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                        <Chip 
                            label={assignment.type} 
                            color="primary" 
                            size="small" 
                            sx={{ mt: 1 }}
                        />
                    </CardContent>
                </StyledCard>

                {/* Выбор студентов */}
                <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Выбор получателей</Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                    indeterminate={selectedStudents.length > 0 && selectedStudents.length < students.length}
                                />
                            }
                            label="Выбрать всех"
                        />
                    </Box>

                    {loading ? (
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box 
                            sx={{ 
                                maxHeight: 300, 
                                overflow: 'auto',
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1
                            }}
                        >
                            <List dense>
                                {students.map((student) => (
                                    <ListItem 
                                        key={student._id}
                                        button
                                        onClick={() => handleStudentToggle(student._id)}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'action.hover'
                                            }
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                checked={selectedStudents.includes(student._id)}
                                                tabIndex={-1}
                                                disableRipple
                                            />
                                        </ListItemIcon>
                                        <ListItemIcon>
                                            <Avatar sx={{ width: 32, height: 32 }}>
                                                {student.name.charAt(0)}
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={student.name}
                                            secondary={`№${student.rollNum} • ${student.email}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Выбрано: {selectedStudents.length} из {students.length} студентов
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Сообщение */}
                <Box mb={3}>
                    <Typography variant="h6" mb={2}>Сообщение студентам</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Введите дополнительное сообщение для студентов..."
                        variant="outlined"
                    />
                </Box>

                {/* Настройки уведомлений */}
                <Box>
                    <Typography variant="h6" mb={2}>Настройки уведомлений</Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={sendNotification}
                                onChange={(e) => setSendNotification(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                <Email fontSize="small" />
                                <Typography>Отправить email уведомления</Typography>
                            </Box>
                        }
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        Студенты получат уведомления на свои email адреса
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button onClick={handleClose} disabled={loading}>
                    Отмена
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={loading || selectedStudents.length === 0}
                    startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                >
                    {loading ? 'Отправка...' : `Отправить (${selectedStudents.length})`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SendAssignmentDialog; 