import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Avatar,
    List,
    ListItem,
    Chip,
    Button,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Send,
    AttachFile,
    EmojiEmotions,
    MoreVert,
    Image,
    VideoFile,
    AudioFile,
    Description,
    Download,
    Reply,
    Group,
    School,
    Wifi,
    WifiOff
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { styled } from '@mui/material/styles';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const ChatWindow = ({ selectedChat, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [fileDialogOpen, setFileDialogOpen] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const { currentUser, currentRole } = useSelector(state => state.user);
    const { socket, isConnected, joinChat, leaveChat, sendTyping } = useSocket();
    const { themeMode, colors } = useTheme();

    useEffect(() => {
        if (selectedChat) {
            fetchMessages();
            // Присоединяемся к комнате чата
            if (socket) {
                joinChat(selectedChat._id);
            }
        }

        return () => {
            // Покидаем комнату при смене чата
            if (selectedChat && socket) {
                leaveChat(selectedChat._id);
            }
        };
    }, [selectedChat, socket]);

    useEffect(() => {
        if (socket) {
            // Слушаем новые сообщения
            socket.on('new-message', (message) => {
                setMessages(prev => [...prev, message]);
            });

            // Слушаем индикатор печати
            socket.on('user-typing', (data) => {
                if (data.userId !== currentUser._id) {
                    setTypingUsers(prev => {
                        if (data.isTyping) {
                            // Добавляем пользователя в список печатающих
                            if (!prev.find(u => u.userId === data.userId)) {
                                return [...prev, data];
                            }
                        } else {
                            // Убираем пользователя из списка печатающих
                            return prev.filter(u => u.userId !== data.userId);
                        }
                        return prev;
                    });

                    // Автоматически убираем индикатор через 3 секунды
                    if (data.isTyping) {
                        setTimeout(() => {
                            setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
                        }, 3000);
                    }
                }
            });

            return () => {
                socket.off('new-message');
                socket.off('user-typing');
            };
        }
    }, [socket, currentUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        if (!selectedChat || !currentUser) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `${BASE_URL}/Chat/${selectedChat._id}/Messages/${currentUser._id}/${currentRole}`
            );
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const messageData = {
                content: newMessage,
                senderId: currentUser._id,
                senderModel: currentRole,
                senderName: currentUser.name || currentUser.email,
                replyTo: replyTo?._id
            };

            const response = await axios.post(
                `${BASE_URL}/Chat/${selectedChat._id}/Message`,
                messageData
            );

            // Добавляем сообщение локально (оно также придет через Socket.IO)
            setMessages(prev => [...prev, response.data.data]);
            setNewMessage('');
            setReplyTo(null);

            // Останавливаем индикатор печати
            if (socket) {
                sendTyping(selectedChat._id, currentUser._id, currentUser.name, false);
            }
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file || sending) return;

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('senderId', currentUser._id);
            formData.append('senderModel', currentRole);
            formData.append('senderName', currentUser.name || currentUser.email);

            const response = await axios.post(
                `${BASE_URL}/Chat/${selectedChat._id}/Upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setMessages(prev => [...prev, response.data.data]);
            setFileDialogOpen(false);
        } catch (error) {
            console.error('Ошибка загрузки файла:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleTyping = (value) => {
        setNewMessage(value);

        if (socket && selectedChat) {
            // Отправляем индикатор печати
            sendTyping(selectedChat._id, currentUser._id, currentUser.name || currentUser.email, true);

            // Очищаем предыдущий таймаут
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Устанавливаем новый таймаут для остановки индикатора печати
            typingTimeoutRef.current = setTimeout(() => {
                sendTyping(selectedChat._id, currentUser._id, currentUser.name || currentUser.email, false);
            }, 1000);
        }
    };

    const formatMessageTime = (timestamp) => {
        const messageTime = new Date(timestamp);
        return messageTime.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const isMyMessage = (message) => {
        return message.sender === currentUser._id && message.senderModel === currentRole;
    };

    const getFileIcon = (messageType) => {
        switch (messageType) {
            case 'image':
                return <Image />;
            case 'video':
                return <VideoFile />;
            case 'voice':
                return <AudioFile />;
            case 'document':
                return <Description />;
            default:
                return <AttachFile />;
        }
    };

    const renderMessage = (message) => {
        const isMy = isMyMessage(message);
        
        return (
            <MessageContainer key={message._id} isMy={isMy}>
                <MessageBubble isMy={isMy} themeMode={themeMode} colors={colors}>
                    {!isMy && (
                        <Typography variant="caption" sx={{ 
                            fontWeight: 'bold', 
                            mb: 0.5,
                            color: colors.primary
                        }}>
                            {message.senderName}
                        </Typography>
                    )}
                    
                    {message.replyTo && (
                        <ReplyContainer themeMode={themeMode}>
                            <Typography variant="caption" color="text.secondary">
                                Ответ на сообщение
                            </Typography>
                        </ReplyContainer>
                    )}

                    {message.messageType === 'text' ? (
                        <Typography variant="body2" sx={{ 
                            wordBreak: 'break-word',
                            lineHeight: 1.5
                        }}>
                            {message.content}
                        </Typography>
                    ) : (
                        <FileMessage themeMode={themeMode}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                {getFileIcon(message.messageType)}
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                    {message.file?.originalName || 'Файл'}
                                </Typography>
                                <IconButton 
                                    size="small" 
                                    onClick={() => window.open(`${BASE_URL}${message.file?.url}`, '_blank')}
                                >
                                    <Download fontSize="small" />
                                </IconButton>
                            </Box>
                            
                            {message.messageType === 'image' && (
                                <img 
                                    src={`${BASE_URL}${message.file?.url}`}
                                    alt="Изображение"
                                    style={{ 
                                        maxWidth: '200px', 
                                        maxHeight: '200px', 
                                        borderRadius: '12px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => window.open(`${BASE_URL}${message.file?.url}`, '_blank')}
                                />
                            )}

                            {message.messageType === 'video' && (
                                <video 
                                    controls 
                                    style={{ maxWidth: '200px', borderRadius: '12px' }}
                                >
                                    <source src={`${BASE_URL}${message.file?.url}`} type={message.file?.mimetype} />
                                </video>
                            )}
                        </FileMessage>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" sx={{ 
                            opacity: 0.7,
                            fontSize: '0.75rem'
                        }}>
                            {formatMessageTime(message.createdAt)}
                        </Typography>
                        <IconButton 
                            size="small" 
                            onClick={() => setReplyTo(message)}
                            sx={{ opacity: 0.7 }}
                        >
                            <Reply fontSize="small" />
                        </IconButton>
                    </Box>
                </MessageBubble>
            </MessageContainer>
        );
    };

    if (!selectedChat) {
        return (
            <ChatWindowContainer themeMode={themeMode} colors={colors}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    <Typography variant="h6" color="text.secondary">
                        Выберите чат для начала общения
                    </Typography>
                </Box>
            </ChatWindowContainer>
        );
    }

    return (
        <ChatWindowContainer themeMode={themeMode} colors={colors}>
            {/* Header */}
            <ChatHeader themeMode={themeMode} colors={colors}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                        bgcolor: colors.primary,
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
                    }}>
                        {selectedChat.chatType === 'class' ? <Group /> : <School />}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {selectedChat.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                {selectedChat.participants?.length} участников
                            </Typography>
                            <Tooltip title={isConnected ? 'Подключено' : 'Отключено'}>
                                {isConnected ? 
                                    <Wifi sx={{ fontSize: 16, color: colors.success }} /> : 
                                    <WifiOff sx={{ fontSize: 16, color: colors.error }} />
                                }
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <MoreVert />
                </IconButton>
            </ChatHeader>

            {/* Messages */}
            <MessagesContainer themeMode={themeMode} colors={colors}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress sx={{ color: colors.primary }} />
                    </Box>
                ) : (
                    <List sx={{ p: 1 }}>
                        {messages.map(renderMessage)}
                        
                        {/* Индикатор печати */}
                        {typingUsers.length > 0 && (
                            <TypingIndicator themeMode={themeMode} colors={colors}>
                                <Typography variant="caption" color="text.secondary">
                                    {typingUsers.map(u => u.userName).join(', ')} печатает...
                                </Typography>
                            </TypingIndicator>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </List>
                )}
            </MessagesContainer>

            {/* Reply Preview */}
            {replyTo && (
                <ReplyPreview themeMode={themeMode} colors={colors}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 600 }}>
                            Ответ на сообщение от {replyTo.senderName}
                        </Typography>
                        <Typography variant="body2" noWrap>
                            {replyTo.content || 'Файл'}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setReplyTo(null)}>
                        <Reply />
                    </IconButton>
                </ReplyPreview>
            )}

            {/* Input */}
            <InputContainer themeMode={themeMode} colors={colors}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Введите сообщение..."
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending || !isConnected}
                    variant="outlined"
                    size="small"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: themeMode === 'light' ? colors.surface : colors.paper
                        }
                    }}
                />
                
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        if (e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                        }
                    }}
                />
                
                <IconButton 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending || !isConnected}
                    sx={{ 
                        color: colors.primary,
                        '&:hover': {
                            backgroundColor: `${colors.primary}15`
                        }
                    }}
                >
                    <AttachFile />
                </IconButton>
                
                <IconButton 
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending || !isConnected}
                    sx={{
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                        color: 'white',
                        '&:hover': {
                            background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
                        },
                        '&:disabled': {
                            background: colors.disabled,
                            color: 'white'
                        }
                    }}
                >
                    {sending ? <CircularProgress size={20} color="inherit" /> : <Send />}
                </IconButton>
            </InputContainer>

            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem onClick={() => {
                    setAnchorEl(null);
                    // Открыть информацию о чате
                }}>
                    Информация о чате
                </MenuItem>
            </Menu>
        </ChatWindowContainer>
    );
};

export default ChatWindow;

// Styled Components с Academic Minimalism дизайном
const ChatWindowContainer = styled(Paper)(({ themeMode, colors }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    overflow: 'hidden',
    background: themeMode === 'light'
        ? 'linear-gradient(135deg, #FFFFFF 0%, #F8F6F7 100%)'
        : 'linear-gradient(135deg, #1A1A1A 0%, #262626 100%)',
    border: themeMode === 'light' ? `1px solid ${colors.divider}` : 'none',
    boxShadow: themeMode === 'light'
        ? '0px 8px 32px rgba(139, 21, 56, 0.08)'
        : '0px 8px 32px rgba(0, 0, 0, 0.4)'
}));

const ChatHeader = styled(Box)(({ themeMode, colors }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: `1px solid ${colors.divider}`,
    background: themeMode === 'light'
        ? 'linear-gradient(135deg, #FFFFFF 0%, #F8F6F7 100%)'
        : 'linear-gradient(135deg, #262626 0%, #1A1A1A 100%)',
    backdropFilter: 'blur(10px)'
}));

const MessagesContainer = styled(Box)(({ themeMode, colors }) => ({
    flex: 1,
    overflowY: 'auto',
    background: themeMode === 'light'
        ? colors.surface
        : colors.background,
    '&::-webkit-scrollbar': {
        width: '6px'
    },
    '&::-webkit-scrollbar-track': {
        background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
        background: colors.divider,
        borderRadius: '3px'
    }
}));

const MessageContainer = styled(Box)(({ isMy }) => ({
    display: 'flex',
    justifyContent: isMy ? 'flex-end' : 'flex-start',
    margin: '12px 20px'
}));

const MessageBubble = styled(Box)(({ isMy, themeMode, colors }) => ({
    maxWidth: '70%',
    padding: '16px 20px',
    borderRadius: '20px',
    background: isMy 
        ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
        : themeMode === 'light' 
            ? '#FFFFFF' 
            : colors.paper,
    color: isMy ? 'white' : 'inherit',
    boxShadow: themeMode === 'light'
        ? '0px 4px 16px rgba(139, 21, 56, 0.08)'
        : '0px 4px 16px rgba(0, 0, 0, 0.3)',
    border: !isMy && themeMode === 'light' ? `1px solid ${colors.divider}` : 'none',
    position: 'relative',
    
    // Хвостик сообщения
    '&::before': {
        content: '""',
        position: 'absolute',
        bottom: '8px',
        width: 0,
        height: 0,
        border: '8px solid transparent',
        ...(isMy ? {
            right: '-8px',
            borderLeftColor: colors.primary
        } : {
            left: '-8px',
            borderRightColor: themeMode === 'light' ? '#FFFFFF' : colors.paper
        })
    }
}));

const ReplyContainer = styled(Box)(({ themeMode }) => ({
    background: 'rgba(255,255,255,0.1)',
    padding: '8px 12px',
    borderRadius: '8px',
    marginBottom: '8px',
    borderLeft: '3px solid rgba(255,255,255,0.3)'
}));

const ReplyPreview = styled(Box)(({ themeMode, colors }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    background: themeMode === 'light' 
        ? `${colors.primary}10`
        : `${colors.primary}20`,
    borderLeft: `4px solid ${colors.primary}`,
    borderTop: `1px solid ${colors.divider}`
}));

const FileMessage = styled(Box)(({ themeMode }) => ({
    background: 'rgba(255,255,255,0.1)',
    padding: '12px',
    borderRadius: '12px'
}));

const InputContainer = styled(Box)(({ themeMode, colors }) => ({
    display: 'flex',
    alignItems: 'flex-end',
    padding: '20px 24px',
    borderTop: `1px solid ${colors.divider}`,
    background: themeMode === 'light'
        ? 'linear-gradient(135deg, #FFFFFF 0%, #F8F6F7 100%)'
        : 'linear-gradient(135deg, #262626 0%, #1A1A1A 100%)',
    gap: '12px',
    backdropFilter: 'blur(10px)'
}));

const TypingIndicator = styled(Box)(({ themeMode, colors }) => ({
    padding: '12px 20px',
    margin: '8px 20px',
    background: themeMode === 'light' ? colors.surface : colors.paper,
    borderRadius: '16px',
    border: themeMode === 'light' ? `1px solid ${colors.divider}` : 'none',
    animation: 'pulse 1.5s ease-in-out infinite',
    
    '@keyframes pulse': {
        '0%': { opacity: 0.6 },
        '50%': { opacity: 1 },
        '100%': { opacity: 0.6 }
    }
})); 