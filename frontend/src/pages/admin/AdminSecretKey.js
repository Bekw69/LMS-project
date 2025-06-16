    import React, { useState, useEffect, useCallback } from 'react';
    import { useSelector } from 'react-redux';
    import axios from 'axios';
    import {
        Paper,
        Box,
        Typography,
        Button,
        Alert,
        TextField,
        InputAdornment,
        IconButton,
        Chip,
        Card,
        CardContent,
        CardActions
    } from '@mui/material';
    import { Visibility, VisibilityOff, ContentCopy, Share, Key } from '@mui/icons-material';
    import { styled } from '@mui/material/styles';

    const StyledCard = styled(Card)(({ theme }) => ({
        maxWidth: 600,
        margin: '20px auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
    }));

    const SecretKeyCard = styled(Paper)(({ theme }) => ({
        padding: '20px',
        margin: '10px 0',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.2)',
    }));

    // Базовый URL API
    const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

    const AdminSecretKey = () => {
        const { currentUser } = useSelector(state => state.user);
        const [secretKey, setSecretKey] = useState('');
        const [showKey, setShowKey] = useState(false);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');
        const [copied, setCopied] = useState(false);

        const fetchSecretKey = useCallback(async () => {
            if (!currentUser || currentUser.adminLevel !== 'SuperAdmin') {
                setError('Доступ запрещен. Только главный администратор может просматривать секретный ключ.');
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get(`${BASE_URL}/Admin/secret/${currentUser._id}`);
                setSecretKey(response.data.secretKey);
            } catch (error) {
                console.error('Ошибка при получении секретного ключа:', error);
                setError('Не удалось получить секретный ключ');
            } finally {
                setLoading(false);
            }
        }, [currentUser]);

        useEffect(() => {
            fetchSecretKey();
        }, [fetchSecretKey]);

        const copyToClipboard = () => {
            navigator.clipboard.writeText(secretKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        const shareRegistrationLink = () => {
            const registrationUrl = `${window.location.origin}/secret-admin-register`;
            const shareText = `Ссылка для регистрации нового администратора:\n\n${registrationUrl}\n\nСекретный ключ: ${secretKey}\n\n⚠️ Не передавайте эту информацию посторонним!`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Регистрация администратора',
                    text: shareText,
                });
            } else {
                navigator.clipboard.writeText(shareText);
                alert('Информация скопирована в буфер обмена!');
            }
        };

        if (!currentUser || currentUser.adminLevel !== 'SuperAdmin') {
            return (
                <Box p={3}>
                    <Alert severity="error">
                        <strong>Доступ запрещен!</strong><br />
                        Только главный администратор может просматривать секретный ключ.
                    </Alert>
                </Box>
            );
        }

        return (
            <Box p={3}>
                <StyledCard>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Key sx={{ mr: 2, fontSize: 30 }} />
                            <Typography variant="h4" component="h1">
                                Секретный Ключ Администратора
                            </Typography>
                        </Box>

                        <Typography variant="body1" paragraph sx={{ opacity: 0.9 }}>
                            Этот ключ необходим для регистрации новых администраторов в системе.
                            Передавайте его только доверенным лицам.
                        </Typography>

                        <Chip 
                            label={`Ваш уровень: ${currentUser.adminLevel}`} 
                            color="secondary" 
                            sx={{ mb: 3, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />

                        {loading ? (
                            <Typography>Загрузка...</Typography>
                        ) : error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {typeof error === 'string' ? error : error.message || 'Неизвестная ошибка'}
                            </Alert>
                        )}

                        <SecretKeyCard elevation={0}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                                🔑 Секретный ключ:
                            </Typography>
                            
                            <TextField
                                fullWidth
                                value={secretKey}
                                type={showKey ? 'text' : 'password'}
                                variant="outlined"
                                InputProps={{
                                    readOnly: true,
                                    style: { 
                                        backgroundColor: 'rgba(255,255,255,0.9)', 
                                        borderRadius: '8px',
                                        fontFamily: 'monospace',
                                        fontSize: '14px'
                                    },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowKey(!showKey)}
                                                edge="end"
                                            >
                                                {showKey ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                            <IconButton
                                                onClick={copyToClipboard}
                                                edge="end"
                                                color={copied ? 'success' : 'default'}
                                            >
                                                <ContentCopy />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mt: 1 }}
                            />
                            
                            {copied && (
                                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                                    ✅ Скопировано в буфер обмена!
                                </Typography>
                            )}
                        </SecretKeyCard>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', p: 3 }}>
                        <Button
                            variant="contained"
                            onClick={shareRegistrationLink}
                            startIcon={<Share />}
                            sx={{ 
                                backgroundColor: 'rgba(255,255,255,0.2)', 
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' } 
                            }}
                        >
                            Поделиться ссылкой
                        </Button>
                        
                        <Button
                            variant="outlined"
                            href="/secret-admin-register"
                            target="_blank"
                            sx={{ 
                                borderColor: 'rgba(255,255,255,0.5)', 
                                color: 'white',
                                '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' } 
                            }}
                        >
                            Открыть страницу регистрации
                        </Button>
                    </CardActions>
                </StyledCard>

                <Alert severity="warning" sx={{ mt: 3, maxWidth: 600, margin: '20px auto' }}>
                    <strong>Важная информация:</strong>
                    <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                        <li>Никогда не передавайте секретный ключ посторонним</li>
                        <li>Регистрация новых админов доступна только по ссылке: <code>/secret-admin-register</code></li>
                        <li>Все зарегистрированные через этот ключ администраторы будут иметь уровень доступа "Admin"</li>
                        <li>Вы можете отслеживать всех созданных администраторов в разделе управления пользователями</li>
                    </ul>
                </Alert>
            </Box>
        );
    };

    export default AdminSecretKey; 