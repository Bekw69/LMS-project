import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authLogout } from '../redux/userRelated/userSlice';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Container,
    Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExitToApp, Cancel } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const LogoutContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    background: theme.palette.mode === 'light'
        ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        : 'linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)',
    padding: theme.spacing(2),
}));

const LogoutCard = styled(Card)(({ theme }) => ({
    maxWidth: 400,
    margin: '0 auto',
    padding: theme.spacing(3),
    borderRadius: 24,
    background: theme.palette.mode === 'light'
        ? 'rgba(255, 255, 255, 0.9)'
        : 'rgba(26, 26, 26, 0.9)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.palette.mode === 'light'
        ? '0px 16px 48px rgba(139, 21, 56, 0.08)'
        : '0px 16px 48px rgba(0, 0, 0, 0.4)',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 80,
    height: 80,
    margin: '0 auto 16px',
    backgroundColor: '#f44336',
    boxShadow: theme.palette.mode === 'light'
        ? '0px 8px 24px rgba(139, 21, 56, 0.15)'
        : '0px 8px 24px rgba(0, 0, 0, 0.4)',
}));

const Logout = () => {
    const theme = useTheme();
    const currentUser = useSelector(state => state.user.currentUser);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(authLogout());
        navigate('/');
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <LogoutContainer theme={theme}>
            <Container maxWidth="sm">
                <LogoutCard theme={theme}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <StyledAvatar theme={theme}>
                            <ExitToApp fontSize="large" />
                        </StyledAvatar>
                        
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {currentUser?.name}
                        </Typography>
                        
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Вы уверены, что хотите выйти?
                        </Typography>

                        <Button
                            variant="contained"
                            startIcon={<ExitToApp />}
                            onClick={handleLogout}
                            fullWidth
                            sx={{
                                mt: 2,
                                p: 1.5,
                                backgroundColor: '#f44336',
                                '&:hover': {
                                    backgroundColor: '#d32f2f',
                                }
                            }}
                        >
                            Выйти
                        </Button>
                        
                        <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={handleCancel}
                            fullWidth
                            sx={{
                                mt: 2,
                                p: 1.5,
                            }}
                        >
                            Отмена
                        </Button>
                    </CardContent>
                </LogoutCard>
            </Container>
        </LogoutContainer>
    );
};

export default Logout;
