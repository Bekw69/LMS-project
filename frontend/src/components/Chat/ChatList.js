import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Badge,
    Paper,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    ListItemButton
} from '@mui/material';
import {
    Group,
    School,
    Search,
    MoreVert,
    Circle
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const ChatList = ({ onChatSelect, selectedChatId }) => {
    const [chats, setChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { currentUser, currentRole } = useSelector(state => state.user);

    useEffect(() => {
        fetchChats();
    }, [currentUser]);

    useEffect(() => {
        filterChats();
    }, [chats, searchTerm]);

    const fetchChats = async () => {
        try {
            if (!currentUser || !currentRole) return;

            const response = await axios.get(
                `${BASE_URL}/Chat/User/${currentUser._id}/${currentRole}`
            );
            setChats(response.data);
        } catch (error) {
            console.error('Ошибка загрузки чатов:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterChats = () => {
        if (!searchTerm) {
            setFilteredChats(chats);
        } else {
            const filtered = chats.filter(chat =>
                chat.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredChats(filtered);
        }
    };

    const formatLastMessageTime = (timestamp) => {
        if (!timestamp) return '';
        
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInHours = (now - messageTime) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
            return diffInMinutes < 1 ? 'сейчас' : `${diffInMinutes}м`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}ч`;
        } else {
            return messageTime.toLocaleDateString('ru-RU', { 
                day: '2-digit', 
                month: '2-digit' 
            });
        }
    };

    const getChatIcon = (chatType) => {
        switch (chatType) {
            case 'class':
                return <Group />;
            case 'subject':
                return <School />;
            default:
                return <Group />;
        }
    };

    const getChatTypeColor = (chatType) => {
        switch (chatType) {
            case 'class':
                return '#4CAF50';
            case 'subject':
                return '#2196F3';
            default:
                return '#9E9E9E';
        }
    };

    if (loading) {
        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ p: 2 }}>
                    Загрузка чатов...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Заголовок и поиск */}
            <Box sx={{ 
                p: 2, 
                borderBottom: 1, 
                borderColor: 'divider',
                backgroundColor: 'background.paper'
            }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Чаты
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Поиск чатов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f5f5f5',
                            '&:hover': {
                                backgroundColor: '#eeeeee'
                            },
                            '&.Mui-focused': {
                                backgroundColor: 'background.paper'
                            }
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Список чатов */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                <List sx={{ p: 0 }}>
                    {filteredChats.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                {searchTerm ? 'Чаты не найдены' : 'У вас пока нет чатов'}
                            </Typography>
                        </Box>
                    ) : (
                        filteredChats.map((chat) => (
                            <ListItemButton
                                key={chat._id}
                                selected={selectedChatId === chat._id}
                                onClick={() => onChatSelect(chat)}
                                sx={{
                                    py: 1.5,
                                    px: 2,
                                    borderBottom: 1,
                                    borderColor: 'divider',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                        transform: 'translateX(4px)'
                                    },
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.light',
                                        borderRight: 3,
                                        borderRightColor: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'primary.light'
                                        }
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            bgcolor: getChatTypeColor(chat.chatType),
                                            width: 48,
                                            height: 48,
                                            boxShadow: 2
                                        }}
                                    >
                                        {getChatIcon(chat.chatType)}
                                    </Avatar>
                                </ListItemAvatar>

                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography 
                                                variant="subtitle2" 
                                                noWrap 
                                                sx={{ 
                                                    flex: 1,
                                                    fontWeight: selectedChatId === chat._id ? 600 : 500
                                                }}
                                            >
                                                {chat.name}
                                            </Typography>
                                            {chat.lastMessage && (
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.secondary"
                                                    sx={{ fontSize: '0.7rem' }}
                                                >
                                                    {formatLastMessageTime(chat.lastMessage.createdAt)}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ mt: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Chip
                                                    label={chat.chatType === 'class' ? 'Класс' : 'Предмет'}
                                                    size="small"
                                                    sx={{
                                                        height: 18,
                                                        fontSize: '0.65rem',
                                                        bgcolor: getChatTypeColor(chat.chatType),
                                                        color: 'white',
                                                        fontWeight: 500
                                                    }}
                                                />
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.secondary"
                                                    sx={{ fontSize: '0.7rem' }}
                                                >
                                                    {chat.participants?.length || 0} участников
                                                </Typography>
                                            </Box>
                                            {chat.lastMessage && (
                                                <Typography 
                                                    variant="body2" 
                                                    noWrap 
                                                    color="text.secondary"
                                                    sx={{ fontSize: '0.8rem' }}
                                                >
                                                    <strong>{chat.lastMessage.senderName}:</strong>{' '}
                                                    {chat.lastMessage.messageType === 'text' 
                                                        ? chat.lastMessage.content
                                                        : `📎 ${chat.lastMessage.messageType === 'image' ? 'Изображение' : 'Файл'}`
                                                    }
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />

                                {chat.unreadCount > 0 && (
                                    <Badge
                                        badgeContent={chat.unreadCount}
                                        color="error"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                fontSize: '0.7rem',
                                                minWidth: 18,
                                                height: 18
                                            }
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        ))
                    )}
                </List>
            </Box>
        </Box>
    );
};

export default ChatList; 