import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Add,
    Chat,
    Group,
    CheckCircle,
    Error
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from 'axios';
import styled from 'styled-components';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const CreateClassChat = () => {
    const [classes, setClasses] = useState([]);
    const [existingChats, setExistingChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [chatName, setChatName] = useState('');
    const [chatDescription, setChatDescription] = useState('');
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        fetchClasses();
        fetchExistingChats();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/SclassList/${currentUser._id}`);
            setClasses(response.data);
        } catch (error) {
            console.error('Ошибка загрузки классов:', error);
            showAlert('error', 'Ошибка загрузки классов');
        }
    };

    const fetchExistingChats = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/Chat/User/${currentUser._id}/Admin`);
            setExistingChats(response.data);
        } catch (error) {
            console.error('Ошибка загрузки чатов:', error);
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
    };

    const handleCreateChat = (classItem) => {
        setSelectedClass(classItem);
        setChatName(`Чат класса ${classItem.sclassName}`);
        setChatDescription(`Общий чат для класса ${classItem.sclassName}`);
        setDialogOpen(true);
    };

    const createClassChat = async () => {
        if (!selectedClass || !chatName.trim()) return;

        setCreating(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/Chat/CreateClass/${currentUser._id}`,
                {
                    classId: selectedClass._id,
                    name: chatName,
                    description: chatDescription
                }
            );

            showAlert('success', 'Чат успешно создан!');
            setDialogOpen(false);
            setChatName('');
            setChatDescription('');
            setSelectedClass(null);
            fetchExistingChats(); 
        } catch (error) {
            console.error('Ошибка создания чата:', error);
            showAlert('error', error.response?.data?.message || 'Ошибка создания чата');
        } finally {
            setCreating(false);
        }
    };

    const isChatExists = (classId) => {
        return existingChats.some(chat => chat.class?._id === classId);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container>
            <Typography variant="h5" gutterBottom>
                Создание чатов для классов
            </Typography>
            
            {alert.show && (
                <Alert severity={alert.type} sx={{ mb: 2 }}>
                    {alert.message}
                </Alert>
            )}

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Доступные классы
                </Typography>
                
                {classes.length === 0 ? (
                    <Typography color="text.secondary">
                        Нет доступных классов
                    </Typography>
                ) : (
                    <List>
                        {classes.map((classItem) => {
                            const chatExists = isChatExists(classItem._id);
                            
                            return (
                                <ListItem key={classItem._id} divider>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Group />
                                                <Typography variant="subtitle1">
                                                    {classItem.sclassName}
                                                </Typography>
                                                {chatExists && (
                                                    <Chip
                                                        icon={<CheckCircle />}
                                                        label="Чат создан"
                                                        color="success"
                                                        size="small"
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={`Студентов: ${classItem.students?.length || 0}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <Button
                                            variant={chatExists ? "outlined" : "contained"}
                                            color={chatExists ? "success" : "primary"}
                                            startIcon={chatExists ? <CheckCircle /> : <Add />}
                                            onClick={() => handleCreateChat(classItem)}
                                            disabled={chatExists}
                                        >
                                            {chatExists ? 'Создан' : 'Создать чат'}
                                        </Button>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </Paper>

            {/* Существующие чаты */}
            {existingChats.length > 0 && (
                <Paper sx={{ p: 2, mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Созданные чаты ({existingChats.length})
                    </Typography>
                    <List>
                        {existingChats.map((chat) => (
                            <ListItem key={chat._id} divider>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chat />
                                            <Typography variant="subtitle1">
                                                {chat.name}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {chat.description}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Участников: {chat.participants?.length || 0} • 
                                                Создан: {new Date(chat.createdAt).toLocaleDateString('ru-RU')}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Диалог создания чата */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Создать чат для класса {selectedClass?.sclassName}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Название чата"
                        value={chatName}
                        onChange={(e) => setChatName(e.target.value)}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Описание чата"
                        value={chatDescription}
                        onChange={(e) => setChatDescription(e.target.value)}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        В чат автоматически будут добавлены все студенты класса и учителя, 
                        которые ведут предметы в этом классе.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Отмена
                    </Button>
                    <Button
                        onClick={createClassChat}
                        variant="contained"
                        disabled={!chatName.trim() || creating}
                        startIcon={creating ? <CircularProgress size={20} /> : <Add />}
                    >
                        {creating ? 'Создание...' : 'Создать чат'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CreateClassChat;

const Container = styled(Box)`
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
`; 