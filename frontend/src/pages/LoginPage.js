import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Container, 
    Paper, 
    Typography, 
    Button, 
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    AppBar,
    Toolbar,
    IconButton
} from '@mui/material';
import {
    School,
    Person,
    Home,
    Login as LoginIcon,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';
import { loginUser } from '../redux/userRelated/userHandle';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { themeMode, colors } = useTheme();
    const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);
    
    const [selectedRole, setSelectedRole] = useState('Student');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rollNumber: ''
    });

    const roles = ['Student', 'Teacher', 'Admin'];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let fields;
        if (selectedRole === 'Student') {
            fields = {
                rollNum: formData.rollNumber,
                name: formData.email, 
                password: formData.password
            };
        } else {
            fields = {
                email: formData.email,
                password: formData.password
            };
        }

        dispatch(loginUser(fields, selectedRole));
    };

    React.useEffect(() => {
        if (status === 'success' && currentUser && currentRole) {
            setLoading(false);
            if (currentRole === 'Admin') {
                navigate('/Admin/dashboard');
            } else if (currentRole === 'Student') {
                navigate('/Student/dashboard');
            } else if (currentRole === 'Teacher') {
                navigate('/Teacher/dashboard');
            }
        } else if (status === 'failed') {
            setLoading(false);
        }
    }, [status, currentUser, currentRole, navigate]);

    const isFormValid = () => {
        if (selectedRole === 'Student') {
            return formData.rollNumber && formData.password;
        }
        return formData.email && formData.password;
    };

    return (
        <PageContainer>
            {/* Header */}
            <StyledAppBar position="fixed">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        component={Link}
                        to="/"
                        sx={{ mr: 2 }}
                    >
                        <Home />
                    </IconButton>
                    <School sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 300 }}>
                        School Management System - Login
                    </Typography>
                </Toolbar>
            </StyledAppBar>

            <Container maxWidth="sm" sx={{ py: 12 }}>
                <LoginCard elevation={3}>
                    <CardContent sx={{ p: 4 }}>
                        {/* Header */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Person sx={{ fontSize: 60, color: colors.primary, mb: 2 }} />
                            <Typography variant="h4" sx={{ 
                                fontWeight: 300, 
                                mb: 1,
                                color: colors.text.primary
                            }}>
                                Welcome Back
                            </Typography>
                            <Typography variant="body1" sx={{ 
                                color: colors.text.secondary
                            }}>
                                Sign in to your account
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {typeof error === 'string' ? error : error.message || 'Login failed'}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <Box sx={{ mb: 3 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        label="Role"
                                    >
                                        {roles.map(role => (
                                            <MenuItem key={role} value={role}>{role}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            {selectedRole === 'Student' ? (
                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        fullWidth
                                        label="Roll Number"
                                        value={formData.rollNumber}
                                        onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                                        required
                                        variant="outlined"
                                    />
                                </Box>
                            ) : (
                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                        variant="outlined"
                                    />
                                </Box>
                            )}

                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        )
                                    }}
                                />
                            </Box>

                            {/* Demo Credentials Info */}
                            <Alert severity="info" sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Demo Credentials:</strong>
                                </Typography>
                                <Typography variant="body2">
                                    Admin: admin@school.com / admin123<br/>
                                    Student: Roll Number: 1, Name: Демо Студент / student123
                                </Typography>
                            </Alert>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading || !isFormValid()}
                                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                                sx={{
                                    py: 1.5,
                                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                                    mb: 2
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="textSecondary" paragraph>
                                    Don't have an account?
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <Button
                                        component={Link}
                                        to="/student-registration"
                                        variant="outlined"
                                        size="small"
                                    >
                                        Register as Student
                                    </Button>
                                    <Button
                                        component={Link}
                                        to="/teacher-application"
                                        variant="outlined"
                                        size="small"
                                    >
                                        Apply as Teacher
                                    </Button>
                                </Box>
                            </Box>
                        </form>
                    </CardContent>
                </LoginCard>
            </Container>
        </PageContainer>
    );
};

export default LoginPage;

// Styled Components
const PageContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: theme.palette.mode === 'light' 
        ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
        : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    backdropFilter: 'blur(20px)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
}));

const LoginCard = styled(Card)(({ theme }) => ({
    borderRadius: 16,
    background: theme.palette.mode === 'light'
        ? 'rgba(255, 255, 255, 0.95)'
        : 'rgba(26, 26, 26, 0.95)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.palette.mode === 'light'
        ? '0px 16px 48px rgba(139, 21, 56, 0.08)'
        : '0px 16px 48px rgba(0, 0, 0, 0.4)'
})); 