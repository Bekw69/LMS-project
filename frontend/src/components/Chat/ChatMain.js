import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    useMediaQuery,
    useTheme,
    CircularProgress,
    Alert,
    Container
} from '@mui/material';
import { useSelector } from 'react-redux';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const ChatMain = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(false);
    const { currentUser, currentRole } = useSelector(state => state.user);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
    };

    const handleBackToList = () => {
        setSelectedChat(null);
    };

    if (!currentUser) {
        return (
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Alert severity="warning">
                    Необходимо войти в систему для использования чатов
                </Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '50vh' 
                }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                    fontWeight: 'bold', 
                    color: '#2c3e50',
                    mb: 3
                }}
            >
                Чаты
            </Typography>
            
            <Paper
                elevation={3}
                sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    p: 0.5
                }}
            >
                <Box
                    sx={{
                        backgroundColor: 'background.paper',
                        borderRadius: 2.5,
                        height: isMobile ? '75vh' : '70vh',
                        overflow: 'hidden'
                    }}
                >
                    {isMobile ? (
                        // Мобильная версия - показываем либо список, либо чат
                        <Box sx={{ height: '100%' }}>
                            {selectedChat ? (
                                <ChatWindow 
                                    selectedChat={selectedChat} 
                                    onBack={handleBackToList}
                                />
                            ) : (
                                <ChatList 
                                    onChatSelect={handleChatSelect}
                                    selectedChatId={selectedChat?._id}
                                />
                            )}
                        </Box>
                    ) : (
                        // Десктопная версия - показываем оба компонента
                        <Grid container sx={{ height: '100%' }}>
                            <Grid 
                                item 
                                xs={4} 
                                sx={{ 
                                    borderRight: 1, 
                                    borderColor: 'divider',
                                    backgroundColor: '#f8f9fa'
                                }}
                            >
                                <ChatList 
                                    onChatSelect={handleChatSelect}
                                    selectedChatId={selectedChat?._id}
                                />
                            </Grid>
                            <Grid item xs={8}>
                                <ChatWindow 
                                    selectedChat={selectedChat} 
                                    onBack={handleBackToList}
                                />
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default ChatMain; 