import * as React from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Grid, Box, Typography, Paper, CssBaseline, Alert, Button} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Security, Key, AdminPanelSettings } from '@mui/icons-material';
import bgpic from "../../assets/designlogin.jpg"
import { LightPurpleButton } from '../../components/buttonStyles';
import styled from 'styled-components';

const defaultTheme = createTheme();

const AdminRegisterPage = () => {
    const navigate = useNavigate()
    const { currentUser, currentRole } = useSelector(state => state.user);

    useEffect(() => {
        if (currentUser !== null && currentRole === 'Admin') {
            navigate('/Admin/dashboard');
        }
    }, [currentUser, currentRole, navigate]);

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Box display="flex" alignItems="center" mb={3}>
                            <Security sx={{ mr: 2, fontSize: 40, color: "#2c2143" }} />
                            <Typography variant="h4" sx={{ color: "#2c2143" }}>
                                Система Администрирования
                            </Typography>
                        </Box>

                        <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                🔐 Новая система безопасности!
                            </Typography>
                            <Typography variant="body2">
                                Регистрация администраторов теперь происходит только через секретный ключ 
                                для повышения безопасности системы.
                            </Typography>
                        </Alert>

                        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5', width: '100%' }}>
                            <Box display="flex" alignItems="center" mb={2}>
                                <AdminPanelSettings sx={{ mr: 2, color: '#1976d2' }} />
                                <Typography variant="h6">
                                    Главный Администратор
                                </Typography>
                            </Box>
                            <Typography variant="body2" paragraph>
                                <strong>Email:</strong> admin@school.com<br />
                                <strong>Пароль:</strong> admin123<br />
                                <strong>Уровень:</strong> SuperAdmin
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Используйте эти данные для первого входа в систему
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#fff3e0', width: '100%' }}>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Key sx={{ mr: 2, color: '#ff9800' }} />
                                <Typography variant="h6">
                                    Регистрация новых админов
                                </Typography>
                            </Box>
                            <Typography variant="body2" paragraph>
                                1. Войдите как главный администратор<br />
                                2. Получите секретный ключ в админ-панели<br />
                                3. Используйте специальную ссылку для регистрации
                            </Typography>
                            <Button
                                variant="outlined"
                                href="/secret-admin-register"
                                target="_blank"
                                startIcon={<Key />}
                                sx={{ mt: 1 }}
                            >
                                Секретная регистрация
                            </Button>
                        </Paper>

                        <Box sx={{ width: '100%' }}>
                            <LightPurpleButton
                                component={Link}
                                to="/Adminlogin"
                                fullWidth
                                variant="contained"
                                sx={{ mb: 2 }}
                            >
                                Войти как администратор
                            </LightPurpleButton>
                            
                            <Grid container justifyContent="space-between">
                                <Grid item>
                                    <StyledLink to="/">
                                        ← На главную
                                    </StyledLink>
                                </Grid>
                                <Grid item>
                                    <StyledLink to="/choose">
                                        Выбрать роль →
                                    </StyledLink>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Grid>
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: `url(${bgpic})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            </Grid>
        </ThemeProvider>
    );
}

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #7f56da;
  &:hover {
    text-decoration: underline;
  }
`;

export default AdminRegisterPage;
